import logging
import re
import math
import adif_io
from flask import current_app
from pyhamtools.locator import latlong_to_locator, locator_to_latlong
from .grid_validator import validate_grid_square

logger = logging.getLogger(__name__)


# ==================== DISTANCE CALCULATION ====================

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points using Haversine formula.
    
    Args:
        lat1: Latitude of first point in degrees
        lon1: Longitude of first point in degrees
        lat2: Latitude of second point in degrees
        lon2: Longitude of second point in degrees
        
    Returns:
        Distance in kilometers, rounded to nearest integer
    """
    R = 6371  # Earth's radius in kilometers
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return round(distance)  # Return distance in km, rounded to nearest integer


# ==================== LOG FORMAT DETECTION ====================

def detect_log_format(content):
    """
    Detect if content is ADIF or Cabrillo format.
    
    Args:
        content: Log file content as string
        
    Returns:
        'cabrillo' or 'adif'
    """
    content_stripped = content.strip()
    content_upper = content_stripped.upper()
    
    # Check for Cabrillo markers
    if content_upper.startswith('START-OF-LOG'):
        return 'cabrillo'
    
    # Check for ADIF markers
    if '<EOH>' in content_upper or '<EOR>' in content_upper:
        return 'adif'
    
    # Check for QSO: lines (Cabrillo)
    if re.search(r'^QSO:\s+\d+', content_stripped, re.MULTILINE):
        return 'cabrillo'
    
    # Check for ADIF field patterns
    if re.search(r'<\w+:\d+>', content_stripped):
        return 'adif'
    
    # Default to ADIF
    return 'adif'


# ==================== CABRILLO PARSER ====================

class CabrilloParser:
    """Parser for Cabrillo contest log format."""
    
    # Frequency ranges in kHz mapped to band designations
    FREQ_TO_BAND = [
        ((1800, 2000), '160m'),
        ((3500, 4000), '80m'),
        ((5330, 5410), '60m'),
        ((7000, 7300), '40m'),
        ((10100, 10150), '30m'),
        ((14000, 14350), '20m'),
        ((18068, 18168), '17m'),
        ((21000, 21450), '15m'),
        ((24890, 24990), '12m'),
        ((28000, 29700), '10m'),
        ((50000, 54000), '6m'),
        ((70000, 70500), '4m'),
        ((144000, 148000), '2m'),
        ((420000, 450000), '70cm'),
        ((1240000, 1300000), '23cm'),
    ]
    
    def parse(self, content):
        """
        Parse Cabrillo content to list of QSO dictionaries.
        
        Args:
            content: Cabrillo file content as string
            
        Returns:
            List of QSO dictionaries in ADIF-like format
        """
        qsos = []
        
        for line in content.split('\n'):
            line = line.strip()
            
            # Skip empty lines and non-QSO lines
            if not line or not line.upper().startswith('QSO:'):
                continue
            
            try:
                qso = self._parse_qso_line(line)
                if qso:
                    qsos.append(qso)
            except Exception as e:
                logger.warning(f"Failed to parse Cabrillo QSO line: {line} - {e}")
                continue
        
        return qsos
    
    def _parse_qso_line(self, line):
        """
        Parse single QSO: line from Cabrillo format.
        
        Cabrillo QSO format varies by contest, but common structure is:
        QSO: freq mode date time mycall rst exch theircall rst exch
        
        Args:
            line: Single QSO line from Cabrillo file
            
        Returns:
            Dictionary with ADIF-like field names or None if parsing fails
        """
        # Remove 'QSO:' prefix and split by whitespace
        parts = line[4:].split()
        
        if len(parts) < 8:
            logger.warning(f"Cabrillo QSO line has too few fields: {line}")
            return None
        
        try:
            # Common Cabrillo format:
            # freq mode date time mycall rst sent_exch theircall rst rcvd_exch
            freq_khz = int(parts[0])
            mode = parts[1].upper()
            date_str = parts[2]  # YYYY-MM-DD format
            time_str = parts[3]  # HHMM format
            # mycall = parts[4]
            # my_rst = parts[5]
            # my_exch = parts[6]
            their_call = parts[7].upper()
            # their_rst = parts[8] if len(parts) > 8 else ''
            # their_exch = parts[9] if len(parts) > 9 else ''
            
            # Convert date from YYYY-MM-DD to YYYYMMDD (ADIF format)
            qso_date = date_str.replace('-', '')
            
            # Time is already in HHMM format
            time_on = time_str.replace(':', '')[:4]  # Ensure 4 digits
            
            # Convert frequency to band
            band = self._freq_to_band(freq_khz)
            
            # Normalize mode
            mode = self._normalize_mode(mode)
            
            return {
                'CALL': their_call,
                'QSO_DATE': qso_date,
                'TIME_ON': time_on,
                'MODE': mode,
                'BAND': band,
                'GRIDSQUARE': '',  # Cabrillo doesn't have grid, will be resolved later
                'FREQ': str(freq_khz)  # Keep original frequency for reference
            }
            
        except (ValueError, IndexError) as e:
            logger.warning(f"Error parsing Cabrillo QSO fields: {line} - {e}")
            return None
    
    def _freq_to_band(self, freq_khz):
        """
        Convert frequency in kHz to band designation.
        
        Args:
            freq_khz: Frequency in kHz
            
        Returns:
            Band designation string (e.g., '20m', '40m')
        """
        for (low, high), band in self.FREQ_TO_BAND:
            if low <= freq_khz <= high:
                return band
        
        # If not found in ranges, try to guess from frequency
        if freq_khz < 30000:
            # HF - estimate based on frequency
            if freq_khz < 3000:
                return '160m'
            elif freq_khz < 5000:
                return '80m'
            elif freq_khz < 8000:
                return '40m'
            elif freq_khz < 12000:
                return '30m'
            elif freq_khz < 16000:
                return '20m'
            elif freq_khz < 20000:
                return '17m'
            elif freq_khz < 23000:
                return '15m'
            elif freq_khz < 26000:
                return '12m'
            else:
                return '10m'
        elif freq_khz < 100000:
            return '6m'
        elif freq_khz < 200000:
            return '2m'
        elif freq_khz < 500000:
            return '70cm'
        else:
            return '23cm'
    
    def _normalize_mode(self, mode):
        """
        Normalize mode designation to standard format.
        
        Args:
            mode: Mode string from Cabrillo
            
        Returns:
            Normalized mode string
        """
        mode = mode.upper()
        
        # Common Cabrillo mode mappings
        mode_map = {
            'PH': 'SSB',
            'FM': 'FM',
            'CW': 'CW',
            'RY': 'RTTY',
            'RTTY': 'RTTY',
            'DG': 'DIGI',
            'FT8': 'FT8',
            'FT4': 'FT4',
            'SSB': 'SSB',
            'USB': 'SSB',
            'LSB': 'SSB',
            'AM': 'AM',
        }
        
        return mode_map.get(mode, mode)


class CallsignGridResolver:
    """Resolver for obtaining grid squares from callsigns."""
    
    def __init__(self, callinfo=None):
        """
        Initialize with Callinfo provider.
        
        Args:
            callinfo: Optional Callinfo instance (uses current_app.callinfo if not provided)
        """
        self.cic = callinfo or current_app.callinfo
    
    def get_grid_from_call(self, call):
        """
        Get grid square from callsign using callinfo lookup.
        
        Args:
            call: Callsign to lookup
            
        Returns:
            Grid square string or default grid if lookup fails
        """
        try:
            info = self.cic.get_all(call)
            latitude = info.get('latitude', 0)
            longitude = info.get('longitude', 0)
            grid = latlong_to_locator(latitude, longitude)
            return grid
        except (KeyError, Exception):
            # For test callsigns or callsigns that can't be decoded, return default grid
            return "JO60AA"  # Default grid square for unknown callsigns


class BandColorMapper:
    """Maps amateur radio bands to display colors."""
    
    BAND_COLORS = {
        '2200m': '#ff4500',  # Orange Red
        '600m': '#1e90ff',   # Dodger Blue
        '160m': '#7cfc00',   # Lawn Green
        '80m': '#e550e5',    # Purple
        '60m': '#00008b',    # Dark Blue
        '40m': '#5959ff',    # Blue
        '30m': '#62d962',    # Light Green
        '20m': '#f2c40c',    # Yellow
        '17m': '#f2f261',    # Light Yellow
        '15m': '#cca166',    # Tan
        '12m': '#b22222',    # Firebrick
        '10m': '#ff69b4',    # Hot Pink
        '6m': '#FF0000',     # Red
        '4m': '#cc0044',     # Deep Red
        '2m': '#FF1493',     # Deep Pink
        '70cm': '#999900',   # Olive
        '23cm': '#5AB8C7',   # Turquoise
        '13cm': '#A52A2A',   # Brown
        '3cm': '#808080',    # Gray
        '1.25cm': '#000000',  # Black
        '2.4ghz': '#FF7F50',  # Coral
        '10ghz': '#696969',   # Dim Gray
        'invalid': '#808080'  # Gray
    }
    
    @staticmethod
    def get_color(band):
        """Get color for band."""
        return BandColorMapper.BAND_COLORS.get(band.lower(), '#808080')


class LogFileProcessor:
    """Processor for reading and enhancing amateur radio log files."""
    
    def __init__(self, my_latitude=None, my_longitude=None):
        """Initialize with required dependencies."""
        self.grid_resolver = CallsignGridResolver()
        self.color_mapper = BandColorMapper()
        self.cabrillo_parser = CabrilloParser()
        self.my_latitude = my_latitude
        self.my_longitude = my_longitude
    
    def process(self, file_content):
        """
        Read and enhance amateur radio log file.
        Automatically detects format (ADIF or Cabrillo).
        
        Args:
            file_content: Log file content as string (ADIF or Cabrillo)
            
        Returns:
            List of enhanced QSO dictionaries with grid, DXCC, and coordinate info
        """
        # Auto-detect format
        log_format = detect_log_format(file_content)
        logger.info(f"Detected log format: {log_format}")
        
        # Parse based on format
        if log_format == 'cabrillo':
            raw_qsos = self.cabrillo_parser.parse(file_content)
        else:
            raw_qsos, header = adif_io.read_from_string(file_content)
        
        # Enhance all QSOs
        enhanced_qsos = []
        for qso in raw_qsos:
            enhanced_qso = self._enhance_qso(qso)
            enhanced_qsos.append(enhanced_qso)
        
        logger.info(f"Processed {len(enhanced_qsos)} QSOs from {log_format} file")
        return enhanced_qsos
    
    def _enhance_qso(self, qso):
        """
        Enhance single QSO record with additional data.
        
        Args:
            qso: QSO record from ADIF file
            
        Returns:
            Enhanced QSO dictionary
        """
        call = qso.get('CALL', '')
        
        # Get callsign info
        info = self._get_callsign_info(call)
        
        # Extract basic QSO data
        date = qso.get('QSO_DATE', '')
        time = qso.get('TIME_ON', '')
        mode = qso.get('MODE', '')
        band = qso.get('BAND', '').lower()
        grid = qso.get('GRIDSQUARE', '')
        dxcc = info.get('country', 'Unknown')
        
        # Resolve grid square
        grid = self._resolve_grid(call, grid)
        
        # Convert grid to coordinates
        latitude, longitude = locator_to_latlong(grid)
        
        # Calculate distance if user location is available
        distance = None
        if self.my_latitude is not None and self.my_longitude is not None:
            distance = calculate_distance(
                self.my_latitude,
                self.my_longitude,
                latitude,
                longitude
            )
        
        return {
            'call': call,
            'date': date,
            'time': time,
            'mode': mode,
            'band': band,
            'grid': grid,
            'dxcc': dxcc,
            'latitude': latitude,
            'longitude': longitude,
            'color': self.color_mapper.get_color(band),
            'distance': distance
        }
    
    def _get_callsign_info(self, call):
        """
        Get callsign information with error handling.
        
        Args:
            call: Callsign to lookup
            
        Returns:
            Dictionary with callsign info or defaults
        """
        try:
            
            return self.grid_resolver.cic.get_all(call)
        except (KeyError, Exception) as e:
            logger.exception(f"Error getting callsign info for {call}: {e}")
            return {'country': 'Unknown', 'latitude': 0, 'longitude': 0}
    
    def _resolve_grid(self, call, grid):
        """
        Resolve grid square from QSO or callsign.
        
        Args:
            call: Callsign
            grid: Grid square from QSO
            
        Returns:
            Valid grid square
        """
        if not grid:
            grid = self.grid_resolver.get_grid_from_call(call)
        
        if not validate_grid_square(grid):
            grid = self.grid_resolver.get_grid_from_call(call)
        
        return grid


# Public API functions for backwards compatibility
def read_log_file(file_content, my_latitude=None, my_longitude=None):
    """
    Read and enhance amateur radio log file.
    
    This is a convenience function that uses LogFileProcessor internally.
    
    Args:
        file_content: ADIF file content as string
        my_latitude: User's latitude (optional, for distance calculation)
        my_longitude: User's longitude (optional, for distance calculation)
        
    Returns:
        List of enhanced QSO dictionaries with grid, DXCC, and coordinate info
    """
    processor = LogFileProcessor(my_latitude, my_longitude)
    return processor.process(file_content)


def get_band_color(band):
    """
    Get color for band.
    
    This is a convenience function for backwards compatibility.
    
    Args:
        band: Band designation
        
    Returns:
        Color hex code
    """
    return BandColorMapper.get_color(band)

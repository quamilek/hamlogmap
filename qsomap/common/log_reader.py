import logging
import adif_io
from flask import current_app
from pyhamtools.locator import latlong_to_locator, locator_to_latlong
from .grid_validator import validate_grid_square

logger = logging.getLogger(__name__)


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
    
    def __init__(self):
        """Initialize with required dependencies."""
        self.grid_resolver = CallsignGridResolver()
        self.color_mapper = BandColorMapper()
    
    def process(self, file_content):
        """
        Read and enhance amateur radio log file.
        
        Args:
            file_content: ADIF file content as string
            
        Returns:
            List of enhanced QSO dictionaries with grid, DXCC, and coordinate info
        """
        qsos, header = adif_io.read_from_string(file_content)
        enhanced_qsos = []
        
        for qso in qsos:
            enhanced_qso = self._enhance_qso(qso)
            enhanced_qsos.append(enhanced_qso)
        
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
            'color': self.color_mapper.get_color(band)
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
def read_log_file(file_content):
    """
    Read and enhance amateur radio log file.
    
    This is a convenience function that uses LogFileProcessor internally.
    
    Args:
        file_content: ADIF file content as string
        
    Returns:
        List of enhanced QSO dictionaries with grid, DXCC, and coordinate info
    """
    processor = LogFileProcessor()
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

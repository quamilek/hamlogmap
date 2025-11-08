import adif_io
from pyhamtools import LookupLib, Callinfo
from pyhamtools.locator import latlong_to_locator, locator_to_latlong
from .grid_validator import validate_grid_square

my_lookuplib = LookupLib(lookuptype="countryfile")
cic = Callinfo(my_lookuplib)

def get_band_color(band):
    band_colors = {
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
        '1.25cm': '#000000', # Black
        '2.4ghz': '#FF7F50', # Coral
        '10ghz': '#696969',  # Dim Gray
        'invalid': '#808080' # Gray
    }
    return band_colors.get(band.lower(), '#808080')  # Default to gray if band not found

def get_grid_from_call(call):
    # Get call sign information using pyhamtools library
    try:
        info = cic.get_all(call)
        latitude = info.get('latitude', 0)
        longitude = info.get('longitude', 0)
        grid = latlong_to_locator(latitude, longitude)
        return grid
    except (KeyError, Exception):
        # For test callsigns or callsigns that can't be decoded, return default grid
        return "JO60AA"  # Default grid square for unknown callsigns

def read_log_file(file_content):
    # Read amateur radio log file using adif_io library
    qsos, header = adif_io.read_from_string(file_content)
    enhanced_qsos = []
    for qso in qsos:
        call = qso.get('CALL', '')

        # Safely get callsign info, handle test callsigns
        try:
            info = cic.get_all(call)
        except (KeyError, Exception):
            # For test callsigns or callsigns that can't be decoded
            info = {'country': 'Unknown', 'latitude': 0, 'longitude': 0}

        date = qso.get('QSO_DATE', '')
        time = qso.get('TIME_ON', '')
        mode = qso.get('MODE', '')
        band = qso.get('BAND', '').lower()  # Convert band to lowercase
        grid = qso.get('GRIDSQUARE', '')
        dxcc = info.get('country', 'Unknown')


        if not grid:
            # If grid square is not provided, estimate it from call sign
            grid = get_grid_from_call(call)

        # Validate grid square format
        if not validate_grid_square(grid):
            # If grid is invalid, try to get it from call sign
            grid = get_grid_from_call(call)

        latitude, longitude = locator_to_latlong(grid)
        enhanced_qso = {
            'call': call,
            'date': date,
            'time': time,
            'mode': mode,
            'band': band,
            'grid': grid,
            'dxcc': dxcc,
            'latitude': latitude,
            'longitude': longitude,
            'color': get_band_color(band)
        }
        enhanced_qsos.append(enhanced_qso)
       # print(f"\ncall: {call}, date: {date}, time: {time}, mode: {mode}, band: {band}, grid: {grid}, dxcc: {dxcc}, latitude: {latitude}, longitude: {longitude}")
    return enhanced_qsos
    # print(qso_list)

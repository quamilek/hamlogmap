import adif_io
from pyhamtools import LookupLib, Callinfo
from pyhamtools.locator import latlong_to_locator, locator_to_latlong

my_lookuplib = LookupLib(lookuptype="countryfile")
cic = Callinfo(my_lookuplib)

def get_grid_and_dxcc(call):
    # Odczytanie informacji o znaku za pomocą biblioteki pyhamtools
    info = cic.get_all(call)
    latitude = info.get('latitude', 0)
    longitude = info.get('longitude', 0)
    grid = latlong_to_locator(latitude, longitude)
    dxcc = info.get('country', '')

    # return "JO82MH"
    return grid, dxcc

def read_log_file(file_content):
    # Odczytanie pliku logu krótkofalarskiego za pomocą biblioteki adif_io
    qsos, header = adif_io.read_from_string(file_content)
    enhanced_qsos = []
    for qso in qsos:
        call = qso.get('CALL', '')
        date = qso.get('QSO_DATE', '')
        time = qso.get('TIME_ON', '')
        mode = qso.get('MODE', '')
        band = qso.get('BAND', '')
        grid = qso.get('GRIDSQUARE', '')
        if not grid:
            grid, dxcc = get_grid_and_dxcc(call)

        # dxcc = qso.get('DXCC', '')
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
            'longitude': longitude
        }
        enhanced_qsos.append(enhanced_qso)
        print(f"\ncall: {call}, date: {date}, time: {time}, mode: {mode}, band: {band}, grid: {grid}, dxcc: {dxcc}, latitude: {latitude}, longitude: {longitude}")
        # import ipdb; ipdb.set_trace()
    return enhanced_qsos
    # print(qso_list) 
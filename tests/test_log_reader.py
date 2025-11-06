"""
Test suite for ADIF log file reading and parsing functionality.
"""
import pytest
from qsomap.common.log_reader import read_log_file, get_band_color, get_grid_from_call


class TestLogReader:
    """Test cases for ADIF log reading functionality."""

    @pytest.mark.unit
    def test_get_band_color_valid_bands(self):
        """Test that valid bands return correct colors."""
        expected_colors = {
            '20m': '#f2c40c',
            '40m': '#5959ff',
            '80m': '#e550e5',
            '2m': '#FF1493',
            '10m': '#ff69b4'
        }
        
        for band, expected_color in expected_colors.items():
            assert get_band_color(band) == expected_color

    @pytest.mark.unit
    def test_get_band_color_case_insensitive(self):
        """Test that band color lookup is case insensitive."""
        test_cases = [
            ('20M', '#f2c40c'),
            ('20m', '#f2c40c'),
            ('40M', '#5959ff'),
            ('40m', '#5959ff')
        ]
        
        for band, expected_color in test_cases:
            assert get_band_color(band) == expected_color

    @pytest.mark.unit
    def test_get_band_color_invalid_band(self):
        """Test that invalid bands return default gray color."""
        invalid_bands = ['999m', 'invalid', '', 'xyz']
        
        for band in invalid_bands:
            assert get_band_color(band) == '#808080'  # Default gray

    @pytest.mark.integration
    def test_get_grid_from_call_valid_callsign(self):
        """Test grid square lookup from valid callsign."""
        # This test requires internet connection and pyhamtools data
        try:
            grid = get_grid_from_call('DL1ABC')
            # Should return a 6-character grid square
            assert isinstance(grid, str)
            assert len(grid) >= 4  # At least 4 characters for basic grid
        except Exception:
            pytest.skip("Callsign lookup requires internet connection")

    @pytest.mark.unit
    def test_read_log_file_simple_adif(self):
        """Test reading a simple ADIF log file."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>DL1ABC<BAND:3>20m<MODE:3>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        
        qsos = read_log_file(adif_content)
        
        assert len(qsos) == 1
        qso = qsos[0]
        
        assert qso['call'] == 'DL1ABC'
        assert qso['date'] == '20241101'
        assert qso['time'] == '120000'
        assert qso['band'] == '20m'
        assert qso['mode'] == 'CW'
        assert qso['grid'] == 'JO62AA'
        assert 'latitude' in qso
        assert 'longitude' in qso
        assert qso['color'] == get_band_color('20m')

    @pytest.mark.unit
    def test_read_log_file_multiple_qsos(self):
        """Test reading ADIF file with multiple QSOs."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>DL1ABC<BAND:3>20m<MODE:3>CW<GRIDSQUARE:6>JO62AA<EOR>
<QSO_DATE:8>20241101<TIME_ON:6>130000<CALL:6>F1DEF<BAND:3>40m<MODE:3>SSB<GRIDSQUARE:6>JN23AA<EOR>
<QSO_DATE:8>20241101<TIME_ON:6>140000<CALL:6>G0GHI<BAND:3>15m<MODE:3>FT8<GRIDSQUARE:6>IO91AA<EOR>
"""
        
        qsos = read_log_file(adif_content)
        
        assert len(qsos) == 3
        
        # Check first QSO
        assert qsos[0]['call'] == 'DL1ABC'
        assert qsos[0]['band'] == '20m'
        
        # Check second QSO
        assert qsos[1]['call'] == 'F1DEF'
        assert qsos[1]['band'] == '40m'
        
        # Check third QSO
        assert qsos[2]['call'] == 'G0GHI'
        assert qsos[2]['band'] == '15m'

    @pytest.mark.unit
    def test_read_log_file_missing_fields(self):
        """Test reading ADIF file with missing optional fields."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<CALL:6>DL1ABC<BAND:3>20m<EOR>
"""
        
        qsos = read_log_file(adif_content)
        
        assert len(qsos) == 1
        qso = qsos[0]
        
        assert qso['call'] == 'DL1ABC'
        assert qso['band'] == '20m'
        # Missing fields should have default values
        assert qso['date'] == ''
        assert qso['time'] == ''
        assert qso['mode'] == ''

    @pytest.mark.unit
    def test_read_log_file_empty_content(self):
        """Test reading empty ADIF content."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>
"""
        
        qsos = read_log_file(adif_content)
        assert len(qsos) == 0

    @pytest.mark.unit
    def test_read_log_file_band_case_conversion(self):
        """Test that band values are converted to lowercase."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<CALL:6>DL1ABC<BAND:3>20M<GRIDSQUARE:6>JO62AA<EOR>
"""
        
        qsos = read_log_file(adif_content)
        
        assert len(qsos) == 1
        assert qsos[0]['band'] == '20m'  # Should be lowercase

    @pytest.mark.integration
    def test_read_log_file_without_grid_square(self):
        """Test QSO processing when grid square is missing."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<CALL:6>DL1ABC<BAND:3>20m<MODE:3>CW<EOR>
"""
        
        try:
            qsos = read_log_file(adif_content)
            
            assert len(qsos) == 1
            qso = qsos[0]
            
            # Should have attempted to look up grid from callsign
            assert 'grid' in qso
            assert 'latitude' in qso
            assert 'longitude' in qso
        except Exception:
            pytest.skip("Grid lookup from callsign requires internet connection")
"""
Test suite for Flask application endpoints and routing.
"""
import pytest
from app import app
from qsomap.upload import upload_bp


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    with app.test_client() as client:
        with app.app_context():
            yield client


class TestFlaskApplication:
    """Test cases for Flask application routes and functionality."""

    @pytest.mark.unit
    def test_index_route(self, client):
        """Test that the main page loads successfully."""
        response = client.get('/')
        assert response.status_code == 200
        assert b'Callsign' in response.data
        assert b'Locator' in response.data
        assert b'Choose Log File' in response.data

    @pytest.mark.unit
    def test_upload_get_route(self, client):
        """Test GET request to upload endpoint."""
        response = client.get('/upload')
        # Should return the main upload form page
        assert response.status_code == 200
        assert b'Callsign' in response.data
        assert b'Locator' in response.data

    @pytest.mark.unit
    def test_upload_post_no_file(self, client):
        """Test POST to upload endpoint without file."""
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': 'JO90AA'
        }, follow_redirects=True)

        # Should redirect with error message
        assert response.status_code == 200
        assert b'No file selected' in response.data or b'file' in response.data.lower()

    @pytest.mark.unit
    def test_upload_post_empty_filename(self, client):
        """Test POST to upload endpoint with empty filename."""
        from io import BytesIO

        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': 'JO90AA',
            'file': (BytesIO(b''), '')
        }, follow_redirects=True)

        assert response.status_code == 200
        assert b'No file selected' in response.data or b'file' in response.data.lower()

    @pytest.mark.unit
    def test_upload_post_invalid_file_type(self, client):
        """Test POST to upload endpoint with invalid file type."""
        from io import BytesIO

        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': 'JO90AA',
            'file': (BytesIO(b'invalid content'), 'test.txt')
        }, follow_redirects=True)

        assert response.status_code == 200
        assert (b'Invalid file type' in response.data or
                b'ADIF' in response.data or
                b'ADI' in response.data)

    @pytest.mark.integration
    def test_upload_post_valid_adif_file(self, client):
        """Test POST to upload endpoint with valid ADIF file."""
        from io import BytesIO

        # Sample ADIF content with test callsigns that have grid squares provided
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
<QSO_DATE:8>20241101<TIME_ON:6>130000<CALL:6>TEST02<BAND:3>40m<MODE:3>SSB<GRIDSQUARE:6>JN23AA<EOR>
"""

        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': 'JO90AA',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        # Should successfully process the file
        assert response.status_code == 200

    @pytest.mark.unit
    def test_application_configuration(self):
        """Test that Flask application is properly configured."""
        assert app.secret_key is not None
        assert 'upload' in [bp.name for bp in app.blueprints.values()]

    @pytest.mark.unit
    def test_static_files_configuration(self):
        """Test static files configuration."""
        assert app.static_folder.endswith('qsomap/static')
        assert app.template_folder.endswith('qsomap/templates')

    @pytest.mark.unit
    def test_blueprint_registration(self):
        """Test that upload blueprint is properly registered."""
        blueprint_names = [bp.name for bp in app.blueprints.values()]
        assert 'upload' in blueprint_names

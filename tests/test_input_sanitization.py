"""
Test suite for input sanitization functionality.
"""
import pytest
from io import BytesIO
from qsomap.upload import sanitize_text_input
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    with app.test_client() as client:
        with app.app_context():
            yield client


class TestInputSanitization:
    """Test cases for input sanitization functionality."""

    @pytest.mark.unit
    def test_sanitize_text_input_strips_whitespace(self):
        """Test that sanitize_text_input removes leading and trailing whitespace."""
        assert sanitize_text_input('  test  ') == 'test'
        assert sanitize_text_input('\ttest\t') == 'test'
        assert sanitize_text_input('\ntest\n') == 'test'
        assert sanitize_text_input('  test with spaces  ') == 'test with spaces'

    @pytest.mark.unit
    def test_sanitize_text_input_handles_none(self):
        """Test that sanitize_text_input handles None input."""
        assert sanitize_text_input(None) is None

    @pytest.mark.unit
    def test_sanitize_text_input_handles_empty_string(self):
        """Test that sanitize_text_input returns None for empty strings."""
        assert sanitize_text_input('') is None
        assert sanitize_text_input('   ') is None
        assert sanitize_text_input('\t\n') is None

    @pytest.mark.unit
    def test_sanitize_text_input_escapes_html(self):
        """Test that sanitize_text_input escapes HTML characters."""
        assert sanitize_text_input('<script>alert("xss")</script>') == '&lt;script&gt;alert(&#34;xss&#34;)&lt;/script&gt;'
        assert sanitize_text_input('<b>bold</b>') == '&lt;b&gt;bold&lt;/b&gt;'
        assert sanitize_text_input('test & test') == 'test &amp; test'
        assert sanitize_text_input('test "quote" test') == 'test &#34;quote&#34; test'

    @pytest.mark.unit
    def test_sanitize_text_input_normal_text(self):
        """Test that sanitize_text_input preserves normal text."""
        assert sanitize_text_input('SP1ABC') == 'SP1ABC'
        assert sanitize_text_input('JO70fp') == 'JO70fp'
        assert sanitize_text_input('Test 123') == 'Test 123'

    @pytest.mark.unit
    def test_callsign_with_trailing_space(self, client):
        """Test upload with callsign that has trailing whitespace."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': '  SP1ABC  ',  # Callsign with spaces
            'my_locator': 'JO90AA',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Verify the callsign was trimmed in the response
        assert b'SP1ABC' in response.data

    @pytest.mark.unit
    def test_locator_with_trailing_space(self, client):
        """Test upload with locator that has trailing whitespace."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': '  JO90AA  ',  # Locator with spaces
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Should succeed - locator gets trimmed and normalized - check for QSO map page
        assert b'QSO map' in response.data or b'SP0ABC' in response.data

    @pytest.mark.unit
    def test_locator_with_mixed_whitespace(self, client):
        """Test upload with locator that has tabs and newlines."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': '\tJO90AA\n',  # Locator with tab and newline
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Should succeed - locator gets trimmed and normalized - check for QSO map page
        assert b'QSO map' in response.data or b'SP0ABC' in response.data

    @pytest.mark.unit
    def test_empty_callsign_after_trim(self, client):
        """Test upload with callsign that becomes empty after trimming."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': '   ',  # Only whitespace
            'my_locator': 'JO90AA',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        # Callsign is optional at server-side (HTML form has required attribute for UX only)
        # When callsign is only whitespace, sanitization returns None but server accepts it
        assert response.status_code == 200

    @pytest.mark.unit
    def test_empty_locator_after_trim(self, client):
        """Test upload with locator that becomes empty after trimming."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': '   ',  # Only whitespace
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        # Should fail - locator is required
        assert response.status_code == 200
        assert b'Locator field is required' in response.data

    @pytest.mark.unit
    def test_xss_attempt_in_callsign(self, client):
        """Test that XSS attempts in callsign are neutralized."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': '<script>alert("xss")</script>',
            'my_locator': 'JO90AA',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Verify that the script tag is escaped - Flask/Jinja2 auto-escapes by default
        # The escaped callsign should be in the page
        response_text = response.data.decode('utf-8')
        # Script tag should be escaped
        assert '<script>alert("xss")</script>' not in response_text
        # Should have escaped HTML entities OR the page rendered successfully with escaping
        assert '&lt;script&gt;' in response_text or 'QSO map' in response_text

    @pytest.mark.unit
    def test_xss_attempt_in_locator(self, client):
        """Test that XSS attempts in locator field are rejected (invalid format)."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': '<script>alert("xss")</script>',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        # Should fail validation - not a valid locator format
        assert response.status_code == 200
        assert b'Invalid locator format' in response.data

    @pytest.mark.unit
    def test_both_fields_with_whitespace(self, client):
        """Test upload with both fields having whitespace."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        response = client.post('/upload', data={
            'callsign': '  SP1ABC  ',
            'my_locator': '  JO90AA  ',
            'file': (BytesIO(adif_content.encode('utf-8')), 'test.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Should succeed - both fields get trimmed - check for QSO map page
        assert b'QSO map' in response.data
        # Verify both fields are present and trimmed
        assert b'SP1ABC' in response.data

    @pytest.mark.unit
    def test_filename_sanitization(self, client):
        """Test that filename with special characters is sanitized."""
        adif_content = """<ADIF_VER:5>3.1.4
<EOH>

<QSO_DATE:8>20241101<TIME_ON:6>120000<CALL:6>SP0ABC<BAND:3>20m<MODE:2>CW<GRIDSQUARE:6>JO62AA<EOR>
"""
        # Filename with HTML characters that should be escaped
        response = client.post('/upload', data={
            'callsign': 'SP1ABC',
            'my_locator': 'JO90AA',
            'file': (BytesIO(adif_content.encode('utf-8')), '<script>alert.adif')
        }, follow_redirects=True)

        assert response.status_code == 200
        # Verify filename is escaped in the response
        response_text = response.data.decode('utf-8')
        # Script tag should be escaped
        assert '<script>alert.adif' not in response_text
        # Should have escaped HTML entities
        assert '&lt;script&gt;alert.adif' in response_text

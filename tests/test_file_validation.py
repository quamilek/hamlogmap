"""
Test suite for file upload validation functionality.
"""
import pytest
from qsomap.upload import allowed_file


class TestFileValidation:
    """Test cases for file upload validation."""

    @pytest.mark.unit
    def test_allowed_file_valid_extensions(self):
        """Test that valid ADIF/ADI files are accepted."""
        valid_files = [
            'test.adif',
            'test.adi',
            'TEST.ADIF',
            'TEST.ADI',
            'my_log.adif',
            'contest_log.adi',
            'file.ADIF',
            'log.ADI'
        ]
        
        for filename in valid_files:
            assert allowed_file(filename), f"File '{filename}' should be allowed"

    @pytest.mark.unit
    def test_allowed_file_invalid_extensions(self):
        """Test that files with invalid extensions are rejected."""
        invalid_files = [
            'test.txt',
            'test.csv',
            'test.pdf',
            'test.doc',
            'test.xlsx',
            'invalid.log',
            'file.xml'
        ]
        
        for filename in invalid_files:
            assert not allowed_file(filename), f"File '{filename}' should not be allowed"

    @pytest.mark.unit
    def test_allowed_file_no_extension(self):
        """Test that files without extensions are rejected."""
        files_without_extension = [
            'filename',
            'test',
            'adif',
            'adi'
        ]
        
        for filename in files_without_extension:
            assert not allowed_file(filename), f"File '{filename}' should not be allowed"

    @pytest.mark.unit
    def test_allowed_file_empty_filename(self):
        """Test that empty filename is rejected."""
        assert not allowed_file('')

    @pytest.mark.unit
    def test_allowed_file_case_insensitive(self):
        """Test that file extension check is case insensitive."""
        case_variants = [
            'test.adif',
            'test.ADIF',
            'test.Adif',
            'test.aDiF',
            'test.adi',
            'test.ADI',
            'test.Adi',
            'test.aDi'
        ]
        
        for filename in case_variants:
            assert allowed_file(filename), f"File '{filename}' should be allowed (case insensitive)"

    @pytest.mark.unit
    def test_allowed_file_multiple_dots(self):
        """Test files with multiple dots in filename."""
        files_with_multiple_dots = [
            'my.log.file.adif',
            'test.backup.adi',
            'contest.2024.adif',
            'log.file.name.adi'
        ]
        
        for filename in files_with_multiple_dots:
            assert allowed_file(filename), f"File '{filename}' should be allowed"

    @pytest.mark.unit
    def test_allowed_file_edge_cases(self):
        """Test edge cases for file validation."""
        edge_cases = [
            ('.adif', True),  # Hidden file with valid extension
            ('.adi', True),   # Hidden file with valid extension
            ('file.adif.txt', False),  # Valid extension but ends with invalid
            ('file.txt.adif', True),   # Invalid extension but ends with valid
            ('adif.txt', False),       # Extension looks like valid but isn't
            ('adi.exe', False)         # Extension looks like valid but isn't
        ]
        
        for filename, expected in edge_cases:
            result = allowed_file(filename)
            assert result == expected, f"File '{filename}' expected {expected}, got {result}"
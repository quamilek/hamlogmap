"""
Test suite for grid square validation functionality.
"""
import pytest


class TestGridValidator:
    """Test cases for Maidenhead grid square validation."""

    @pytest.mark.unit
    def test_validate_grid_square_valid_formats(self):
        """Test validation of valid Maidenhead grid squares."""
        try:
            from qsomap.common.grid_validator import validate_grid_square
        except ImportError:
            pytest.skip("Skipping test due to missing dependencies")

        # Valid 4-character grids (field + square)
        valid_4_char = ['JO60', 'AA00', 'RR99', 'FM18', 'JN23', 'IO91']
        for grid in valid_4_char:
            assert validate_grid_square(grid), f"Grid '{grid}' should be valid"

        # Valid 6-character grids (field + square + subsquare)
        valid_6_char = ['JO60AA', 'AA00AA', 'RR99XX', 'FM18LW', 'JN23AA', 'IO91AA']
        for grid in valid_6_char:
            assert validate_grid_square(grid), f"Grid '{grid}' should be valid"

        # Valid 8-character grids (field + square + subsquare + extended)
        valid_8_char = ['JO60AA00', 'AA00AA99', 'RR99XX99', 'FM18LW00']
        for grid in valid_8_char:
            assert validate_grid_square(grid), f"Grid '{grid}' should be valid"

    @pytest.mark.unit
    def test_validate_grid_square_invalid_formats(self):
        """Test validation of invalid Maidenhead grid squares."""
        try:
            from qsomap.common.grid_validator import validate_grid_square
        except ImportError:
            pytest.skip("Skipping test due to missing dependencies")

        # Invalid formats
        invalid_grids = [
            '',          # Empty string
            'J',         # Too short
            'JO',        # Too short
            'JO6',       # Too short
            'JO60A',     # 5 characters (invalid length)
            'JO60AAA',   # 7 characters (invalid length)
            'JO60AAAAA', # 9 characters (invalid length)
            'SO60AA',    # First letter out of range (S > R)
            'JZ60AA',    # Second letter out of range (Z > R)
            'JOAA60',    # Letters and numbers swapped
            'JO6AAA',    # Invalid digit position
            'JO60YY',    # Letters out of range (Y > X)
            'JO60AA0A',  # Mixed digits and letters in wrong positions
            None,        # None value
            123,         # Non-string type
        ]

        for grid in invalid_grids:
            assert not validate_grid_square(grid), f"Grid '{grid}' should be invalid"

    @pytest.mark.unit
    def test_validate_grid_square_case_insensitive(self):
        """Test that grid validation is case insensitive."""
        try:
            from qsomap.common.grid_validator import validate_grid_square
        except ImportError:
            pytest.skip("Skipping test due to missing dependencies")

        # Test various case combinations
        test_cases = [
            ('jo60aa', True),
            ('JO60AA', True),
            ('Jo60Aa', True),
            ('jO60aA', True),
            ('JO60aa', True),
        ]

        for grid, expected in test_cases:
            result = validate_grid_square(grid)
            assert result == expected, f"Grid '{grid}' validation returned {result}, expected {expected}"

    @pytest.mark.unit
    def test_validate_grid_square_whitespace_handling(self):
        """Test that grid validation handles whitespace correctly."""
        try:
            from qsomap.common.grid_validator import validate_grid_square
        except ImportError:
            pytest.skip("Skipping test due to missing dependencies")

        # Test grids with leading/trailing whitespace
        test_cases = [
            ('  JO60AA  ', True),
            (' JO60AA', True),
            ('JO60AA ', True),
            ('\\tJO60AA\\n', True),
        ]

        for grid, expected in test_cases:
            result = validate_grid_square(grid)
            assert result == expected, f"Grid '{grid}' validation returned {result}, expected {expected}"

    @pytest.mark.unit
    def test_validate_grid_square_boundary_values(self):
        """Test validation with boundary values for Maidenhead system."""
        try:
            from qsomap.common.grid_validator import validate_grid_square
        except ImportError:
            pytest.skip("Skipping test due to missing dependencies")

        # Test boundary values
        boundary_cases = [
            ('AA00AA00', True),   # Minimum valid values
            ('RR99XX99', True),   # Maximum valid values
            ('SA00AA00', False),  # Field letter too high (S > R)
            ('AR00AA00', False),  # Field letter too high (second R+1)
            ('AA:0AA00', False),  # Square digit too high (: comes after 9)
            ('AAAA00AA', False),  # Square letter instead of digit
            ('AA00YA00', False),  # Subsquare letter too high (Y > X)
            ('AA00AA:0', False),  # Extended digit too high
        ]

        for grid, expected in boundary_cases:
            result = validate_grid_square(grid)
            assert result == expected, f"Grid '{grid}' validation returned {result}, expected {expected}"

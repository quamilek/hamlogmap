"""
Grid square validation utilities for Maidenhead Locator System.
"""
import re


def validate_grid_square(grid):
    """
    Validate Maidenhead Locator System grid square format.
    Valid formats:
    - 4 characters: AA00 (field + square)
    - 6 characters: AA00aa (field + square + subsquare)
    - 8 characters: AA00aa00 (field + square + subsquare + extended subsquare)

    Args:
        grid (str): Grid square to validate

    Returns:
        bool: True if valid, False otherwise
    """
    if not grid or not isinstance(grid, str):
        return False

    grid = grid.strip().upper()

    # Check length (must be 4, 6, or 8 characters)
    if len(grid) not in [4, 6, 8]:
        return False

    # Pattern for Maidenhead locator:
    # - First 2 chars: A-R (field)
    # - Next 2 chars: 0-9 (square)
    # - Optional next 2 chars: A-X (subsquare)
    # - Optional next 2 chars: 0-9 (extended subsquare)

    if len(grid) == 4:
        # Format: AA00
        pattern = r'^[A-R]{2}[0-9]{2}$'
    elif len(grid) == 6:
        # Format: AA00AA
        pattern = r'^[A-R]{2}[0-9]{2}[A-X]{2}$'
    else:  # len(grid) == 8
        # Format: AA00AA00
        pattern = r'^[A-R]{2}[0-9]{2}[A-X]{2}[0-9]{2}$'

    return bool(re.match(pattern, grid))

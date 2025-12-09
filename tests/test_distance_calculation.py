"""
Tests for distance calculation functionality.
"""

import pytest
import math
from qsomap.common.log_reader import calculate_distance


class TestDistanceCalculation:
    """Test distance calculation between coordinates."""
    
    def test_calculate_distance_same_location(self):
        """Distance from a point to itself should be 0."""
        distance = calculate_distance(52.0, 21.0, 52.0, 21.0)
        assert distance == 0
    
    def test_calculate_distance_known_cities(self):
        """Test distance calculation between known cities.
        
        London (51.5074° N, 0.1278° W) to Paris (48.8566° N, 2.3522° E)
        Expected distance: ~343 km
        """
        london_lat, london_lon = 51.5074, -0.1278
        paris_lat, paris_lon = 48.8566, 2.3522
        
        distance = calculate_distance(london_lat, london_lon, paris_lat, paris_lon)
        
        # Allow 10 km tolerance
        assert abs(distance - 343) < 10, f"Expected ~343 km, got {distance} km"
    
    def test_calculate_distance_warsaw_to_moscow(self):
        """Test distance calculation between Warsaw and Moscow.
        
        Warsaw (52.2297° N, 21.0122° E) to Moscow (55.7558° N, 37.6173° E)
        Expected distance: ~1145 km
        """
        warsaw_lat, warsaw_lon = 52.2297, 21.0122
        moscow_lat, moscow_lon = 55.7558, 37.6173
        
        distance = calculate_distance(warsaw_lat, warsaw_lon, moscow_lat, moscow_lon)
        
        # Allow 20 km tolerance
        assert abs(distance - 1145) < 20, f"Expected ~1145 km, got {distance} km"
    
    def test_calculate_distance_across_equator(self):
        """Test distance calculation across the equator."""
        north_lat, north_lon = 10.0, 0.0
        south_lat, south_lon = -10.0, 0.0
        
        distance = calculate_distance(north_lat, north_lon, south_lat, south_lon)
        
        # ~20 degrees latitude difference, each degree is ~111 km
        # Expected: ~2220 km
        assert 2200 < distance < 2240, f"Expected ~2220 km, got {distance} km"
    
    def test_calculate_distance_across_prime_meridian(self):
        """Test distance calculation across the prime meridian."""
        west_lat, west_lon = 51.5, -10.0
        east_lat, east_lon = 51.5, 10.0
        
        distance = calculate_distance(west_lat, west_lon, east_lat, east_lon)
        
        # At latitude 51.5°, 20 degrees longitude is ~1380 km
        assert 1300 < distance < 1450, f"Expected ~1380 km, got {distance} km"
    
    def test_calculate_distance_antipodal_points(self):
        """Test distance calculation between nearly antipodal points.
        
        Should give approximately half of Earth's circumference (~20,000 km).
        """
        lat1, lon1 = 0.0, 0.0
        lat2, lon2 = 0.0, 179.0
        
        distance = calculate_distance(lat1, lon1, lat2, lon2)
        
        # Should be close to half Earth's circumference at equator
        # Expected: ~19,900 km
        assert 19800 < distance < 20000, f"Expected ~19,900 km, got {distance} km"
    
    def test_calculate_distance_returns_integer(self):
        """Distance should always be returned as an integer."""
        distance = calculate_distance(52.0, 21.0, 52.5, 21.5)
        assert isinstance(distance, int), f"Expected int, got {type(distance)}"
    
    def test_calculate_distance_positive_result(self):
        """Distance should always be positive."""
        # Test various combinations
        test_cases = [
            (10.0, 20.0, 30.0, 40.0),
            (-10.0, -20.0, -30.0, -40.0),
            (10.0, -20.0, -30.0, 40.0),
        ]
        
        for lat1, lon1, lat2, lon2 in test_cases:
            distance = calculate_distance(lat1, lon1, lat2, lon2)
            assert distance >= 0, f"Distance should be non-negative, got {distance}"

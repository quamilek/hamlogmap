"""
Conftest file for pytest configuration and shared fixtures.
"""
import sys
import os

# Add project root to Python path so tests can import modules
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, project_root)

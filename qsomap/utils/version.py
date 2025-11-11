"""
Version utility to get application version from git tags
"""

import subprocess
import os


def get_version():
    """
    Get application version from git tags.
    Falls back to 'dev' if git is not available or no tags exist.

    Returns:
        str: Version string (e.g., 'v1.0.0' or 'dev')
    """
    try:
        # Get the repository root
        repo_root = os.path.dirname(os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))))

        # Try to get the latest tag
        version = subprocess.check_output(
            ['git', 'describe', '--tags', '--always'],
            cwd=repo_root,
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()

        # If we got a result, return it
        if version:
            return version

    except (subprocess.CalledProcessError, FileNotFoundError):
        # git command not found or not a git repository
        pass

    # Fallback version
    return 'dev'


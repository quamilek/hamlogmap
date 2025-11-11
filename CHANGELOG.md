# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2025-01-11

### Added
- Web application for visualizing amateur radio QSO (contact) logs on interactive map
- ADIF log file upload and parsing with automatic DXCC lookup
- Mode filter panel and band-based color coding for markers
- Statistics view (DXCC and Band statistics)
- Night mode toggle and dark map view
- GitHub ribbon on main page linking to repository
- Application version display in footer (from git tags)
- Production Docker setup with Gunicorn and separate `Dockerfile.prod`
- Comprehensive error handling (404, 500, 502, 503) with logging
- CI/CD workflow command in Makefile (`make ci-workflow`)
- Docker health checks and automatic restart policy
- Comprehensive test suite with CI/CD pipeline (GitHub Actions)
- MIT license

### Changed
- Refactored application structure: routes and error handlers in separate `qsomap/handlers.py`
- Updated docker-compose files to Docker Compose v2+ standards
- Improved error logging with detailed traceback before displaying custom error pages

### Fixed
- Fixed all failing unit tests
- Fixed Python code formatting to comply with flake8 standards
- Removed unused imports and fixed indentation issues

[Unreleased]: https://github.com/quamilek/hamlogmap/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/quamilek/hamlogmap/releases/tag/v0.1.0


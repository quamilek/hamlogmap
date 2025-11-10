# HamLogMap

HamLogMap is a web application for visualizing amateur radio QSO (contact) logs on an interactive map. It allows users to upload ADIF log files and view their radio contacts geographically.

## Demo

<video src="hamlogmap.mp4" controls="controls" style="max-width: 800px;">
</video>

## Features

- Upload and parse ADIF log files
- Interactive map visualization
- Mode filter panel for selective QSO viewing
- Statistics view (DXCC and Band statistics)
- Display QSO locations with customizable markers
- Draw lines between QSO points
- Band-based color coding for markers
- Night mode toggle
- **Automatic location lookup** - If the log file doesn't contain locator information, the application automatically looks up the DXCC entity and estimates grid square coordinates based on the call sign using country file data from [country-files.com](https://www.country-files.com/)

## Planned Features

- Download map as image
- Import QSOs from other formats (Cabrillo, etc.)
- QSO filtering by date range
- Performance optimizations for large log files (10,000+ QSOs)

## Installation and Running

### Docker Installation (Recommended)

The easiest way to get started is using Docker and Docker Compose. This method handles all dependencies automatically.

#### Prerequisites
- Docker and Docker Compose installed on your system

#### Steps

1. Clone the repository:
```bash
git clone https://github.com/quamilek/hamlogmap.git
cd hamlogmap
```

2. Build and start the application:
```bash
docker-compose up --build
```

3. Open your web browser and navigate to:
```
http://localhost:5050
```

#### Additional Docker Commands

- **Stop the application:**
```bash
docker-compose down
```

- **View logs:**
```bash
docker-compose logs -f
```

- **Restart containers:**
```bash
docker-compose up --build
```

#### First Startup Note ⏱️

The first time you run the application, it may take a bit longer to start (1-2 minutes) because:
- The application downloads the `countryfile` database - this is used to lookup DXCC entity information from radio call signs
- The application estimates GRIDSQUARE coordinates if they were not provided in the uploaded log file

Subsequent startups will be much faster as these data are cached.

---

### Local Installation

If you prefer to run the application locally without Docker:

#### Prerequisites
- Python 3.7+
- pip package manager

#### Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hamlogmap.git
cd hamlogmap
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask application:
```bash
python app.py
```

5. Open your web browser and navigate to:
```
http://localhost:5050
```

---

## Usage

### Uploading a Log File

1. Navigate to the upload page
2. Enter your callsign and locator (Maidenhead grid square)
3. Select your ADIF log file
4. Click upload

### Viewing Your QSOs

Once your log is uploaded, you can:

- **View the map** - See all your QSO locations plotted on an interactive map
- **Toggle night mode** - Click the "Toggle Night Mode" button for dark map view
- **Color by band** - Check "Color Pins Band" to color markers by frequency band instead of location
- **Filter by mode** - Use the Mode Filter panel to show/hide specific transmission modes (CW, SSB, FT8, etc.)
- **View statistics** - Click "Show Statistics" to see:
  - DXCC (country) statistics
  - Band statistics
  - Complete QSO list with all details

---

## Testing

HamLogMap includes a comprehensive test suite to ensure code quality and functionality.

### Running Tests

#### Quick Test (No Dependencies)
```bash
make test-standalone
```

#### Full Test Suite (Local)
```bash
# Install dependencies first
make install

# Run all tests
make test

# Run specific test types
make test-unit           # Unit tests only
make test-integration    # Integration tests only
make test-coverage       # With coverage report
```

#### Docker Tests
```bash
make test-docker
```

#### Available Test Commands
- `make test` - Run all tests
- `make test-unit` - Run only unit tests (fast)
- `make test-integration` - Run integration tests (may require internet)
- `make test-coverage` - Run tests with HTML coverage report
- `make test-standalone` - Run basic tests without any dependencies
- `make lint` - Code style checking with flake8

### CI/CD

Tests are automatically run on GitHub Actions for every push and pull request, including:
- Unit and integration tests
- Code linting
- Docker build verification
- Coverage reporting

---

## Requirements

- Python 3.14+
- Flask 3.1+
- All dependencies listed in `requirements.txt`
- Docker and Docker Compose (for containerized deployment)





## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or create an issue.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

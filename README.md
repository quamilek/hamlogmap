# HamLogMap

HamLogMap is a web application for visualizing amateur radio QSO (contact) logs on an interactive map. It allows users to upload ADIF log files and view their radio contacts geographically.

## Features

- Upload and parse ADIF log files
- Interactive map visualization using Leaflet.js
- Display QSO locations with customizable markers
- Draw lines between QSO points
- Night mode toggle
- Statistics view
- Band-based color coding for markers

## Requirements

- Python 3.x
- Flask
- Other dependencies listed in requirements.txt
- Docker and Docker Compose (for containerized deployment)

## Installation

### Option 1: Local Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hamlogmap.git
cd hamlogmap
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Option 2: Docker Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hamlogmap.git
cd hamlogmap
```

2. Build and start the containers:
```bash
docker-compose up --build
```

## Usage

### Local Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to `http://localhost:5000`

### Docker Usage

1. The application will be available at `http://localhost:5000` after running `docker-compose up`

2. To stop the application:
```bash
docker-compose down
```

3. To view logs:
```bash
docker-compose logs -f
```

4. To rebuild and restart the containers:
```bash
docker-compose up --build
```

3. Upload your ADIF log file through the web interface

4. View your QSOs on the interactive map:
   - Toggle night mode
   - Enable/disable band-based coloring
   - View statistics
   - Save map as screenshot

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or create an issue.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
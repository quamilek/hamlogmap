from flask import Blueprint, render_template, request, redirect, flash, url_for
from pyhamtools.locator import locator_to_latlong
from qsomap.common.log_reader import read_log_file
from qsomap.common.grid_validator import validate_grid_square
from markupsafe import escape

upload_bp = Blueprint('upload', __name__)


def sanitize_text_input(text):
    """
    Sanitize text input by trimming whitespace and escaping HTML.

    Args:
        text: Input text string or None

    Returns:
        Sanitized string or None if input is None/empty
    """
    if text is None:
        return None

    # Strip leading/trailing whitespace
    sanitized = text.strip()

    # Return None for empty strings
    if not sanitized:
        return None

    # Escape HTML to prevent XSS (returns Markup object, convert to str)
    sanitized = str(escape(sanitized))

    return sanitized


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension (ADIF, ADI, or Cabrillo)"""
    allowed_extensions = {'adif', 'adi', 'cbr', 'log', 'cabrillo', 'cab'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def validate_file(file):
    """Validate uploaded file and flash error message if invalid"""
    if 'file' not in request.files:
        flash('No file selected', 'error')
        return False

    if file.filename == '':
        flash('No file selected', 'error')
        return False

    if not allowed_file(file.filename):
        flash('Invalid file type. Please upload ADIF (.adif, .adi) or Cabrillo (.cbr, .log, .cabrillo) files.', 'error')
        return False

    return True


def validate_locator(my_locator):
    """Validate locator format and flash error message if invalid, return normalized locator or None"""
    # Sanitize input
    sanitized_locator = sanitize_text_input(my_locator)

    if not sanitized_locator:
        flash('Locator field is required.', 'error')
        return None

    normalized_locator = sanitized_locator.upper()

    if not validate_grid_square(normalized_locator):
        flash('Invalid locator format. Please enter a valid Maidenhead locator (e.g., JO70, JO70fp, JO70fp12).', 'error')
        return None

    return normalized_locator


def convert_locator_to_coordinates(locator):
    """Convert locator to coordinates and flash error message if invalid, return tuple (lat, lng) or (None, None)"""
    try:
        latitude, longitude = locator_to_latlong(locator)
        return latitude, longitude
    except ValueError as e:
        flash(f'Error converting locator to coordinates: {str(e)}', 'error')
        return None, None


def read_file_content(file):
    """Read file content with proper encoding handling and flash error message if failed, return content or None"""
    try:
        return file.read().decode('utf-8')
    except UnicodeDecodeError:
        try:
            # Reset file pointer and try latin-1 encoding
            file.seek(0)
            return file.read().decode('latin-1')
        except UnicodeDecodeError:
            flash('Cannot read file. Please ensure the file is in text format.', 'error')
            return None


@upload_bp.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')

        # Validate file
        if not validate_file(file):
            return redirect(url_for('upload.upload_file'))

        # Get form data and sanitize
        callsign = sanitize_text_input(request.form.get('callsign'))
        my_locator = request.form.get('my_locator')

        # Validate locator
        normalized_locator = validate_locator(my_locator)
        if not normalized_locator:
            return redirect(url_for('upload.upload_file'))

        # Convert locator to coordinates
        my_latitude, my_longitude = convert_locator_to_coordinates(normalized_locator)
        if my_latitude is None or my_longitude is None:
            return redirect(url_for('upload.upload_file'))

        # Read file content
        file_content = read_file_content(file)
        if not file_content:
            return redirect(url_for('upload.upload_file'))

        # Process QSO data
        qsos = read_log_file(file_content, my_latitude, my_longitude)
        flash('File uploaded successfully!')

        return render_template(
            'qso_list.html',
            qsos=qsos,
            my_latitude=my_latitude,
            my_longitude=my_longitude,
            callsign=callsign,
            filename=file.filename
        )

    return render_template('main.html')

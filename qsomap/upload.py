from flask import Blueprint, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
import os
from qsomap.common.log_reader import read_log_file
from pyhamtools.locator import locator_to_latlong

upload_bp = Blueprint('upload', __name__)

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension (ADIF or ADI)"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'adif', 'adi'}

@upload_bp.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file selected')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No file selected')
            return redirect(request.url)
        if not allowed_file(file.filename):
            flash('Invalid file type. Please upload only ADIF (.adif) or ADI (.adi) files.')
            return redirect(request.url)
        callsign = request.form.get('callsign')
        my_locator = request.form.get('my_locator')
        my_latitude, my_longitude = locator_to_latlong(my_locator)

        try:
            file_content = file.read().decode('utf-8')
        except UnicodeDecodeError:
            try:
                file_content = file.read().decode('latin-1')
            except UnicodeDecodeError:
                flash('Cannot read file. Please ensure the file is in text format.')
                return redirect(request.url)
        qsos = read_log_file(file_content)
        flash('File uploaded successfully!')
        return render_template(
            'qso_list.html', 
            qsos=qsos, 
            my_latitude=my_latitude, 
            my_longitude=my_longitude, 
            callsign=callsign,
            filename=file.filename
        )
    return render_template('upload.html')
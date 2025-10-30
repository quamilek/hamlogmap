from flask import Blueprint, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
import os
from qsomap.common.log_reader import read_log_file
from pyhamtools.locator import locator_to_latlong

upload_bp = Blueprint('upload', __name__)

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
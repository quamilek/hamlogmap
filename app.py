import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash
from qsomap.upload import upload_bp

app = Flask(__name__,
            template_folder='qsomap/templates',
            static_folder='qsomap/static',
            static_url_path='/static')
app.secret_key = 'your_secret_key'

# Flask configuration
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['TRAP_HTTP_EXCEPTIONS'] = False
app.config['TRAP_BAD_REQUEST_ERRORS'] = False

# Set debug mode from environment variable (default: False for production)
DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
app.debug = DEBUG

app.register_blueprint(upload_bp)

# Configure logging
# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(logs_dir, exist_ok=True)

# Configure logging to file and console
log_file = os.path.join(logs_dir, 'app.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.route('/')
def root():
    return redirect(url_for('index'))

@app.route('/hamlogmap')
def index():
    return render_template('main.html')

# Error handler for 5xx errors
@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}", exc_info=True)
    # In debug mode, let Flask handle the error with its default page
    if app.debug:
        raise error
    try:
        return render_template('error.html',
                             error_code='500',
                             error_title='Internal Server Error',
                             error_description='We are sorry, something went wrong. Our team has been notified of this issue.'), 500
    except Exception as e:
        logger.error(f"Error rendering error.html: {e}", exc_info=True)
        return 'Internal Server Error. Please contact sp3wkw@gmail.com', 500

@app.errorhandler(502)
def bad_gateway(error):
    logger.error(f"Bad gateway error: {error}")
    # In debug mode, let Flask handle the error with its default page
    if app.debug:
        raise error
    try:
        return render_template('error.html',
                             error_code='502',
                             error_title='Bad Gateway',
                             error_description='Server is not responding properly. Please try again in a moment.'), 502
    except Exception as e:
        logger.error(f"Error rendering error.html: {e}", exc_info=True)
        return 'Bad Gateway. Please try again later.', 502

@app.errorhandler(503)
def service_unavailable(error):
    logger.error(f"Service unavailable error: {error}")
    # In debug mode, let Flask handle the error with its default page
    if app.debug:
        raise error
    try:
        return render_template('error.html',
                             error_code='503',
                             error_title='Service Unavailable',
                             error_description='Server is temporarily unavailable. Please try again in a moment.'), 503
    except Exception as e:
        logger.error(f"Error rendering error.html: {e}", exc_info=True)
        return 'Service Unavailable. Please try again later.', 503

# Generic error handler for all unhandled exceptions
@app.errorhandler(Exception)
def handle_exception(error):
    logger.error(f"Unhandled exception: {error}", exc_info=True)
    # In debug mode, let Flask handle the error with its default page
    if app.debug:
        raise error
    try:
        return render_template('error.html',
                             error_code='500',
                             error_title='Internal Server Error',
                             error_description='We are sorry, something went wrong. Our team has been notified of this issue.'), 500
    except Exception as e:
        logger.error(f"Error rendering error.html: {e}", exc_info=True)
        return 'Internal Server Error. Please contact sp3wkw@gmail.com', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=DEBUG, port=5050)

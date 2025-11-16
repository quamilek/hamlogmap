import os
import logging
from flask import Flask, current_app
from qsomap.upload import upload_bp
from qsomap.handlers import register_routes, register_error_handlers
from qsomap.utils.version import get_version
from qsomap.common.callinfo_provider import CallInfoProvider

# Initialize Flask app
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

# Initialize CallInfoProvider singleton once at app startup
# This will be stored for the entire lifetime of the application
app.callinfo = CallInfoProvider.get()

# Register blueprints
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

# Configure Werkzeug logger to WARNING level to suppress 404 info logs in docker output
werkzeug_logger = logging.getLogger('werkzeug')
# Temporarily set to INFO to see debugger PIN
werkzeug_logger.setLevel(logging.INFO if DEBUG else logging.WARNING)

# Register routes and error handlers
register_routes(app)
register_error_handlers(app)


# Context processor to inject version into templates
@app.context_processor
def inject_version():
    """Inject application version into template context"""
    return {'app_version': get_version()}


if __name__ == '__main__':
    if DEBUG:
        # Show debugger PIN when in debug mode
        from werkzeug.debug import DebuggedApplication  # noqa: F401
        logger.info("Debug mode is enabled")
    app.run(host='0.0.0.0', debug=DEBUG, port=5050)

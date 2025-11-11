"""
Routes and error handlers for HamLogMap application
"""

import logging
from flask import render_template, request, redirect, url_for

logger = logging.getLogger(__name__)


def register_routes(app):
    """Register application routes"""

    @app.route('/')
    def root():
        return redirect(url_for('index'))

    @app.route('/hamlogmap')
    def index():
        return render_template('main.html')


def register_error_handlers(app):  # noqa: C901
    """Register error handlers for the application"""

    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors"""
        # Log the 404 error
        logger.warning('[404] Not Found: %s', request.url)
        logger.warning('Requested path: %s', request.path)

        # In debug mode, let Flask handle the error with its default page
        if app.debug:
            raise error

        try:
            # Attempt to render custom error page
            return (render_template('error.html',
                                    error_code='404',
                                    error_title='Page Not Found',
                                    error_description=(
                                        'The page you are looking for '
                                        'could not be found.')),
                    404)
        except Exception as e:
            # If custom error page rendering fails, log and return plain text
            logger.error('Failed to render error.html for 404: %s',
                         str(e), exc_info=True)
            return 'Page Not Found', 404

    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server Error"""
        # Log the error with full traceback
        logger.error('[500] Internal server error occurred', exc_info=True)
        logger.error('Error details: %s', str(error))

        # In debug mode, let Flask handle the error with its default page
        if app.debug:
            raise error

        try:
            # Attempt to render custom error page
            return (render_template('error.html',
                                    error_code='500',
                                    error_title='Internal Server Error',
                                    error_description=(
                                        'We are sorry, something went wrong. '
                                        'Our team has been notified of this '
                                        'issue.')),
                    500)
        except Exception as e:
            # If custom error page rendering fails, log and return plain text
            logger.error('Failed to render error.html for 500: %s',
                         str(e), exc_info=True)
            return 'Internal Server Error. Please contact sp3wkw@gmail.com', 500

    @app.errorhandler(502)
    def bad_gateway(error):
        """Handle 502 Bad Gateway errors"""
        # Log the error with full traceback
        logger.error('[502] Bad gateway error occurred', exc_info=True)
        logger.error('Error details: %s', str(error))

        # In debug mode, let Flask handle the error with its default page
        if app.debug:
            raise error

        try:
            # Attempt to render custom error page
            return (render_template('error.html',
                                    error_code='502',
                                    error_title='Bad Gateway',
                                    error_description=(
                                        'Server is not responding properly. '
                                        'Please try again in a moment.')),
                    502)
        except Exception as e:
            # If custom error page rendering fails, log and return plain text
            logger.error('Failed to render error.html for 502: %s',
                         str(e), exc_info=True)
            return 'Bad Gateway. Please try again later.', 502

    @app.errorhandler(503)
    def service_unavailable(error):
        """Handle 503 Service Unavailable errors"""
        # Log the error with full traceback
        logger.error('[503] Service unavailable error occurred', exc_info=True)
        logger.error('Error details: %s', str(error))

        # In debug mode, let Flask handle the error with its default page
        if app.debug:
            raise error

        try:
            # Attempt to render custom error page
            return (render_template('error.html',
                                    error_code='503',
                                    error_title='Service Unavailable',
                                    error_description=(
                                        'Server is temporarily unavailable. '
                                        'Please try again in a moment.')),
                    503)
        except Exception as e:
            # If custom error page rendering fails, log and return plain text
            logger.error('Failed to render error.html for 503: %s',
                         str(e), exc_info=True)
            return 'Service Unavailable. Please try again later.', 503

    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle all unhandled exceptions"""
        # Log the error with full traceback
        logger.error('[Exception] Unhandled exception occurred', exc_info=True)
        logger.error('Error details: %s', str(error))

        # In debug mode, let Flask handle the error with its default page
        if app.debug:
            raise error

        try:
            # Attempt to render custom error page
            return (render_template('error.html',
                                    error_code='500',
                                    error_title='Internal Server Error',
                                    error_description=(
                                        'We are sorry, something went wrong. '
                                        'Our team has been notified of this '
                                        'issue.')),
                    500)
        except Exception as e:
            # If custom error page rendering fails, log and return plain text
            logger.error('Failed to render error.html for exception: %s',
                         str(e), exc_info=True)
            return ('Internal Server Error. Please contact sp3wkw@gmail.com',
                    500)

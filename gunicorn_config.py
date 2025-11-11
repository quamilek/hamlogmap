# Gunicorn configuration for HamLogMap production

import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = max(2, multiprocessing.cpu_count() - 1)
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "/app/logs/access.log"
errorlog = "/app/logs/error.log"
loglevel = "info"

# Process naming
proc_name = "hamlogmap"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (disabled by default, configure if needed)
keyfile = None
certfile = None

# Application
raw_env = ["FLASK_ENV=production"]


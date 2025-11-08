# Multi-stage Dockerfile for HamLogMap
FROM python:3.14-slim as base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Test stage
FROM base as test
RUN python -m pytest tests/ -v --tb=short

# Production stage
FROM base as production
EXPOSE 5050
CMD ["python", "app.py"]

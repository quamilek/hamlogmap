# Multi-stage Dockerfile for HamLogMap with uv
FROM python:3.14-slim as base

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && mv /root/.local/bin/uv /usr/local/bin/uv \
    && rm -rf /var/lib/apt/lists/*

# Copy project configuration first to leverage Docker cache
COPY pyproject.toml ./
RUN uv sync --no-dev --no-install-project

# Copy the rest of the application
COPY . .

# Test stage
FROM base as test
RUN uv sync --no-install-project
RUN uv run python -m pytest tests/ -v --tb=short

# Production stage
FROM base as production
EXPOSE 5050
CMD ["uv", "run", "python", "app.py"]

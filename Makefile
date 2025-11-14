# HamLogMap Makefile with uv

.PHONY: help install sync lock run test test-unit test-integration test-docker clean lint ci-workflow

help:  ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install uv if not already installed
	@which uv > /dev/null || (echo "Installing uv..." && curl -LsSf https://astral.sh/uv/install.sh | sh)

sync: install  ## Sync dependencies with uv
	uv sync

lock: install  ## Update uv.lock file
	uv lock

run: sync  ## Run the application
	uv run python app.py

test: sync  ## Run all tests
	uv run python -m pytest tests/ -v --tb=short

test-unit: sync  ## Run only unit tests
	uv run python -m pytest tests/ -v -m "unit"

test-integration: sync  ## Run only integration tests
	uv run python -m pytest tests/ -v -m "integration"

test-coverage: sync  ## Run tests with coverage report
	uv run python -m pytest tests/ --cov=qsomap --cov-report=html --cov-report=term-missing

test-docker:  ## Run tests in Docker
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

test-standalone:  ## Run standalone test (no dependencies)
	python3 tests/test_standalone.py

lint: sync  ## Run linting with flake8
	uv run flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=.venv

lint-full: sync  ## Run full linting check
	uv run flake8 . --count --max-complexity=10 --max-line-length=127 --statistics --exclude=.venv

docker-build:  ## Build Docker image
	docker build -t hamlogmap:latest .

docker-run:  ## Run Docker container
	docker run -p 5050:5050 hamlogmap:latest

docker-test-build:  ## Build Docker test image
	docker build --target test -t hamlogmap:test .

ci-workflow: sync  ## Run CI/CD workflow locally (equivalent to .github/python-app.yml)
	@echo "Running CI/CD workflow..."
	@echo "Step 1: Syncing dependencies..."
	uv sync
	@echo "Step 2: Running linting..."
	uv run flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=.venv
	uv run flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics --exclude=.venv
	@echo "Step 3: Running unit tests..."
	uv run python -m pytest tests/ -v --tb=short -m "unit" --maxfail=5
	@echo "Step 4: Running integration tests..."
	uv run python -m pytest tests/ -v --tb=short -m "integration" --maxfail=5 || true
	@echo "Step 5: Running all tests with coverage..."
	uv run python -m pytest tests/ -v --tb=short --cov=qsomap --cov-report=xml --cov-report=term-missing
	@echo "Step 6: Building Docker test image..."
	docker build --target test -t hamlogmap:test .
	@echo "Step 7: Running tests in Docker..."
	docker run --rm hamlogmap:test
	@echo "Step 8: Building production Docker image..."
	docker build --target production -t hamlogmap:latest .
	@echo "CI/CD workflow completed successfully!"

clean:  ## Clean up generated files
	rm -rf .venv/
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

# HamLogMap Makefile

.PHONY: help venv install freeze run test test-unit test-integration test-docker clean lint ci-workflow

help:  ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

venv:  ## Create virtual environment
	python3 -m venv venv

install: venv  ## Install dependencies
	. venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

freeze:  ## Freeze current dependencies
	. venv/bin/activate && pip freeze > requirements.txt

run:  ## Run the application
	. venv/bin/activate && python app.py

test:  ## Run all tests
	. venv/bin/activate && python -m pytest tests/ -v --tb=short

test-unit:  ## Run only unit tests
	. venv/bin/activate && python -m pytest tests/ -v -m "unit"

test-integration:  ## Run only integration tests
	. venv/bin/activate && python -m pytest tests/ -v -m "integration"

test-coverage:  ## Run tests with coverage report
	. venv/bin/activate && python -m pytest tests/ --cov=qsomap --cov-report=html --cov-report=term-missing

test-docker:  ## Run tests in Docker
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

test-standalone:  ## Run standalone test (no dependencies)
	python3 tests/test_standalone.py

lint:  ## Run linting with flake8
	. venv/bin/activate && flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=venv,env,.venv,.env

lint-full:  ## Run full linting check
	. venv/bin/activate && flake8 . --count --max-complexity=10 --max-line-length=127 --statistics --exclude=venv,env,.venv,.env

docker-build:  ## Build Docker image
	docker build -t hamlogmap:latest .

docker-run:  ## Run Docker container
	docker run -p 5050:5050 hamlogmap:latest

docker-test-build:  ## Build Docker test image
	docker build --target test -t hamlogmap:test .

ci-workflow:  ## Run CI/CD workflow locally (equivalent to .github/python-app.yml)
	@echo "Running CI/CD workflow..."
	@echo "Step 1: Installing dependencies..."
	. venv/bin/activate && python -m pip install --upgrade pip && pip install flake8
	@echo "Step 2: Running linting..."
	. venv/bin/activate && flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics --exclude=venv,env,.venv,.env
	. venv/bin/activate && flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics --exclude=venv,env,.venv,.env
	@echo "Step 3: Running unit tests..."
	. venv/bin/activate && python -m pytest tests/ -v --tb=short -m "unit" --maxfail=5
	@echo "Step 4: Running integration tests..."
	. venv/bin/activate && python -m pytest tests/ -v --tb=short -m "integration" --maxfail=5 || true
	@echo "Step 5: Running all tests with coverage..."
	. venv/bin/activate && python -m pytest tests/ -v --tb=short --cov=qsomap --cov-report=xml --cov-report=term-missing
	@echo "Step 6: Building Docker test image..."
	docker build --target test -t hamlogmap:test .
	@echo "Step 7: Running tests in Docker..."
	docker run --rm hamlogmap:test
	@echo "Step 8: Building production Docker image..."
	docker build --target production -t hamlogmap:latest .
	@echo "CI/CD workflow completed successfully!"

clean:  ## Clean up generated files
	rm -rf venv/
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

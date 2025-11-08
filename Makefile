# HamLogMap Makefile

.PHONY: help venv install freeze run test test-unit test-integration test-docker clean lint

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

clean:  ## Clean up generated files
	rm -rf venv/
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

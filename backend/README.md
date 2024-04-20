# Fullstack challenge Backend

## Project Overview

This backend project is built using FastAPI, a modern, fast (high-performance), web framework for building APIs with Python 3.7+. It is based on standard Python type hints and is designed to be easy to use and learn.

## Features

- FastAPI framework for building APIs
- Asynchronous support using Python's asyncio
- Integration with Pydantic for data validation and serialization
- Automatic interactive API documentation with Swagger UI and ReDoc
- Dependency injection and middleware support

## Dependency Management

We use Poetry to manage Python dependencies in our project.

```bash
poetry install
```

This will install all the required dependencies defined in the `pyproject.toml` file.

You can activate the Poetry virtual environment by running:

```bash
poetry shell
```

This will activate the virtual environment, allowing you to access the installed dependencies and run commands within the isolated environment.

For better understanding about how poetry works you can check their documentation site: https://python-poetry.org/docs/


## Project Structure
The project structure follows a typical FastAPI application layout:

```
backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   ├── search.py
│   └── utils.py
│
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── .gitignore
├── Dockerfile
├── Dockerfile-test
├── poetry-lock
├── pyproject.toml
└── README.md
```

- `app/`: Contains the main application code
  - `main.py`: Entry point for the FastAPI application
  - `schemas.py`: Data models defined using Pydantic
  - `search.py`: Elasticsearch singleton wrapper
  - `utils.py`: Some utility functions
- `tests/`: Contains the tests for the application code
  - `test_main.py`: Tests for the entry point of the FastAPI application

## API Documentation

The API documentation is automatically generated and available at the `/docs` endpoint when the application is running. You can access it through your web browser by navigating to `http://localhost:8000/docs` (assuming the application is running locally).

## Running Tests
I installed `pytest` along with `pytest-asyncio` and `httpx` for testing asynchronous code and making HTTP requests in the tests.

To run the tests, ensure that you have activated the Poetry virtual environment and then run:

```bash
pytest
```

This command will execute all the tests in the `tests/` directory.


## References

- FastAPI Documentation: https://fastapi.tiangolo.com/
- Poetry Documentation: https://python-poetry.org/docs/

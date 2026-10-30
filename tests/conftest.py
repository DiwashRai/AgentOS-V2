"""The fast suite's database: a fresh one in memory for each test."""

import pytest

from agentos.db import Database, open_memory


@pytest.fixture
def database() -> Database:
    return open_memory()

"""Everything in this folder is an integration test (`just test-integration`)."""

from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent


@pytest.hookimpl(tryfirst=True)  # before `-m` deselects by marker
def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    for item in items:
        if item.path.is_relative_to(HERE):
            item.add_marker(pytest.mark.integration)

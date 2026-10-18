"""For every test (tests/ and tools/gates/): a clean environment, and the speed gate."""

import os
import tomllib
from pathlib import Path

import pytest

from tests.speed_gate import SpeedGate

PYPROJECT = Path(__file__).resolve().parent / "pyproject.toml"
AMBIENT = ("GITHUB_ACTIONS", "GH_TOKEN", "GITHUB_TOKEN")


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Tests see no ambient credentials, CI variables or AgentOS config."""
    for key in list(os.environ):
        if key in AMBIENT or key.startswith("AGENTOS_"):
            monkeypatch.delenv(key)


def pytest_configure(config: pytest.Config) -> None:
    limit_s = tomllib.loads(PYPROJECT.read_text(encoding="utf-8"))["tool"]["agentos"]
    config.pluginmanager.register(SpeedGate(limit_s["fast_suite_limit_s"]), "agentos-speed-gate")

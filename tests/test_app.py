"""The app answers health, and the startup config is parsed whole from the environment."""

import pytest
from fastapi.testclient import TestClient

from agentos.app.config import ConfigError, load_config
from agentos.app.main import create_app
from agentos.app.model import Config


def test_health() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_config_defaults_ignore_other_variables() -> None:
    assert load_config({"PATH": "/bin"}) == Config(host="127.0.0.1", port=8000)
    assert load_config({"AGENTOS_PORT": "9000"}).port == 9000


def _problems(environ: dict[str, str]) -> list[str]:
    with pytest.raises(ConfigError) as caught:
        load_config(environ)
    return caught.value.problems


def test_config_reports_every_problem_at_once() -> None:
    problems = _problems({"AGENTOS_PORT": "eighty", "AGENTOS_HSOT": "localhost"})

    assert sorted(p.split(":")[0] for p in problems) == ["AGENTOS_HSOT", "AGENTOS_PORT"]


@pytest.mark.parametrize("port", ["8000.0", "80_00", "+8000", " 8000", "0", "65536"])
def test_a_port_is_plain_digits_in_range_and_never_echoed(port: str) -> None:
    [problem] = _problems({"AGENTOS_PORT": port})

    assert problem.startswith("AGENTOS_PORT:")
    assert port.strip() not in problem.removeprefix("AGENTOS_PORT:")


def test_keys_match_their_exact_names() -> None:
    assert _problems({"AGENTOS_host": "example"}) == ["AGENTOS_host: unknown key"]

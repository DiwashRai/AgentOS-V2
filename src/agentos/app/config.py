"""Startup config from the environment: only `AGENTOS_*` keys, by their exact names. An unknown
key or a bad value fails startup, listing every problem at once (docs/rules.md, Config). Messages
never repeat a value: some keys will hold secrets."""

import re
from collections.abc import Mapping
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, ValidationError
from pydantic_core import ErrorDetails

from agentos.app.model import Config

PREFIX = "AGENTOS_"


class ConfigError(Exception):
    """The environment doesn't make a config; `problems` lists each key that's wrong and why."""

    def __init__(self, problems: list[str]) -> None:
        super().__init__("bad startup config: " + "; ".join(problems))
        self.problems = problems


def _digits(value: str) -> str:
    """Whole numbers as plain digits only: no sign, point, underscore or space."""
    if not re.fullmatch(r"[0-9]+", value):
        raise ValueError("must be a whole number written in digits")
    return value


Port = Annotated[int, BeforeValidator(_digits), Field(ge=1, le=65535)]


class _Env(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    host: str = Field(default="127.0.0.1", min_length=1, alias="AGENTOS_HOST")
    port: Port = Field(default=8000, alias="AGENTOS_PORT")


def _problem(error: ErrorDetails) -> str:
    key = ".".join(map(str, error["loc"]))
    if error["type"] == "extra_forbidden":
        return f"{key}: unknown key"
    return f"{key}: {error['msg']}"


def load_config(environ: Mapping[str, str]) -> Config:
    """The config in `environ`'s `AGENTOS_*` keys; raises `ConfigError` naming every problem."""
    keys = {k: v for k, v in environ.items() if k.startswith(PREFIX)}
    try:
        env = _Env.model_validate(keys)
    except ValidationError as error:
        raise ConfigError([_problem(e) for e in error.errors()]) from None
    return Config(host=env.host, port=env.port)

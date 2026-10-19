"""The startup config, parsed from the environment (`config.py`)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    host: str
    port: int

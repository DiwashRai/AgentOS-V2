"""What every gate module shares: the repo paths, the defensive kinds, a finding, layers."""

from __future__ import annotations

import fnmatch
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = "src"
AGENTOS = f"{SRC}/agentos"
WEB_SRC = "web/src/"
# Where raw tags are counted, each folder against its own cap: a feature (`features/queue`), and
# the patterns as one (`patterns`). Only the kit renders elements.
TAGGED = (f"{WEB_SRC}features/", f"{WEB_SRC}patterns/")
# The composition root wires every feature together; its fan-out is its job.
FAN_OUT_EXEMPT = {"app"}
# `is None` and optional parameters are not counted: they are syntax, and capping them pushes code
# towards `if not x`, getattr and Any. The types (the `any` and `optional_fields` gates) carry it.
KINDS = ("isinstance", "try", "broad_except", "getattr_default", "hasattr", "suppress", "cast")
# A Python file no layer's globs match: the `layers` gate fails on it.
NO_LAYER = "other"


@dataclass(frozen=True)
class Finding:
    """One measured function, file or subpackage."""

    path: str
    line: int
    name: str
    score: int

    @property
    def id(self) -> str:
        return f"{self.path}::{self.name}"


def layer_of(path: str, layers: dict[str, list[str]]) -> str:
    for layer, patterns in layers.items():
        if any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns):
            return layer
    return NO_LAYER


def tag_folder(path: str) -> str:
    """`web/src/features/queue/QueueView.tsx` -> `features/queue`, `web/src/patterns/who.tsx` ->
    `patterns`: the folder whose raw-tag cap a file in `TAGGED` counts against."""
    top, rest = path.removeprefix(WEB_SRC).split("/", 1)
    return f"{top}/{rest.split('/')[0]}" if top == "features" else top


def module_of(path: str) -> str:
    """`src/agentos/runs/rules.py` -> `agentos.runs.rules`, and
    `src/agentos_worker/core/__init__.py` -> `agentos_worker.core`."""
    relative = path.removeprefix(f"{SRC}/")
    dotted = relative.removesuffix(".py").replace("/", ".")
    return dotted.removesuffix(".__init__")

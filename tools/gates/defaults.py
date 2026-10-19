"""The baseline's defaults: what `--init` writes, and what a baseline that leaves something out
gets (limits; everything else defaults to the strictest value)."""

from __future__ import annotations

from typing import Any

from common import AGENTOS, SRC

WORKER = f"{SRC}/agentos_worker"

# `cyclomatic_python_tool` picks the Python cyclomatic counter: "lizard" (and/or, ternaries and
# comprehensions count; what the reference ranges were measured with) or "ruff" (C901, McCabe:
# they don't). The named cyclomatic exceptions are that tool's scores, so a switch goes with
# `--rebaseline-cyclomatic` and a `raises` entry naming both changes.
DEFAULT_LIMITS: dict[str, Any] = {
    "cognitive": 15,
    "cyclomatic": 10,
    "cyclomatic_python_tool": "lizard",
    "file_lines": 1000,
    "fan_out": 5,
    "optional_fields": 1,
    "any": 0,
}
PY_CYCLOMATIC_TOOLS = ("lizard", "ruff")
# fnmatch patterns ("*" also matches "/"), relative to the repo root. First match wins.
# core: domain types and rules on parsed values. shell: the use cases between the core and the
# boundary (and the docstring-only package files). boundary: everything touching the outside
# (HTTP, db rows, config, the HTTP clients, git, processes, files), named. A Python file in none
# fails the `layers` gate: name its role, or add it to a layer here (a raise).
DEFAULT_LAYERS = {
    "core": [
        f"{AGENTOS}/*/model.py",
        f"{AGENTOS}/*/rules.py",
        f"{AGENTOS}/**/model/**",  # a model or rules grown into a package
        f"{AGENTOS}/**/rules/**",
        f"{AGENTOS}/workflows/**",
        f"{SRC}/agentos_protocol/**",
        f"{WORKER}/core/**",
    ],
    "shell": [
        f"{AGENTOS}/*/service.py",
        f"{AGENTOS}/*/loops.py",
        f"{AGENTOS}/*/reaper.py",
        f"{AGENTOS}/*/dispatcher.py",
        f"{AGENTOS}/__init__.py",
        f"{AGENTOS}/*/__init__.py",
        f"{WORKER}/__init__.py",
        f"{WORKER}/run/**",
        f"{WORKER}/client/**",
    ],
    "boundary": [
        f"{AGENTOS}/*/routes.py",
        f"{AGENTOS}/*/rows.py",
        f"{AGENTOS}/app/**",
        f"{AGENTOS}/__main__.py",
        f"{AGENTOS}/jira/**",
        f"{AGENTOS}/github/**",
        f"{AGENTOS}/artifactory/**",
        f"{AGENTOS}/db/**",
        f"{AGENTOS}/targets/**",  # the Target adapters (its service.py, if any, is shell)
        f"{WORKER}/http/**",
        f"{WORKER}/git/**",
        f"{WORKER}/procs/**",
        f"{WORKER}/files/**",
        f"{WORKER}/__main__.py",
    ],
}
# What `--init` leaves uncapped per layer (the baseline's `allowed.uncapped` is what applies): the
# boundary is where chaotic input gets checked; `cast` is capped in the core only.
DEFAULT_UNCAPPED = {
    "boundary": ["isinstance", "try", "cast"],
    "shell": ["cast"],
}
EXCEPTION_GATES = ("cognitive", "cyclomatic", "file_lines", "fan_out", "optional_fields", "any")

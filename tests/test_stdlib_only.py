"""The worker and the protocol import only the standard library (and each other), and never
dynamically: runners have plain Python."""

import ast
import sys
from pathlib import Path

import pytest

from tests.ast_checks import builtin_calls

SRC = Path(__file__).resolve().parents[1] / "src"
OURS = {"agentos_worker", "agentos_protocol"}
DYNAMIC = "dynamic import: import it by name, from the standard library or our own packages"
CODE_RUNNERS = {"__import__", "exec", "eval", "compile"}


def problems(source: str) -> list[str]:
    """`line: what` for each import outside the standard library and ours, and each dynamic one
    (importlib, or `__import__`, `exec`, `eval`, `compile` however they are named)."""
    tree = ast.parse(source)
    found: list[str] = []
    for node in ast.walk(tree):
        match node:
            case ast.Import(names=aliases):
                names = [alias.name.split(".")[0] for alias in aliases]
            case ast.ImportFrom(module=str(module), level=0):
                names = [module.split(".")[0]]
            case _:
                continue
        for name in names:
            if name == "importlib":
                found.append(f"{node.lineno}: {name}  {DYNAMIC}")
            elif name not in sys.stdlib_module_names and name not in OURS:
                found.append(f"{node.lineno}: {name}  not in the standard library")
    calls = builtin_calls(tree, CODE_RUNNERS)
    return found + [f"{line}: {name}()  {DYNAMIC}" for line, name in calls]


@pytest.mark.parametrize("package", sorted(OURS))
def test_imports_only_the_standard_library(package: str) -> None:
    found = [
        f"{path.relative_to(SRC).as_posix()}:{problem}"
        for path in sorted((SRC / package).rglob("*.py"))
        for problem in problems(path.read_text(encoding="utf-8"))
    ]

    assert found == []


def test_third_party_and_dynamic_imports_are_refused() -> None:
    source = """
import json
import fastapi
from importlib import import_module
import importlib.util
from agentos_protocol import PROTOCOL_VERSION
__import__("pydantic")
import builtins
from builtins import __import__ as load, len
builtins.__import__("fastapi")
load("fastapi")
exec("import fastapi")
eval("1")
compile("1", "", "eval")
len("fine")
"""
    lines = sorted(int(problem.split(":")[0]) for problem in problems(source))
    assert lines == [3, 4, 5, 7, 10, 11, 12, 13, 14]

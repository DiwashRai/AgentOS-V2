"""The core (the files the gates' baseline puts in the `core` layer) is pure, by allowlist: it
imports only the pure standard-library modules below, our own core modules and jinja2; it never
reads the clock; it calls no I/O or code-running built-in."""

import ast
import fnmatch
import json
from pathlib import Path

from tests.ast_checks import builtin_calls

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
CORE_GLOBS: list[str] = json.loads((ROOT / "quality-baseline.json").read_text(encoding="utf-8"))[
    "layers"
]["core"]
# The standard library a core module may import (a module and its submodules). Anything else
# does I/O, reads the clock, draws randomness or starts threads: that belongs in the shell or a
# boundary. `datetime` is for its types: reading the clock is refused separately.
PURE_STDLIB = {
    "__future__", "abc", "base64", "bisect", "collections", "copy", "dataclasses", "datetime",
    "decimal", "enum", "fractions", "functools", "hashlib", "heapq", "itertools", "json", "math",
    "operator", "re", "string", "struct", "textwrap", "types", "typing", "unicodedata",
}  # fmt: skip
THIRD_PARTY = {"jinja2"}  # prompt templates (D15)
OURS = {"agentos", "agentos_worker", "agentos_protocol"}
PURE_PATHS = {"PurePosixPath", "PureWindowsPath"}  # the protocol's path rules
CLOCK = {"now", "today", "utcnow"}
BUILTINS = {"open", "print", "input", "exec", "eval", "compile", "__import__"}
FIX = {
    "import": "is not a pure module the core may import (a pure standard-library module, a core "
    "module, jinja2): put the I/O in the shell or a boundary and pass the value in",
    "clock": "reads the clock: pass the value in, not a clock",
    "call": "the core does no I/O and runs no code: do it in the shell or a boundary and pass "
    "the value in",
}


def is_core(path: str) -> bool:
    return any(fnmatch.fnmatchcase(path, glob) for glob in CORE_GLOBS)


def _module_path(module: str) -> Path:
    """Where one of our modules lives (a package's `__init__.py` if it is one)."""
    base = SRC.joinpath(*module.split("."))
    return base / "__init__.py" if base.is_dir() else base.with_suffix(".py")


def _is_core_module(module: str) -> bool:
    return is_core(_module_path(module).relative_to(ROOT).as_posix())


def _absolute(node: ast.ImportFrom, package: str) -> str:
    """The module an import names, with a relative import resolved against `package`."""
    if node.level == 0:
        return node.module or ""
    parts = package.split(".")[: len(package.split(".")) - node.level + 1]
    return ".".join([*parts, *([node.module] if node.module else [])])


def _allowed(module: str) -> bool:
    top = module.split(".")[0]
    if top in OURS:
        return _is_core_module(module)
    return top in THIRD_PARTY or top in PURE_STDLIB


def _import_problems(node: ast.stmt, package: str) -> list[str]:
    match node:
        case ast.Import(names=names):
            return [a.name for a in names if not _allowed(a.name)]
        case ast.ImportFrom(module="pathlib", level=0, names=names):
            return [f"pathlib.{a.name}" for a in names if a.name not in PURE_PATHS]
        case ast.ImportFrom(names=names) as imported:
            module = _absolute(imported, package)
            clock = [f"{module}.{a.name}" for a in names if a.name in CLOCK]
            if module.split(".")[0] in OURS:  # `from pkg import module` names that module
                named = [f"{module}.{a.name}" for a in names]
                found = [m if _module_path(m).exists() else module for m in named]
                return clock + [m for m in found if not _is_core_module(m)]
            return clock if _allowed(module) else [module]
        case _:
            return []


def impurities(source: str, package: str = "agentos.workflows") -> list[str]:
    """`line: what  fix` for each impure import, clock read and built-in call in one core module;
    `package` is the module's package, for relative imports."""
    tree = ast.parse(source)
    found: list[str] = []
    for node in ast.walk(tree):
        match node:
            case ast.Import() | ast.ImportFrom():
                bad = _import_problems(node, package)
                found += [f"{node.lineno}: {m}  {FIX['import']}" for m in bad]
            case ast.Attribute(attr=attr) if attr in CLOCK:
                found.append(f"{node.lineno}: .{attr}  {FIX['clock']}")
            case _:
                pass
    found += [f"{line}: {name}()  {FIX['call']}" for line, name in builtin_calls(tree, BUILTINS)]
    return found


def _core_files() -> list[Path]:
    paths = sorted(SRC.rglob("*.py"))
    return [p for p in paths if is_core(p.relative_to(ROOT).as_posix())]


def _package(path: Path) -> str:
    parts = path.relative_to(SRC).with_suffix("").parts
    return ".".join(parts if parts[-1] == "__init__" else parts[:-1]).removesuffix(".__init__")


def test_the_core_is_pure() -> None:
    files = _core_files()
    found = [
        f"{path.relative_to(ROOT).as_posix()}:{problem}"
        for path in files
        for problem in impurities(path.read_text(encoding="utf-8"), _package(path))
    ]

    assert files
    assert found == []


def _lines(source: str, package: str = "agentos.workflows") -> list[int]:
    return sorted(int(problem.split(":")[0]) for problem in impurities(source, package))


def test_only_the_pure_standard_library_core_modules_and_jinja2_are_imported() -> None:
    source = """
import json, dataclasses, jinja2
from pathlib import PurePosixPath, PureWindowsPath
from agentos_protocol import PROTOCOL_VERSION
from agentos.app import model
from agentos.app.model import Config
from . import stages
import os.path
import pathlib
from pathlib import Path
import httpx
from agentos.runs import service
from agentos.db import tx
from importlib import resources
from .. import db
import logging
from uuid import uuid4
import collections.abc, concurrent.futures
"""
    assert _lines(source) == [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]


def test_any_clock_reference_is_a_clock_read() -> None:
    source = """
from dataclasses import dataclass, field
from datetime import datetime, date, timedelta

@dataclass
class Run:
    at: datetime = field(default_factory=datetime.now)

def later(now: datetime) -> object:
    return now + timedelta(1), date.today(), datetime.utcnow
"""
    assert _lines(source) == [7, 10, 10]


def test_io_and_code_running_builtins_are_refused_however_named() -> None:
    source = """
import builtins as b
from builtins import open as o
open("x")
print(1)
input()
b.exec("1")
builtins.eval("1")
o("y")
compile("1", "", "eval")
__import__("os")
len("pure")
"""
    # line 2 and 3 are also refused imports (builtins)
    assert _lines(source) == [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

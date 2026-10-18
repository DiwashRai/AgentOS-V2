"""The import rules hold, and break on the imports they exist to stop: the import-linter contracts
in pyproject.toml, run on the real graph plus one probe import, and features reaching each other
only through their public modules."""

import functools
from collections.abc import Iterable, Iterator
from copy import deepcopy
from pathlib import Path

import grimp
import pytest
from importlinter import configuration
from importlinter.application import use_cases
from importlinter.application.user_options import UserOptions
from importlinter.domain.contract import registry

PYPROJECT = Path(__file__).resolve().parents[1] / "pyproject.toml"
# What another package may import of a feature `X`: `X`, `X.model` and `X.service`.
PUBLIC = {"model", "service"}
# The composition root wires every package's routes, and its entry point starts it.
WIRING = {"app", "__main__"}


@functools.cache
def _options() -> UserOptions:
    configuration.configure()  # type: ignore[no-untyped-call]  # import-linter leaves it untyped
    options = use_cases.read_user_options(str(PYPROJECT))
    # Private import-linter API (what lint-imports does before checking), pinned by uv.lock: an
    # import-linter upgrade may rename it. read_user_options and the registry are public.
    use_cases._register_contract_types(options)
    return options


@functools.cache
def _graph() -> grimp.ImportGraph:
    roots = _options().session_options["root_packages"]
    return grimp.build_graph(*roots, include_external_packages=True, cache_dir=None)


def _broken(*imports: tuple[str, str]) -> list[str]:
    """The names of the contracts that break once these imports are added to the real graph."""
    graph = deepcopy(_graph())
    for importer, imported in imports:
        graph.add_import(importer=importer, imported=imported, line_number=1, line_contents="")
    options = _options()
    broken = []
    for contract_options in options.contracts_options:
        contract = registry.get_contract_class(contract_options["type"])(
            name=contract_options["name"],
            session_options=options.session_options,
            contract_options=contract_options,
        )
        if not contract.check(deepcopy(graph), verbose=False).kept:
            broken.append(contract.name)
    return broken


def test_every_contract_is_kept() -> None:
    assert _broken() == []


@pytest.mark.parametrize(
    ("importer", "imported", "contract"),
    [
        ("agentos.tickets", "agentos.runs", "The module map's order"),
        ("agentos.extra", "agentos.settings", "every package is on it"),
        ("agentos.runs.launch.model", "agentos.runs.launch.service", "The core (model, rules"),
        ("agentos.tickets.model", "agentos.db", "The core (model, rules"),
        ("agentos.runs.model", "agentos.runs.reaper", "The core (model, rules"),
        ("agentos.runs.rules", "agentos.runs.dispatcher", "The core (model, rules"),
        ("agentos.board.rules", "agentos.board.loops", "The core (model, rules"),
        ("agentos.runs", "agentos_worker.core", "The server never imports the worker"),
        ("agentos.program", "agentos_worker", "The server never imports the worker"),
        ("agentos_worker.util", "agentos_worker.core", "Inside the worker"),
        ("agentos.app.model", "agentos.app.config", "The core (model, rules"),
        ("agentos.workflows", "pydantic", "The core uses no web framework"),
        ("agentos_worker.core", "fastapi", "The core uses no web framework"),
        ("agentos_worker.core", "agentos_worker.run", "Inside the worker"),
        ("agentos_worker.http", "agentos_worker.client", "Inside the worker"),
        ("agentos_protocol", "agentos_worker", "The protocol imports nothing of ours"),
    ],
)
def test_a_forbidden_import_breaks_its_contract(
    importer: str, imported: str, contract: str
) -> None:
    assert any(contract in name for name in _broken((importer, imported)))


def private_imports(imports: Iterable[tuple[str, str]]) -> Iterator[str]:
    """Each import of another server package's module that isn't one of its public modules."""
    for importer, imported in imports:
        source, target = importer.split("."), imported.split(".")
        if source[0] != "agentos" or target[0] != "agentos" or len(source) < 2 or len(target) < 2:
            continue
        if source[1] == target[1] or source[1] in WIRING:
            continue
        if len(target) == 2 or (len(target) == 3 and target[2] in PUBLIC):
            continue
        yield f"{importer} -> {imported}: import {'.'.join(target[:2])}, its model or its service"


def test_features_use_each_other_only_through_their_public_modules() -> None:
    graph = _graph()
    imports = [(m, t) for m in graph.modules for t in graph.find_modules_directly_imported_by(m)]

    assert list(private_imports(imports)) == []


def test_a_private_module_of_another_feature_is_refused() -> None:
    probes = [
        ("agentos.tickets.service", "agentos.people.rows"),  # refused
        ("agentos.runs.service.launch", "agentos.tickets.model.lock"),  # refused: below the model
        ("agentos.tickets.service", "agentos.people.service"),
        ("agentos.tickets.service", "agentos.people"),
        ("agentos.tickets.rows", "agentos.tickets.model"),  # inside one feature
        ("agentos.app.main", "agentos.runs.routes"),  # the composition root
    ]

    assert [line.split(" ")[0] for line in private_imports(probes)] == [
        "agentos.tickets.service",
        "agentos.runs.service.launch",
    ]

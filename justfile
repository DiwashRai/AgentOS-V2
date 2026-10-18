# AgentOS V2 task runner. The same commands on Windows (pwsh) and Linux (sh).
set windows-shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

default: check

# Once per clone, and after a lockfile change: install the environment and enable the git hooks.
setup:
    uv sync
    git config core.hooksPath .githooks

# The checks: format, lint, types (strict, as Python 3.11), imports.
check:
    uv run ruff format --check .
    uv run ruff check .
    uv run mypy
    uv run lint-imports

# Auto-format and apply lint fixes.
fmt:
    uv run ruff format .
    uv run ruff check --fix .

# The fast suite (its wall time is gated: tests/speed_gate.py, registered by the root conftest.py).
test:
    uv run pytest -m "not integration"

# Real processes and real git.
test-integration:
    uv run pytest -m integration

# Every gate (tools/gates/gates.py): each offender as `path:line  name  score > limit`. Raises are
# checked against HEAD's baseline; `--base REF` checks against the merge base with REF instead.
gates *args:
    uv run python tools/gates/gates.py {{ args }}

# Lower quality-baseline.json where the code improved (never raises it). Commit it with the change.
ratchet:
    uv run python tools/gates/gates.py --ratchet

# Markdown for a PR description: the gate numbers against the merge base with `base`.
card base="origin/main":
    @uv run python tools/gates/card.py --base {{ base }}

# The server on 127.0.0.1:8000.
dev:
    uv run python -m agentos

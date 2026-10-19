"""The fast suite's speed gate: a run with no integration test in it fails when its wall time is
over the limit in pyproject.toml (`[tool.agentos] fast_suite_limit_s`)."""

import time
from collections.abc import Callable

import pytest


class SpeedGate:
    """A pytest plugin; `clock` is injectable so the gate itself can be tested."""

    def __init__(self, limit_s: float, clock: Callable[[], float] = time.monotonic) -> None:
        self.limit_s = limit_s
        self.clock = clock
        self.started = clock()
        self.fast_suite = True
        self.message = ""

    def collected(self, integration: bool) -> None:
        self.fast_suite = not integration

    def failed(self) -> bool:
        """Whether the run is over its limit; sets the message that says what to do."""
        elapsed = self.clock() - self.started
        if self.fast_suite and elapsed > self.limit_s:
            self.message = (
                f"speed gate: the fast suite took {elapsed:.1f} s, over its {self.limit_s} s "
                "limit. Make the slow tests faster (fakes instead of real git or processes, no "
                "sleeps; real processes go in tests/integration). Don't raise the limit."
            )
        return bool(self.message)

    @pytest.hookimpl
    def pytest_collection_finish(self, session: pytest.Session) -> None:
        self.collected(any(item.get_closest_marker("integration") for item in session.items))

    @pytest.hookimpl
    def pytest_sessionfinish(self, session: pytest.Session) -> None:
        if self.failed():
            session.exitstatus = pytest.ExitCode.TESTS_FAILED

    @pytest.hookimpl
    def pytest_terminal_summary(self, terminalreporter: pytest.TerminalReporter) -> None:
        if self.message:
            terminalreporter.write_line(self.message, red=True, bold=True)

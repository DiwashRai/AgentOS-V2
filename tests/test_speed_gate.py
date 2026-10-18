"""The speed gate fails a fast-suite run over its limit, and leaves integration runs alone."""

from tests.speed_gate import SpeedGate


class FakeClock:
    def __init__(self) -> None:
        self.now = 100.0

    def __call__(self) -> float:
        return self.now


def _run(seconds: float, integration: bool) -> SpeedGate:
    clock = FakeClock()
    gate = SpeedGate(10, clock)
    gate.collected(integration)
    clock.now += seconds
    gate.failed()
    return gate


def test_a_fast_suite_over_its_limit_fails_saying_to_make_tests_faster() -> None:
    assert not _run(9.9, integration=False).message
    gate = _run(10.1, integration=False)
    assert gate.failed()
    assert "faster" in gate.message


def test_a_run_with_integration_tests_is_exempt() -> None:
    assert not _run(60, integration=True).failed()

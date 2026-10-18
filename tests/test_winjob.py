"""The test-only job helper closes every handle it acquired when a step fails, and keeps the
error (Windows only: job objects)."""

import sys

import pytest

from tests.integration import winjob


class FakeKernel32:
    """The calls winjob makes; AssignProcessToJobObject fails."""

    def __init__(self) -> None:
        self.closed: list[int] = []

    def CreateJobObjectW(self, attributes: object, name: object) -> int:
        return 11

    def SetInformationJobObject(self, *args: object) -> int:
        return 1

    def OpenProcess(self, *args: object) -> int:
        return 22

    def AssignProcessToJobObject(self, job: int, process: int) -> int:
        return 0

    def CloseHandle(self, handle: int) -> int:
        self.closed.append(handle)
        return 1


if sys.platform == "win32":  # job objects are Windows; elsewhere there is no test

    def test_a_failed_assignment_closes_the_process_and_the_job_and_raises(
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        kernel32 = FakeKernel32()
        monkeypatch.setattr(winjob, "_kernel32", kernel32)

        with pytest.raises(OSError):  # noqa: PT011 (WinError's message is the OS's)
            winjob.kill_on_close_job(1234)
        assert sorted(kernel32.closed) == [11, 22]

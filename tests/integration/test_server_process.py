"""`python -m agentos` as a real process: it starts, answers health, and stops; and the cleanup
owns the whole process tree."""

import http.client
import os
import signal
import socket
import subprocess
import sys
import threading
import time
from contextlib import closing, suppress
from pathlib import Path
from typing import IO

import pytest

from tests.integration import winjob

Popen = subprocess.Popen[bytes]

# How long the server may take to answer health, and to exit once asked to stop.
STARTUP_TIMEOUT_S = 30.0
STOP_TIMEOUT_S = 10.0
POLL_S = 0.1  # between health polls: waiting on the process, so a crash ends the wait at once
# A stand-in for a server whose child outlives it: on "go", it starts a child that holds its
# stdout, says so, and exits. The test's end of that pipe reads EOF only once the child is gone.
OUTLIVED = """
import subprocess, sys
sys.stdin.readline()
subprocess.Popen([sys.executable, "-c", "import time; time.sleep(600)"], stdout=sys.stdout)
print("started", flush=True)
"""


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port: int = s.getsockname()[1]
        return port


def _healthy(port: int) -> bool:
    with closing(http.client.HTTPConnection("127.0.0.1", port, timeout=POLL_S)) as conn:
        try:
            conn.request("GET", "/api/health")
            return conn.getresponse().status == 200
        except OSError:
            return False


Stream = int | IO[bytes]  # a file, or subprocess.PIPE / DEVNULL


def _spawn(argv: list[str], stdin: Stream, stdout: Stream, env: dict[str, str]) -> Popen:
    """In its own process group with no console window, as every process we start (rules.md)."""
    if sys.platform == "win32":
        flags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
        return subprocess.Popen(
            argv, stdin=stdin, stdout=stdout, stderr=subprocess.STDOUT, env=env, creationflags=flags
        )
    return subprocess.Popen(
        argv, stdin=stdin, stdout=stdout, stderr=subprocess.STDOUT, env=env, start_new_session=True
    )


def _own(proc: Popen) -> int | None:
    """On Windows, a kill-on-close job holding the process, so closing it kills the whole tree;
    if that fails, the process is killed and reaped and the error goes on. On POSIX the process
    leads its own session, so its process group is the tree."""
    if sys.platform == "win32":
        try:
            return winjob.kill_on_close_job(proc.pid)
        except BaseException:
            proc.kill()
            proc.wait(timeout=STOP_TIMEOUT_S)
            raise
    return None


def _stop(proc: Popen, job: int | None) -> None:
    """Disposes of the whole tree, even when the process itself has exited already. POSIX:
    SIGTERM to the group (uvicorn shuts down cleanly), a bounded wait, then SIGKILL to the group
    anyway for anything left. Windows, where a process with no console can't be sent a Ctrl
    event: closing the job kills the tree (with no job, the process alone is killed). Then the
    process is reaped."""
    if sys.platform == "win32":
        if job is None:
            proc.kill()
        else:
            winjob.close_job(job)
    else:
        with suppress(ProcessLookupError):
            os.killpg(proc.pid, signal.SIGTERM)
        with suppress(subprocess.TimeoutExpired):
            proc.wait(timeout=STOP_TIMEOUT_S)
        with suppress(ProcessLookupError):
            os.killpg(proc.pid, signal.SIGKILL)
    proc.wait(timeout=STOP_TIMEOUT_S)


def _wait_healthy(proc: Popen, port: int) -> bool:
    """Polls health until it answers, the process exits, or STARTUP_TIMEOUT_S passes."""
    deadline = time.monotonic() + STARTUP_TIMEOUT_S
    while time.monotonic() < deadline:
        if _healthy(port):
            return True
        try:
            proc.wait(timeout=POLL_S)
        except subprocess.TimeoutExpired:
            continue
        return False
    return False


def _server(port: int, out: Stream) -> Popen:
    env = os.environ | {"AGENTOS_HOST": "127.0.0.1", "AGENTOS_PORT": str(port)}
    return _spawn([sys.executable, "-m", "agentos"], subprocess.DEVNULL, out, env)


def test_the_server_starts_answers_health_and_stops(tmp_path: Path) -> None:
    port = _free_port()
    log = tmp_path / "server.log"
    with log.open("wb") as out:
        proc = _server(port, out)
    job = None
    try:
        job = _own(proc)
        healthy = _wait_healthy(proc, port)
    finally:
        _stop(proc, job)

    output = log.read_text(encoding="utf-8", errors="replace")
    assert healthy, output
    assert proc.poll() is not None
    assert not _healthy(port)
    if sys.platform != "win32":
        # A graceful stop: uvicorn finishes, then re-raises SIGTERM on itself, so the exit code
        # is -SIGTERM; the log line is the proof it shut down rather than being killed.
        assert "Finished server process" in output, output


def test_cleanup_ends_a_child_that_outlived_its_parent() -> None:
    argv = [sys.executable, "-c", OUTLIVED]
    proc = _spawn(argv, subprocess.PIPE, subprocess.PIPE, dict(os.environ))
    assert proc.stdin
    assert proc.stdout
    job = None
    try:
        job = _own(proc)
        proc.stdin.write(b"go\n")
        proc.stdin.flush()
        started = proc.stdout.readline().strip()
        proc.wait(timeout=STOP_TIMEOUT_S)  # the parent is gone; its child lives on
    finally:
        _stop(proc, job)
    reader = threading.Thread(target=proc.stdout.read, daemon=True)
    reader.start()
    reader.join(timeout=STOP_TIMEOUT_S)

    assert started == b"started"
    assert not reader.is_alive(), "a child of the stopped tree still holds its pipe"


@pytest.mark.skipif(sys.platform != "win32", reason="job objects are Windows")
def test_a_failed_job_assignment_kills_the_server_and_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def refuse(pid: int) -> int:
        raise OSError("assignment refused")

    monkeypatch.setattr(winjob, "kill_on_close_job", refuse, raising=False)
    proc = _server(_free_port(), subprocess.DEVNULL)

    with pytest.raises(OSError, match="assignment refused"):
        _own(proc)
    assert proc.poll() is not None

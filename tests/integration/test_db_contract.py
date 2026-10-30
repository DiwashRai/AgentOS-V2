"""The engine does what V2 relies on, against a real database file (docs/architecture.md,
Database): constraints refuse bad rows, and writers apply one at a time, a second one waiting for
the write lock rather than failing, so the change sequence has no gaps and follows commit order.
The tables are the tests' own."""

import sys
import threading
from pathlib import Path

import pytest
import turso

from agentos.db import BUSY_TIMEOUT_MS, Database, Row, open_file

BOUND_S = BUSY_TIMEOUT_MS / 1000  # a writer gives up waiting for the lock after this
WRITERS = 8


@pytest.fixture
def on_file(tmp_path: Path) -> Database:
    return open_file(tmp_path / "contract.db")


def _write(database: Database, *statements: str) -> None:
    with database.write() as writer:
        for statement in statements:
            writer.run(statement)


def _rows(database: Database, sql: str) -> list[Row]:
    with database.read() as reader:
        return reader.all(sql)


def test_a_check_constraint_refuses_a_bad_row(on_file: Database) -> None:
    _write(
        on_file,
        "CREATE TABLE stage (status TEXT NOT NULL CHECK (status IN ('pending', 'done'))) STRICT",
        "INSERT INTO stage VALUES ('done')",
    )

    with pytest.raises(turso.IntegrityError):
        _write(on_file, "INSERT INTO stage VALUES ('lost')")
    assert _rows(on_file, "SELECT status FROM stage") == [("done",)]


def test_a_partial_unique_index_refuses_a_second_matching_row(on_file: Database) -> None:
    _write(
        on_file,
        "CREATE TABLE run (ticket TEXT NOT NULL, active INTEGER NOT NULL) STRICT",
        "CREATE UNIQUE INDEX one_active_run ON run (ticket) WHERE active = 1",
        "INSERT INTO run VALUES ('AOS-1', 1), ('AOS-1', 0), ('AOS-1', 0), ('AOS-2', 1)",
    )

    with pytest.raises(turso.IntegrityError):
        _write(on_file, "INSERT INTO run VALUES ('AOS-1', 1)")
    assert _rows(on_file, "SELECT count(*) FROM run WHERE ticket = 'AOS-1'") == [(3,)]


def test_a_foreign_key_refuses_an_orphan(on_file: Database) -> None:
    _write(
        on_file,
        "CREATE TABLE ticket (key TEXT PRIMARY KEY) STRICT",
        "CREATE TABLE message (ticket TEXT NOT NULL REFERENCES ticket (key)) STRICT",
        "INSERT INTO ticket VALUES ('AOS-1')",
        "INSERT INTO message VALUES ('AOS-1')",
    )

    with pytest.raises(turso.IntegrityError):
        _write(on_file, "INSERT INTO message VALUES ('AOS-2')")
    assert _rows(on_file, "SELECT ticket FROM message") == [("AOS-1",)]


def _beginning_a_write(thread: threading.Thread) -> bool:
    """Whether `thread` is inside the engine starting a write transaction: while another holds
    the write lock, it is waiting for it."""
    assert thread.ident is not None
    frame = sys._current_frames().get(thread.ident)
    while frame is not None:
        if "BEGIN IMMEDIATE" in frame.f_locals.values():
            return True
        frame = frame.f_back
    return False


def test_a_second_writer_waits_for_the_first_rather_than_failing(on_file: Database) -> None:
    _write(on_file, "CREATE TABLE note (writer TEXT NOT NULL) STRICT")
    seen: list[list[Row]] = []

    def second() -> None:
        with on_file.write() as writer:
            seen.append(writer.all("SELECT writer FROM note"))
            writer.run("INSERT INTO note VALUES ('second')")

    thread = threading.Thread(target=second)
    with on_file.write() as first:
        thread.start()
        # The first has written nothing yet: the write lock was taken at its start.
        while thread.is_alive() and not _beginning_a_write(thread):
            pass
        waiting = thread.is_alive()
        first.run("INSERT INTO note VALUES ('first')")
    thread.join(BOUND_S)

    assert waiting
    assert seen == [[("first",)]]
    assert _rows(on_file, "SELECT writer FROM note") == [("first",), ("second",)]


def test_concurrent_writers_number_their_changes_without_gaps_in_commit_order(
    on_file: Database,
) -> None:
    _write(on_file, "CREATE TABLE note (body TEXT NOT NULL) STRICT")
    start = threading.Barrier(WRITERS, timeout=BOUND_S)
    numbered: list[tuple[int, int]] = []  # (writes committed before this one, its change number)

    def write() -> None:
        start.wait()
        with on_file.write() as writer:
            [(before,)] = writer.all("SELECT count(*) FROM note")
            writer.run("INSERT INTO note VALUES ('written')")
            number = writer.record_change("ticket", "AOS-1")
        assert isinstance(before, int)
        numbered.append((before, number))

    threads = [threading.Thread(target=write) for _ in range(WRITERS)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(BOUND_S)

    # Every writer committed, and each one's change took the number after every earlier commit.
    assert sorted(numbered) == [(n, n + 1) for n in range(WRITERS)]
    assert _rows(on_file, "SELECT seq FROM changes") == [(n + 1,) for n in range(WRITERS)]

"""A write commits its changes, numbered in order, or leaves nothing behind; every change kind is
one the schema takes; a new database file gets the schema and an existing one opens as it is."""

from pathlib import Path
from typing import get_args

import pytest

from agentos.db import ChangeKind, Database, Row, open_file


class Abandoned(Exception):
    pass


def _changes(database: Database) -> list[Row]:
    with database.read() as reader:
        return reader.all("SELECT seq, kind, id FROM changes ORDER BY seq")


def test_a_write_commits_its_changes_numbered_in_order(database: Database) -> None:
    with database.write() as writer:
        numbers = [writer.record_change("ticket", "AOS-1"), writer.record_change("run", "7")]
    with database.write() as writer:
        numbers.append(writer.record_change("ticket", "AOS-1"))

    assert numbers == [1, 2, 3]
    assert _changes(database) == [(1, "ticket", "AOS-1"), (2, "run", "7"), (3, "ticket", "AOS-1")]


def test_a_write_that_raises_leaves_nothing_and_takes_no_number(database: Database) -> None:
    with database.write() as writer:
        writer.run("CREATE TABLE note (body TEXT NOT NULL) STRICT")

    def abandon() -> None:
        with database.write() as writer:
            writer.run("INSERT INTO note (body) VALUES (?)", ("lost",))
            writer.record_change("ticket", "AOS-1")
            raise Abandoned

    with pytest.raises(Abandoned):
        abandon()
    with database.write() as writer:
        number = writer.record_change("ticket", "AOS-2")
    with database.read() as reader:
        notes = reader.all("SELECT body FROM note")

    assert notes == []
    assert number == 1
    assert _changes(database) == [(1, "ticket", "AOS-2")]


@pytest.mark.parametrize("kind", get_args(ChangeKind))
def test_every_change_kind_is_one_the_schema_takes(database: Database, kind: ChangeKind) -> None:
    with database.write() as writer:
        writer.record_change(kind, "x")

    assert _changes(database) == [(1, kind, "x")]


def test_a_new_file_gets_the_schema_and_an_existing_one_opens_as_it_is(tmp_path: Path) -> None:
    path = tmp_path / "new folder" / "agentos.db"
    with open_file(path).write() as writer:
        writer.record_change("ticket", "AOS-1")
    with open_file(path).write() as writer:
        number = writer.record_change("ticket", "AOS-2")

    assert number == 2

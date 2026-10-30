"""Turso: opening a database (a file, or memory), its schema, and read and write transactions.
Every connection has foreign keys on and waits up to BUSY_TIMEOUT_MS for the write lock, which a
write transaction takes at its start (BEGIN IMMEDIATE): writes apply one at a time, so the change
sequence numbers them in commit order."""

import threading
from collections.abc import Callable, Iterator, Sequence
from contextlib import AbstractContextManager, closing, contextmanager
from pathlib import Path
from typing import Literal

import turso

SCHEMA = Path(__file__).with_name("schema.sql")
BUSY_TIMEOUT_MS = 5000

Value = int | float | str | bytes | None  # what a column holds
Row = tuple[Value, ...]
# What a change names (docs/api.md, Live updates); the schema's CHECK on `changes.kind` matches.
ChangeKind = Literal[
    "ticket", "run", "items", "messages", "library", "settings", "people", "clients", "intake"
]
Connect = Callable[[], AbstractContextManager[turso.Connection]]


class Reader:
    """Reads inside one transaction."""

    def __init__(self, connection: turso.Connection) -> None:
        self._connection = connection

    def all(self, sql: str, params: Sequence[Value] = ()) -> list[Row]:
        """Every row the statement returns. It runs to its end, so the transaction can commit."""
        rows: list[Row] = self._connection.execute(sql, params).fetchall()
        return rows


class Writer(Reader):
    """Reads and writes inside one write transaction."""

    def run(self, sql: str, params: Sequence[Value] = ()) -> None:
        self.all(sql, params)

    def record_change(self, kind: ChangeKind, id: str) -> int:
        """Records that this write changed `kind` `id`; returns the change's number, the next."""
        sql = "INSERT INTO changes (kind, id) VALUES (?, ?) RETURNING seq"
        rows: list[tuple[int]] = self._connection.execute(sql, (kind, id)).fetchall()
        [(seq,)] = rows
        return seq


class Database:
    """Made by `open_file` or `open_memory`. Transactions don't nest."""

    def __init__(self, connect: Connect) -> None:
        self._connect = connect

    @contextmanager
    def read(self) -> Iterator[Reader]:
        """A read transaction: one consistent view of the data."""
        with self._connect() as connection, _transaction(connection, "BEGIN"):
            yield Reader(connection)

    @contextmanager
    def write(self) -> Iterator[Writer]:
        """A write transaction, holding the write lock from its start. It commits when the block
        ends and rolls back if the block raises."""
        with self._connect() as connection, _transaction(connection, "BEGIN IMMEDIATE"):
            yield Writer(connection)


def open_file(path: Path) -> Database:
    """The database in `path`. A new one (and its folder) is created with the schema; an existing
    one is opened as it is. Each transaction has a connection of its own."""
    path.parent.mkdir(parents=True, exist_ok=True)
    return _with_schema(lambda: closing(_configured(turso.connect(str(path)))))


def open_memory() -> Database:
    """A new in-memory database with the schema. It lives in one connection, which transactions
    take in turns."""
    connection = _configured(turso.connect(":memory:"))
    turns = threading.RLock()

    @contextmanager
    def take_turn() -> Iterator[turso.Connection]:
        with turns:
            yield connection

    return _with_schema(take_turn)


def _configured(connection: turso.Connection) -> turso.Connection:
    connection.autocommit = True  # the driver opens no transactions: ours say BEGIN themselves
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute(f"PRAGMA busy_timeout = {BUSY_TIMEOUT_MS}")
    return connection


def _with_schema(connect: Connect) -> Database:
    """The database, with the schema applied if it has no tables yet."""
    with connect() as connection, _transaction(connection, "BEGIN IMMEDIATE"):
        [(tables,)] = connection.execute("SELECT count(*) FROM sqlite_schema").fetchall()
        if tables == 0:
            connection.executescript(SCHEMA.read_text(encoding="utf-8"))
    return Database(connect)


@contextmanager
def _transaction(connection: turso.Connection, begin: str) -> Iterator[None]:
    connection.execute(begin)
    try:
        yield
        connection.execute("COMMIT")
    except BaseException:
        connection.execute("ROLLBACK")
        raise

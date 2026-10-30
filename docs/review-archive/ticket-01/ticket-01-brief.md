# Review brief: ticket 1, the database boundary (round 1)

You are reviewing an uncommitted change in the worktree `C:\code\AgentOS-V2-backend` (branch
`ticket-01-db`, based on `origin/main`). See it with `git status` and `git diff`; the new files are
untracked (`git status --short` lists them). Don't edit any file except your answer file.

## Read first
- The ticket: `C:\agents\memory\agentos-v2\work\ticket-01.md` (scope, build list, done means).
- The project rules: `AGENTS.md`, then `docs/architecture.md` (Database; Core, shell, boundary).
- The API's live updates (the change sequence's purpose): `git show origin/docs/api:docs/api.md`,
  section "Live updates".

## What changed
- `pyproject.toml`, `uv.lock`: the `pyturso` dependency (0.8.3, `import turso`).
- `src/agentos/db/engine.py` (new): open a file or an in-memory database; foreign keys on, a busy
  timeout, `BEGIN IMMEDIATE` write transactions, a plain `BEGIN` read transaction; `Reader.all`,
  `Writer.run`, `Writer.record_change(kind, id) -> seq`; the schema applied to a database with no
  tables.
- `src/agentos/db/schema.sql` (new): the one schema; so far only the `changes` table.
- `src/agentos/db/__init__.py`: re-exports (it's in the gates' shell layer, so it holds no logic).
- `src/agentos/app/config.py`, `model.py`: the `AGENTOS_DATA_DIR` key (default `data`).
- `src/agentos/__main__.py`: opens (creates) `<data dir>/agentos.db` before serving.
- Tests: `tests/conftest.py` (per-test in-memory fixture), `tests/test_db.py` (fast),
  `tests/test_app.py` (config), `tests/integration/test_db_contract.py` (the contract suite on a
  real file), `tests/integration/test_server_process.py` (the server creates its database).

## Design choices to judge
1. **Connections.** Turso connections aren't shared across threads (DB-API threadsafety 1), and
   each `turso.connect(":memory:")` is a separate database. So a file database opens a fresh
   connection per transaction (measured ~0.15 ms) and relies on the engine's lock and busy
   timeout to serialise writers; the in-memory one keeps its one connection and transactions
   take turns on an `RLock` (a nested transaction then errors at once instead of deadlocking).
2. **The driver's own transaction handling is off** (`connection.autocommit = True`), so our SQL
   `BEGIN`/`COMMIT`/`ROLLBACK` are the only ones. (In its default "LEGACY" mode, `executescript`
   would commit an open transaction first.)
3. **Every statement runs to its end** (`fetchall`): probing showed a cursor left open on an
   `INSERT ... RETURNING` makes `COMMIT` fail with "SQL statements in progress".
4. **One sequence number per change** (`AUTOINCREMENT`, so a number is never reused once old rows
   are dropped; a rolled-back insert takes no number). The ticket says each recorded change gets
   the next seq.
5. **The waiting test** (`test_a_second_writer_waits_for_the_first_rather_than_failing`) needs to
   know the second writer is really blocked inside `BEGIN IMMEDIATE` before the first commits,
   without a sleep. It inspects the second thread's stack (`sys._current_frames()`) for a frame
   holding the value `"BEGIN IMMEDIATE"`. Is that sound, and is there something simpler that is
   still deterministic?
6. **Startup** opens the database in `__main__` and drops the handle: nothing uses it yet;
   ticket 2 would pass it into `create_app`. `__main__.py` isn't in the ticket's listed scope,
   but the startup lives there.
7. **No `Any` in the API**: rows are `tuple[Value, ...]` with `Value = int | float | str | bytes |
   None`; the driver's untyped results are given a type once, at annotated assignments.

## What to judge
Correctness first (transactions, rollback, the change sequence's gap-free/commit-order claim,
thread safety, Windows and Linux), then whether the tests prove what the ticket asks without
sleeps or picked deadlines, then fit with `AGENTS.md` (boundary/types, readability, smallest
API, comments and naming like the surrounding code), then scope. The reviewers guard against
accidents and shortcuts, not an adversary.

Known and reported separately (no need to repeat): pyturso has never shipped a Windows wheel, so on
Windows it builds from source with Rust (about 6 minutes here).

## Answer
Write your findings to the answer file you were given, as a list. Each finding: a label
(**must-fix**, **should-fix** or **nit**), `file:line`, what's wrong, and the fix. End with a
one-line verdict. If you find nothing at a level, say so.

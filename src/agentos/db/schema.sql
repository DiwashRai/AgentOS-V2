-- The one schema (docs/architecture.md, Database), applied to a fresh database. There are no
-- migrations: a change to this file means a fresh database.

-- The change sequence (docs/api.md, Live updates): a row for each change a write made, numbered
-- in commit order. AUTOINCREMENT never reuses a number, even once old rows are dropped.
CREATE TABLE changes (
    seq  INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN (
        'ticket', 'run', 'items', 'messages', 'library', 'settings', 'people', 'clients', 'intake'
    )),
    id   TEXT NOT NULL
) STRICT;

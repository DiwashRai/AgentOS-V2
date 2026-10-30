# Tickets

The build, as vertical slices. Each ticket is one PR:
- one behaviour, end to end through the packages it needs, in the same or neighbouring packages;
- its states written down as types first;
- proven by tests at the seams.

Production code stays at a few hundred lines per PR. From ticket 3 on, every write emits its change on the stream, and a settings area arrives with its own check and in-use refusals. "Packages" names where the code goes (architecture.md › Modules); "Verify" is how you check it without reading every line. Credential tests use sentinel values and assert they appear nowhere they shouldn't.

| Tickets | Milestone |
|---|---|
| 1–9 | People and tickets |
| 10–13 | Context and the library |
| 14–18 | Agents and workflows |
| 19–32 | Runs on the server, driven by a fake worker |
| 33–42 | The worker |
| 43–49 | Where runs run |
| 50–53 | Jira and the container |
| W1–W12 | The web, its own track (R14) |

## Ticket 1: The database boundary
*Packages:* `db`. *Verify:* the contract suite passes against real Turso on Windows and Linux.
- [ ] Open Turso (a file, or in memory), foreign keys on, write transactions that take the lock up front, a busy timeout
- [ ] The schema in one file, applied to a fresh database (no migrations); the server creates its database in `AGENTOS_DATA_DIR`
- [ ] The change sequence: a write transaction records `(seq, kind, id)`, with seq assigned inside that transaction
- [ ] A per-test in-memory database, fast enough for the speed gate
- [ ] Contract tests: CHECK, partial unique index and foreign key refusals; concurrent writers serialise; sequence numbers are gap-free in commit order

## Ticket 2: Dev sign-in and the session (R4, R5)
*Packages:* `people`, `app`. *Verify:* API tests: sign in, read the session, sign out; a write without the CSRF header is refused.
- [ ] Types: person, role (pending, viewer, writer, admin), session
- [ ] Sessions stored hashed; the cookie is HttpOnly, SameSite=Lax, Secure on https, 14 days
- [ ] Dev sign-in, loopback only (checked at startup and on every request); the dev user is always admin
- [ ] `GET`, `POST`, `DELETE /api/session`; config gains `AGENTOS_DEV_AUTH` and `AGENTOS_PUBLIC_URL`
- [ ] `app`: the one error body and its closed code set; the CSRF header on cookie writes; role checks; exceptions raised without chaining credentials (`from None`)

## Ticket 3: The change stream (D21)
*Packages:* `app`, `db`, `people`. *Verify:* in-process stream tests: a sign-in arrives as an event; a missed event is resumed; signing out closes the stream.
- [ ] `GET /api/changes` as server-sent events:
  - `ready` with the current id;
  - one event per change;
  - `Last-Event-ID` to resume;
  - `reset` with the current id for an id older than 24 h or ahead of the current one
- [ ] Streams are kept by session, and signing out closes them at once; a 15 s keepalive catches expiry; `X-Accel-Buffering: no`
- [ ] Writes made only for liveness emit nothing

## Ticket 4: Settings documents (R48, R49)
*Packages:* `settings`, `admin`. *Verify:* API tests: read, save, a stale save refused, a viewer can't save, a key prefix that is a Jira project key is refused.
- [ ] One versioned document per area, seeded on a fresh database, with typed reads for other packages
- [ ] Areas for now: `space` (name, key prefix, Jira projects, default repo) and `repos` (name, URL, default branch)
- [ ] `GET /api/settings` (viewer); `PUT /api/settings/{area}?base_version=` (admin); `POST /api/settings/{area}/check`, which lists every issue and saves nothing
- [ ] The key prefix can't be one of the Space's Jira project keys

## Ticket 5: Jira sign-in (R1, R2, R4)
*Packages:* `people`, `jira`. *Verify:* API tests against a fake Jira: Cloud and Data Center sign-in; no browse rights is refused; a pending user sees only their session; the 11th try in a minute is 429; the sentinel token appears in no log.
- [ ] The `jira` client: Cloud (email + API token) and Data Center (PAT); `/myself`; the browse check on the Space's projects (401, 403 or 404 means can't browse); redirects refused
- [ ] New users wait as pending; configured admins (`AGENTOS_ADMINS`) are always admin; credentials are checked, never stored or logged
- [ ] Sign-in limited to 10 tries a minute per address and user; proxy headers count only with `AGENTOS_TRUST_PROXY`

## Ticket 6: People admin (R2, R3)
*Packages:* `people`. *Verify:* one API test per rule.
- [ ] `GET /api/people` (one shape for everyone); `PATCH /api/people/{id}` (role, disabled)
- [ ] Disabling someone, or sending them back to pending, ends their sessions and closes their streams at once
- [ ] Nobody demotes or disables themselves; a configured admin can't be demoted

## Ticket 7: Native tickets: create, read, list (R6, R10)
*Packages:* `tickets`, `board`. *Verify:* API tests: create, read, page through, filter; closed tickets are hidden by default.
- [ ] Types: ticket, key (`<PREFIX>-<n>`), ticket type, priority, labels, state (open, done, closed)
- [ ] `POST /api/tickets {from: "new", ...}`, `GET /api/tickets/{key}`
- [ ] `GET /api/tickets`, paged and filtered in the database: `state` (default open and done), `owner`, `type`, `priority`, `q`

## Ticket 8: The conversation (R15)
*Packages:* `tickets`. *Verify:* API tests: post as a viewer; page backwards and forwards.
- [ ] `GET` and `POST /api/tickets/{key}/messages`, paged; viewers can post

## Ticket 9: Edit and resolve (R8, R9)
*Packages:* `board`, `tickets`, `admin`. *Verify:* API tests: an edit; a resolve whose note reads back as a message; a reopen; removing a repo that's in use.
- [ ] `PATCH /api/tickets/{key}` sends only the changed fields, and the last write wins per field: owner, repo (from the catalog, or none), base branch and where it came from. Changing the repo resets the base branch
- [ ] Resolve (done or closed, with a note posted to the conversation) and reopen are both a PATCH
- [ ] Removing a repo that an open ticket uses is 409 `in_use`

## Ticket 10: Path rules, one table for both ends (R46)
*Packages:* `agentos_protocol`. *Verify:* one table-driven test, including ASCII punctuation outside the whitelist and `CON .txt`; pure, stdlib only.
- [ ] The rule set:
  - only `[A-Za-z0-9._ @+-]`;
  - no `..` or `.git` in any case;
  - no trailing dot or space;
  - no reserved Windows names (including `CON .txt`);
  - no Unicode normalisation;
  - unique ignoring case
- [ ] One table of cases, used by the server now and by the worker in ticket 38

## Ticket 11: Ticket items (R16, R17, R18)
*Packages:* `context`, `tickets`. *Verify:* API tests: create, edit, a stale edit refused, delete then read the history, the size limits.
- [ ] Types: item (a name that is a path, a kind, writable or not) and its versions, each with the person or run that wrote it
- [ ] `GET`, `PUT`, `DELETE /api/tickets/{key}/items[/{name}]` for the text kinds:
  - `?base_version` (0 creates);
  - a delete is a version;
  - history paged, `?version=N`, `?deleted=1`
- [ ] Limits: 1 MiB per item, 20 MiB per ticket; names follow the path rules (ticket 10)
- [ ] A plan item's progress (done and total) in the list

## Ticket 12: The library and a ticket's starting context (R19, R49)
*Packages:* `context`, `settings`, `admin`, `board`. *Verify:* API tests: a new ticket starts with copies of the defaults; editing the library doesn't change the copy; a default naming a missing item is 422; deleting a default item is 409.
- [ ] `/api/library/items` with the same four endpoints; admins write
- [ ] The `defaults` settings area, starting with the default items
- [ ] Creating a ticket copies the default items, each recording where it came from
- [ ] A library item named in the defaults can't be deleted

## Ticket 13: Drift, take and promote (R19)
*Packages:* `context`. *Verify:* API tests for each drift direction, a take, a promote, and a promote conflict.
- [ ] Drift both ways in the item list: the copy changed since it was made, or the library moved
- [ ] `POST /api/tickets/{key}/take {name, from?}`, versioned against the ticket's copy
- [ ] `POST /api/tickets/{key}/promote {name, version, to?}` (admin):
  - refused if the reviewed version isn't current;
  - 409 with the diff if the library moved;
  - a new name creates a library item

## Ticket 14: Runtimes (R22, R49)
*Packages:* `workflows`, `settings`. *Verify:* pure tests of argv rendering with hostile values; API tests of the `runtimes` and `defaults` areas.
- [ ] Types: a runtime is an argv template, plus where its CLI reads skills and agents, plus its usage-limit marker
- [ ] Placeholders replace whole argv elements, so no value can split into flags; a `.cmd` shim never gets unsafe characters
- [ ] The `runtimes` settings area, seeded with Claude Code and Copilot CLI
- [ ] The default runtime, model and effort in `defaults` (R49's "prompt defaults")

## Ticket 15: Prompt templates (R28)
*Packages:* `workflows`. *Verify:* pure tests: a good prompt renders; an undefined name and a sandbox escape are refused.
- [ ] Sandboxed Jinja where undefined names are errors; Jira text is untrusted
- [ ] Checked against sample tickets on save; rendered with a ticket's fields

## Ticket 16: Agents as items (R23)
*Packages:* `context`, `workflows`, `admin`. *Verify:* API tests: a valid agent saves; bad frontmatter or an unknown runtime is 422 listing every issue; removing a runtime an agent uses is 409.
- [ ] The `agent` kind: markdown with frontmatter (runtime, model, effort), parsed and checked on save
- [ ] Removing a runtime that an agent uses is 409 `in_use`

## Ticket 17: Workflows as items (R24–R27)
*Packages:* `workflows`, `context`, `settings`, `admin`. *Verify:* one pure test per rule; API tests: a broken workflow lists every issue, and the in-use refusals.
- [ ] The `workflow` kind:
  - stages: agent or shell, enabled, gate after, phase, needs a repo, timeout, overrides;
  - checks, with 0–3 repairs;
  - loops
- [ ] The rules on save:
  - a loop has a maker and a check;
  - loops don't overlap;
  - a gate only on a loop's last stage;
  - at most 5 rounds
- [ ] "Standard" is seeded, and the default workflow is chosen in `defaults`. Deleting the default workflow, or an agent a library workflow uses, is 409 `in_use`
- [ ] Promoting a workflow whose agent the library lacks is 422

## Ticket 18: A ticket's workflow (R27)
*Packages:* `board`, `context`, `tickets`. *Verify:* one API test per rule.
- [ ] A new ticket copies the default workflow and the agents it uses
- [ ] Switching workflow is a `take` on `workflow`: it copies the agents the ticket lacks and keeps the ticket's own
- [ ] Repo-only stages on a no-repo ticket:
  - turned off at creation, when the repo is cleared, and on a switch;
  - they can't be turned back on

## Ticket 19: Run and job states (R29–R31)
*Packages:* `runs` (core only). *Verify:* pure tests of every allowed and every refused transition; you review the types before ticket 20.
- [ ] Types: runs, jobs, stage runs, stops and the route (runner, mailbox or client), completing the sketch in architecture.md
- [ ] The transition table, and the one function that ends a run (keeps the first error, closes open stage runs)
- [ ] The deadline and budget formulas, with the start allowance passed in (rules.md › Runs and jobs)

## Ticket 20: The actions a ticket offers (R11, D18)
*Packages:* `runs` (core only). *Verify:* a table-driven pure test over run histories.
- [ ] Pure rules:
  - in: the ticket, its workflow, its runs;
  - out: dispatch, continue, retry, run from, request changes, cancel, resolve, reopen, each with why it's blocked
- [ ] A changed workflow withdraws continue, retry and request changes

## Ticket 21: Dispatch (R11, R29)
*Packages:* `runs`, `settings`, `board`. *Verify:* API tests: a repo dispatch and a no-repo dispatch; a second one refused; each refusal reason; a loop stage starting at round 2; the ticket's actions changing as runs are made.
- [ ] The run and job tables, with CHECK constraints per state
- [ ] The `runner` settings area: mode (live or mailbox), start allowance, publish method (git or the GitHub API)
- [ ] `POST /api/tickets/{key}/runs {from_stage?, target?}` queues a run and stores its route. It needs:
  - an open ticket whose workflow renders;
  - in repo mode, a repo from the catalog and a base branch;
  - no other active run on the ticket (a unique index)

  Dispatching a loop stage starts at round 2. (Client targets come in ticket 44.)
- [ ] `GET /api/tickets/{key}/runs`, `GET /api/runs/{id}`; the actions (ticket 20) shown on `GET /api/tickets/{key}`

## Ticket 22: The job package (R21, R40, R43)
*Packages:* `runs`, `agentos_protocol`, `context`, `workflows`. *Verify:* service tests: what the package holds; context edited after dispatch is in it; no sentinel secret is in it; a render failure is reported.
- [ ] The job package types, in `agentos_protocol` (lockstep version, stored with each job)
- [ ] Building the package from the context and workflow as they are at launch:
  - every round's and repair's prompts rendered;
  - context placed per runtime;
  - the workflow version recorded (D18);
  - the publish method carried;
  - no secrets
- [ ] The job token is minted here and stored hashed
- [ ] `GET /api/runs/{id}/package`

## Ticket 23: Launch and the fence (R21, R39)
*Packages:* `runs`, `targets`. *Verify:* service tests with a fake clock and a fake target: the oldest unfenced run launches first; a second run waits behind the fence; a launch failure or changed stage ids fail the run.
- [ ] The dispatcher takes the oldest unfenced queued run, builds its package (ticket 22) and starts it on its target
- [ ] The fence: a new launch waits while an earlier job of the ticket may still write. A result, the deadline, or the run ending while its job is unbound lifts it; later tickets add the other lifts
- [ ] The `Target` interface, with a fake target in tests; a launch failure fails the run with its reason

## Ticket 24: The journal: binding and progress (R40, R41)
*Packages:* `journal`, `runs`, `agentos_protocol`. *Verify:* a fake worker drives the API: it binds, reports two stages, and sends a duplicate and a gap.
- [ ] The journal record types, in `agentos_protocol`
- [ ] `GET /api/worker/job` and `POST /api/worker/journal`, with the job token and the instance header
- [ ] Binding by the first `started`; another instance is refused, and so is an ended unbound job
- [ ] Apply and acknowledge in one transaction:
  - duplicates skipped;
  - a gap stops the batch;
  - a bad record becomes a warning and is listed as rejected
- [ ] Stage, log, warning and verdict records become stage runs and events; `GET /api/runs/{id}/events`, paged

## Ticket 25: The journal: protocol versions and limits (R40)
*Packages:* `journal`, `runs`. *Verify:* fake-worker tests: a post on another version is refused in the fixed shape; a server restart fails other-version runs and keeps their fence; each limit holds.
- [ ] A post on another protocol version gets the fixed-shape refusal that every worker reads as "the run has ended"
- [ ] At startup, runs whose jobs are on another version fail, their CI runs are cancelled, and their jobs keep fencing
- [ ] Limits:
  - 500 records a post;
  - 100k events a run, with 1k kept for non-log events;
  - agent lines 256 KiB, other streams 8 KiB

## Ticket 26: The journal: results and the pin (R30, R34)
*Packages:* `journal`, `runs`, `tickets`. *Verify:* fake-worker tests for each outcome, the PR URL, and a pinned repo refused.
- [ ] `result` ends the run as gated, succeeded, failed or cancelled:
  - nothing applies after it;
  - an exact resend is accepted;
  - a rejected result is a failure;
  - its PR URL goes on the run and the ticket
- [ ] `pushed` records the head
- [ ] `runs` sets the pin at the first stage start in repo mode; PATCH then refuses the repo and base branch with 409 `workspace_pinned`

## Ticket 27: The run lock and request changes (R11, R29)
*Packages:* `runs`, `tickets`, `context`. *Verify:* fake-worker tests: each locked edit is refused while a run is active and allowed after it ends; request changes on a gated run.
- [ ] The run lock's scopes, set with their transitions and cleared when the run ends; locked edits are refused with `run_active`
- [ ] `notes` on dispatch: request changes starts from the gated stage and appends the notes to the `changes` note

## Ticket 28: The journal: synced context (R33)
*Packages:* `journal`, `context`. *Verify:* fake-worker tests: a synced item becomes a version by the run; an undeclared path or wrong mode is refused; a rewritten note warns.
- [ ] `sync` writes item versions authored by the run: only declared writable items, in their mode
- [ ] A note that's rewritten rather than appended to gets a warning

## Ticket 29: Run output (R32)
*Packages:* `journal`, `runs`. *Verify:* API tests: an upload and its download; a bad token is refused before the body is read; an oversized `Content-Length` is refused unread; a hash mismatch is refused.
- [ ] `PUT /api/worker/output`:
  - the token checked before the body is read;
  - an oversized `Content-Length` refused (413) unread;
  - the 20 MiB limit enforced while streaming;
  - the hash must match the `output` record;
  - unencodable file names handled
- [ ] `GET /api/runs/{id}/output`

## Ticket 30: Cancel and the reaper (R35)
*Packages:* `runs`, `targets`, `journal`. *Verify:* table tests with a fake clock, and one service test per reaper rule.
- [ ] `POST /api/runs/{id}/cancel`:
  - a queued or launched-but-unstarted run ends at once;
  - a running one gets a stop on its next journal reply
- [ ] The live reaper:
  - its table as pure rules, run every 15 s;
  - compare-and-set writes;
  - sleep grace (clients' lease times never refreshed);
  - the fence lifted at a job's deadline;
  - it cancels the CI run when it ends a runner run

## Ticket 31: The board (R12, R13)
*Packages:* `board`, `runs` (core). *Verify:* pure derivation tests from run histories, and one API test of my queue.
- [ ] Derived fields:
  - phase;
  - rail, with gate state and "round N of M";
  - `waiting_on`, with R12's seven attention values;
  - now;
  - plan progress
- [ ] `GET /api/tickets` carries them, with each ticket's actions (ticket 20), so a row can offer Approve; `needs=<person>` is applied before the page is cut
- [ ] A run's change also lists its ticket on the change stream

## Ticket 32: The worker program (R42, D17)
*Packages:* `program`, `journal`. *Verify:*
- the hash is the same for both formats and across builds;
- the unpacked files match it;
- an extracted archive starts under a clean Python 3.11 outside the checkout.
- [ ] Build the tar.gz (standard library) and the 7z (`py7zr`) from `agentos_worker` and `agentos_protocol`, with one content hash over the files
- [ ] `GET /api/worker/program?format=`, the hash in a header; a `started` with another hash is refused

## Ticket 33: The worker reads its job (R40, R43)
*Packages:* `agentos_worker` (core, http). *Verify:* fast tests with fake HTTP:
- a good job parses;
- a job with an extra field or another protocol version is refused whole;
- a tampered program file stops the worker before it runs anything;
- no AgentOS variable is left in the environment, whatever its case on Windows.
- [ ] `python -m agentos_worker` checks its own unpacked files against the hash it was given, then fetches its job. A small stdlib parser refuses anything that doesn't fit, and the protocol version must match
- [ ] It strips every AgentOS credential from its environment (names compared ignoring case on Windows); tokens never go on argv or into logs; output is scrubbed before it's clipped

## Ticket 34: The journal client (R41)
*Packages:* `agentos_worker` (http, core). *Verify:* fast tests against a fake server and clock:
- a lost acknowledgement is resent from the right point;
- a stop reply reaches the caller;
- a 410 means publish nothing;
- an unreachable server gives up in time for the deadline.

  Then one integration test against the real server.
- [ ] Records buffered until acknowledged:
  - flush every second or at 200 records;
  - a heartbeat at least every 10 s;
  - resend from the acknowledged point;
  - bounded backoff on server errors
- [ ] It binds first and touches nothing until that's acknowledged
- [ ] It passes on cancel and run-ended replies, handles 409, 401 and 410, and treats the protocol refusal as "run ended"

## Ticket 35: Processes (R45)
*Packages:* `agentos_worker` (procs). *Verify:* integration tests on both platforms: a whole tree dies; Ctrl+C doesn't kill a run; a grandchild holding a pipe doesn't hang it; no console window appears.
- [ ] Windows:
  - a job object with kill-on-close, the process started suspended (no launcher race), with a tree kill as fallback;
  - `CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW`, for git and helpers too
- [ ] POSIX: a new session, killed with `killpg`
- [ ] Read pipes before writing stdin, and write stdin from a thread; abandon readers after 5 s
- [ ] Liveness by file lock, never by PID

## Ticket 36: Git: clone and push safely (R44)
*Packages:* `agentos_worker` (git). *Verify:* integration tests against a local bare repo: a force push and a moved branch are refused; a bad branch name or URL is refused before git runs; the sentinel token is in no git argv.
- [ ] Blobless clone without tags; the branch-name pattern; URL safety (never starting with `-`, after `--`, no userinfo except `git@`); a non-interactive environment
- [ ] Push only the ticket's branch, never force; a branch that moved is refused
- [ ] Check the run isn't gone and the deadline hasn't passed before every publish
- [ ] Commit as the user locally and on a client; only CI uses the AgentOS identity

## Ticket 37: Git: context never committed, hooks kept (R44)
*Packages:* `agentos_worker` (git). *Verify:* integration tests against a local bare repo: context files, `.agentos/` and build junk never reach a commit, even through a `.gitignore` negation; the user's hooks still run.
- [ ] Context files, protected paths, `.agentos/` and build junk are never committed:
  - excluded;
  - skip-worktree;
  - unstaged after `git add -A`;
  - a final guard over the run's commits
- [ ] Hooks run and chain to the user's own; pre-push requires the run's marker

## Ticket 38: The workspace and its context (R16, R20, R33, R46)
*Packages:* `agentos_worker` (files, run). *Verify:* fast tests on a temp folder: blocks round-trip in LF and CRLF; a marker inside a block is refused; collisions, including ones differing only in case, fail; a link or junction is refused; a name the path rules refuse is refused. A fake journal sees the sync.
- [ ] The workdir is absent or empty, and outside any git repo
- [ ] Write the context:
  - every name checked with the path rules (ticket 10);
  - every instructions item goes in as named blocks between markers, byte-exact, keeping a same-name file the repo already has;
  - a marker inside a block is refused;
  - skills and agents go where the runtime reads them;
  - a collision fails setup;
  - no links (junctions included) at any path component, regular files only
- [ ] Sync back after each stage: changed writable items, in their mode

## Ticket 39: Running a stage (R24, R26, R32)
*Packages:* `agentos_worker` (core, run). *Verify:* fast tests with a fake process runner scripted per stage: a fake CLI's stream-json output arrives as log events; a stop kills the stage and still pushes. Then one integration test with a real tiny script.
- [ ] Agent stage:
  - argv and stdin from the package, output streamed as logs;
  - the verdict from structured output or the verdict file (deleted before each check)
- [ ] Shell stage: exit 0 passes
- [ ] Stage timeouts
- [ ] A stop on cancel or over budget kills the stage, then still syncs, commits and pushes
- [ ] A usage limit fails with its reason (D24)
- [ ] In CI, `::stop-commands::` goes out before any agent runs, and the console echo strips control characters

## Ticket 40: Loops, gates and verdict repairs (R25, R26, R30, R31)
*Packages:* `agentos_worker` (core, run). *Verify:* fast tests with a fake process runner: a loop that passes in round 2; a loop exhausted at 5 rounds; an invalid verdict repaired; a run stopping at a gate.
- [ ] Rounds:
  - makers resume their session each round, and checks start fresh;
  - a check's "fail" counts as done except in the last round
- [ ] An invalid verdict is repaired by resuming the session (up to the stage's repairs); failing that, the check fails
- [ ] The run stops at a gate with an enabled stage after it

## Ticket 41: Finishing a run (R32, R34)
*Packages:* `agentos_worker` (run). *Verify:* end to end: the real server, a real worker, a local bare repo and a fake agent CLI. A run stops at its gate; Continue finishes it; the branch holds the commits; the workspace is gone; with the server unreachable, the work is still pushed.
- [ ] Commit and push after every stage, reporting `pushed`
- [ ] At the end: a PR lookup through `gh`, the output upload, then the result
- [ ] If the server is unreachable, still commit and push before the deadline
- [ ] The workspace is deleted after success or cancel (clearing read-only flags, with retries) and kept after a failure
- [ ] The console echo and the PR lookup can each be turned off

## Ticket 42: Publishing through the GitHub API (R47)
*Packages:* `agentos_worker` (git, http). *Verify:* fast tests against a fake GitHub API: a publish lands one commit; a merge, a non-ancestor and a forced update are refused; an ambiguous reply is read back.
- [ ] Used when the package's publish method is the GitHub API (set in `runner`, ticket 21)
- [ ] Probe that the token can write blobs; read blobs from git's object database
- [ ] One commit per publish; non-ancestors and merges refused; the tree must equal HEAD's
- [ ] Ref updates never force; an ambiguous reply is read back; the gone and deadline check runs before every ref write
- [ ] A GitHub 401 is never "the run is gone"; redirects refused
- [ ] Afterwards, sync the local branch to the published commit

## Ticket 43: Client tokens (R38)
*Packages:* `people`. *Verify:* API tests: a token is shown once; revoking deletes it; a disabled user's tokens stop working.
- [ ] `/api/me/clients`: tokens stored hashed, shown once, revocable; a disabled user's tokens stop at once

## Ticket 44: The lease and client targets (R38)
*Packages:* `journal`, `runs`, `people`. *Verify:* API tests:
- a queued client run is leased;
- gone lifts the fence, and repeating it is harmless;
- only the owner can target their client;
- a disconnected long poll takes nothing;
- a client going offline is a `clients` change.
- [ ] `POST /api/worker/lease`:
  - a long poll, off the event loop and before the write lock, that notices a disconnect;
  - takes a job in one transaction;
  - alive and gone lists of at most 100, with gone idempotent;
  - the fixed envelope
- [ ] Online is derived from the last lease. The reaper emits a `clients` change when a client goes online or offline
- [ ] Client targets: only the owner, with an existing client; a queued client run also locks the owner, title, description and type, and the context from the queue
- [ ] Dispatch defaults to my online client when I own the ticket

## Ticket 45: The client loop (R38)
*Packages:* `agentos_worker` (client). *Verify:* integration tests: a client takes two runs, and restarting the client doesn't kill them; the env file's credentials reach the run, and no AgentOS credential does.
- [ ] `python -m agentos_worker --client`:
  - the token from the environment;
  - an env file for agent and git credentials;
  - one client per root (a lock);
  - the root outside any git repo
- [ ] Program folders named by hash and reused:
  - a lease naming a new hash fetches it;
  - a download that doesn't match is refused;
  - unused folders are removed
- [ ] Run workers are detached from the client; gone is reported only after a worker exits and its lock is free, and resent until acknowledged
- [ ] A check-in every 30 s while busy; transient errors back off up to 60 s
- [ ] It restarts on a protocol mismatch, and cleans up only folders it owns

## Ticket 46: The GitHub Actions target (R36)
*Packages:* `targets`, `github`, `runs`, `settings`. *Verify:* fast tests against a fake GitHub API, then one real run on agentos-scratch with claude-haiku-5-5.
- [ ] Workflow dispatch, status and cancel; the `runner` area gains the repo and workflow
- [ ] A CI run counts as ended only when all its CI jobs are done
- [ ] The workflow template:
  - the job token masked from the event payload;
  - no `${{ }}` inside `run:`;
  - repo access through the job's own `GITHUB_TOKEN`;
  - the CI job's timeout longer than any deadline
- [ ] The reaper uses the provider's status:
  - the start allowance is waived while the CI run is running;
  - a CI run that ended lifts the fence;
  - the CI run is cancelled when the run ends

## Ticket 47: Mailbox: handing the job out (R37)
*Packages:* `targets`, `artifactory`, `runs`, `journal`. *Verify:* fast tests against fake Artifactory and GitHub: the job and program arrive with their hashes; the run is running and pinned at hand-out; the job token is refused.
- [ ] Upload the job and the program for the runner's OS to Artifactory, with their hashes
- [ ] The three-job workflow, on separate or ephemeral runner pools:
  - fetch (holds the secret, checks the hashes);
  - work (no secret);
  - publish
- [ ] The server marks the run running at hand-out, sets the pin, and refuses any use of the token

## Ticket 48: The worker's mailbox mode (R37)
*Packages:* `agentos_worker` (run, http). *Verify:* fast tests: a run in mailbox mode writes an outbox of journal records, with no `started` and no `output`.
- [ ] `--manifest --outbox`: the same run, writing journal records to the outbox instead of posting them

## Ticket 49: Mailbox: the loop and replay (R37)
*Packages:* `journal`, `targets`, `runs`. Artifactory sits behind `targets`. *Verify:* fast tests against fakes: a replayed outbox ends the run as a live one would; each mailbox rule; the sweep.
- [ ] The mailbox loop:
  - checks the CI run every 20 s, counting it ended only when all its CI jobs are done;
  - fetches the outbox (at most 512 MiB) and replays it through the journal;
  - applies the mailbox rules (never picked up, no launch reference, past the deadline, cancel)
- [ ] The run's Artifactory folder is deleted after replay and at the end; an hourly sweep removes the rest

## Ticket 50: Take in from Jira (R7)
*Packages:* `board`, `jira`, `tickets`. *Verify:* fast tests against a fake Jira: the service account is used; taking in an issue twice gives one ticket; its type is mapped; its text is stored as given.
- [ ] The Jira service account from the environment (`AGENTOS_JIRA_*`), used for take-in, intake and field discovery
- [ ] `POST /api/tickets {from: "jira", ref}`: taking in the same issue again returns it, not a copy
- [ ] The v2 import: wiki text, treated as untrusted; issue types mapped to the four ticket types; any valid key

## Ticket 51: Intake (R49)
*Packages:* `board`, `admin`, `settings`, `jira`. *Verify:* fast tests against a fake Jira: Cloud and Data Center paging; an invalid query reported; a new issue appearing as an `intake` change.
- [ ] The `intake` settings area (saved JQL), with a preview in its check
- [ ] Cloud search paged by `isLast`, counted with `approximate-count`, and invalid JQL detected; Data Center search with a total
- [ ] Refreshed every minute and on save; `GET /api/jira/intake`; an `intake` change on the stream

## Ticket 52: Mappings (R8, R49)
*Packages:* `admin`, `settings`, `jira`, `board`. *Verify:* fast tests against a fake Jira: a mapped field sets the base branch at take-in; the preview shows the result for a sample issue.
- [ ] The `mappings` settings area: a Jira field mapped to the base branch, applied at take-in
- [ ] `GET /api/jira/fields`; the check previews the result for a sample issue

## Ticket 53: The container (R50)
*Packages:* none (build). *Verify:* build the image with only the Artifactory indexes configured (no public registry reachable); run it; health answers and the web loads.
- [ ] A Containerfile: Artifactory-only installs, a RHEL 8 base, Python 3.11, the server and the built web

# The web

Its own track, in `web/`, on typed fixtures shaped like `api.md` until W12 swaps in the real API. Only `kit/` renders elements or has CSS; screens pass token names. Each component arrives with the first screen that uses it. **Verify (every ticket):** the screen beside V1's, in light and dark, in the states named; `count.mjs` counts components, tokens and raw values on both.

## Ticket W1: The web foundation
*Verify:* `/kit` in both themes; `count.mjs` on V1 and V2.
- [ ] `web/`: Vite, React, TypeScript 5.9, ESLint 9 with sonarjs, Prettier, Stylelint and Vitest, run by `just` and CI
- [ ] Tokens (light and dark), the theme menu, the app frame, and `/kit` showing the tokens
- [ ] Types from `api.md`, and one data module served by fixtures
- [ ] `web/tools/count.mjs`

## Ticket W2: Intake
*Verify:* a full query, a failing one, an empty one.
- [ ] The components Intake needs
- [ ] The saved queries' issues, and take one in

## Ticket W3: Compact
*Verify:* every group, an expanded row.
- [ ] The board filtered via the URL, grouped by attention; expand a row; j/k and Esc

## Ticket W4: My queue and the peek
*Verify:* full and empty zones, the peek.
- [ ] `needs=<me>` in V1's zones; `?peek=KEY` over both views; row actions (Approve)

## Ticket W5: The ticket: header, overview, conversation
*Verify:* gated, running, done.
- [ ] Actions with reasons; the stage strip; the plan
- [ ] Edit, resolve, reopen; messages; a new ticket

## Ticket W6: The ticket's runs (R32)
*Verify:* live, failed, a package.
- [ ] Stages, rounds, verdicts, events with agent output summarised (stream-json, Copilot JSONL), output, cancel

## Ticket W7: Context items, ticket and library
*Verify:* drift, versions, a promote conflict.
- [ ] One feature for both scopes; take and promote

## Ticket W8: Workflows, ticket and library
*Verify:* Standard, a loop, a 422 listing issues.
- [ ] Stages, loops, repairs; switching workflow; run from

## Ticket W9: Settings: space, repos, runner, defaults
*Verify:* unsaved, issues, a stale save.
- [ ] The settings nav; one area form: version, save, an unsaved-changes guard

## Ticket W10: Settings: intake, mappings, runtimes
*Verify:* each preview.
- [ ] The list editors; `check` issues and previews

## Ticket W11: Settings: people and my clients
*Verify:* admin, viewer, a new token.
- [ ] Roles and disabling; tokens shown once, revoke

## Ticket W12: The real API
*Verify:* every screen against a running V2 server; a change made in one tab shows in another within 3 s (R14).
- [ ] Types generated from the server's OpenAPI; the data module swapped from fixtures to the API
- [ ] Sign-in, and the `/changes` stream shared across tabs
- [ ] The server serves the built web (the SPA's `index.html` for unknown paths, a 404 for missing assets)

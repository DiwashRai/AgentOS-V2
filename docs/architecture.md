# Architecture

## Parts

| Part | What |
|---|---|
| Server | Python 3.11+, FastAPI. The API, the run state machine, the dispatcher and the worker protocol. |
| Database | Turso, behind one boundary module, so SQLite can replace it without touching anything else. |
| Worker | Python 3.11, standard library only (runners have plain Python). Served by the server as one file. |
| Web | V1's web app until V2's API exists; then a new web on a component kit (Q3, plan step 10). |

## Core, shell, boundary

Every feature (tickets, context, runs, workers, ...) is split by role:

| Role | Holds | Rules |
|---|---|---|
| **Boundary** | Everything touching the outside: HTTP routes and their models, database rows, Jira, GitHub, git, processes, files, config | Input is parsed here, once, with a library (Pydantic on the server, a small parser in the worker), into our own types. Anything that doesn't fit is refused whole, saying why. |
| **Shell** | Use cases: open the transaction, load, call the core, apply its decision, save | Thin. Decisions belong in the core. A use case spanning features (dispatch, the journal) is its own module, not part of one feature's. |
| **Core** | Domain types and rules, pure | No I/O, no clock (time is passed in), no `Any`, no defensive checks: values are already the right type. |

- A feature is a package; its files say their role by name: `model.py` and `rules.py` (core), `service.py` (shell), `routes.py`, `rows.py` and adapters (boundary). The gates and import-linter read the same names.
- One module, one job, readable in a sitting: most a few hundred lines, none over 1,000.
- import-linter enforces the direction: boundary and shell may use the core; the core uses nothing else; features use each other only through their public modules; no cycles.

## Modules

The server's packages, highest first. Each owns its tables (in the one schema file) and its slice of the API ([api.md](api.md)). "Uses" lists the only packages it may import; import-linter enforces the list from plan step 1. A package only uses rows below it, so there are no cycles.

| Package | Owns | Uses |
|---|---|---|
| `app` | The composition root: the FastAPI app, startup config, the choice of target adapter, auth dependencies, the error handler, `/health`, `/changes` | every package's routes |
| `board` | `/tickets` and `/tickets/{key}`, which span features: the list and detail with derived fields (phase, rail, waiting on, now, plan progress) and the actions on offer, from `runs`' rules (R11-R14); create and take in (with the starting context); edits (a cleared repo turns off repo-only stages); `/jira/intake` | `runs`, `context`, `tickets`, `settings`, `people`, `jira` |
| `admin` | Settings saves and checks, which look across features (a repo, runtime or library item in use); `/jira/fields` | `context`, `tickets`, `settings`, `jira` |
| `journal` | The worker side: `/worker/*` (serving the program, the job, binding and ingest, the output upload, the client lease and its "gone" reports) and the mailbox loop (it watches the CI run, fetches the outbox and replays it through the same ingest) | `runs`, `context`, `people`, `targets`, `program` |
| `runs` | Run, job and stage-run states, the transition table, the actions a ticket offers (pure: ticket, workflow, runs in; actions and reasons out), dispatch, launch (building the package, with each runtime's generated CLI files, R20), the fence, cancel, the live reaper, `/tickets/{key}/runs` and `/runs/*`. It sets and clears the ticket's run lock and sets the workspace pin at the first stage start (rules.md › Runs and jobs); `tickets` and `context` check them | `context`, `tickets`, `settings`, `people`, `targets`, `program` |
| `targets` | The `Target` interface (start, cancel, status) and its adapters: GitHub Actions, and mailbox (Artifactory, then GitHub Actions), which also fetches, deletes and sweeps outboxes for `journal`. No database: what an adapter returns, its caller stores | `github`, `artifactory` |
| `context` | Items, versions, the library, drift, take and promote, size limits; `/tickets/{key}/items`, `/library/items`, `/tickets/{key}/take`, `/promote` | `tickets`, `settings` |
| `tickets` | Tickets: fields, keys, states, the run lock and the workspace pin, the conversation (`/messages`) | `people`, `settings` |
| `people` | People, roles, sessions, sign-in, client tokens and whether one is online (the one derivation dispatch and `/me/clients` read); `/session`, `/people`, `/me/clients` | `settings`, `jira` |
| `settings` | The settings documents, their typed reads, `GET /settings` | nothing |
| `program` | Builds the worker program from `agentos_worker` and hashes it | nothing |
| `jira`, `github`, `artifactory` | Their HTTP clients: boundary only | nothing |
| `workflows` | Stage and loop rules, prompt templates (sandboxed Jinja), runtimes' argv: pure | nothing |
| `protocol` | The job package and journal record types, the protocol version, the path rules: stdlib only, shared with the worker | nothing |
| `db` | The Turso connection, the schema, transactions, the change sequence | nothing |

- Every package above them may use the pure ones (`workflows`, which uses `protocol`; `protocol`, which uses nothing), and every package with tables uses `db`; the lists above leave them out. `workflows`, `protocol`, `program`, `targets` and the HTTP clients never use the database.
- `runs` is the largest: most of V1's hard logic. If it outgrows a sitting, the reaper and launch split out first.
- `board` grows with the plan: tickets in step 5, the derived fields and actions once `runs` exists (step 7).

The worker is its own package (`agentos_worker`):
- `core` holds the job plan, verdicts and the stage order, using `protocol`;
- `run` (one job) and `client` (the lease loop) are the shell;
- `http`, `git`, `procs` and `files` are its boundaries, each behind an interface the tests fake.

## States first

Bad states can't be written down. A value's type says which state it's in, so code matches on it once. The full set of states and transitions is designed before the API's models (plan step 2); the sketch:

```python
Run       = Queued(reason) | Launched(UnboundJob) | Running(BoundJob | HandedOutJob, started_at, stop: Stop | None)
          | Gated(started_at, at, EndedJob) | Succeeded(started_at, at, EndedJob)
          | Failed(why, Started(at, job) | NeverStarted(job | None))
          | Cancelled(Started(at, job) | NeverStarted(job | None))
Stop      = Cancel(at) | OverBudget(at)                         # asked, not yet acted on
Launch    = Starting(at) | Ref(provider_id)                     # runner and mailbox jobs: the CI run's reference
job       = LiveJob(deadline) | EndedJob(why)                   # after the run ended: the fence reads it
HandedOutJob: mailbox, no binding.  A job exists only inside its run, and its kind follows the run's route.
Route     = Runner(provider) | Mailbox(provider) | Client(owner)  # stored at dispatch
StageRun  = Pending | StageRunning(round) | StageDone(round, status, verdict | None)
Workspace = NoRepo | Repo(url, base_branch: BaseBranch | None, branch)
Stage     = AgentStage(agent, prompt, resume, check: AgentCheck(repairs) | None)
          | ShellStage(command, is_check)
Item      = an owned copy (version, copied_from: library version | None)
```

- An honest optional is fine where absence is one real case and is checked once (`owner: Person | None`). One `None` meaning several things, or fields only valid together, is a missing type.
- Each variant maps to rows with CHECK constraints tying columns to the status, so the database can't hold a state the types can't.
- One shape per entity, in the core. The boundary converts it to and from rows (its decoders) and API models (Pydantic, generated from or checked against the core type), so an entity never grows separate shapes per layer.

## Errors

- Expected outcomes are values: a refused dispatch, an invalid workflow, a rejected journal record. The API turns them into one error shape with a closed set of codes and every issue listed.
- Everything else propagates to one handler per entry point (the API, each background loop, the worker's main).
- Cleanup uses `with`; a `try` belongs at the boundary or inside a context manager.

## Database

- Schema in one file: CHECK constraints for every enum and state, foreign keys on, the one-active-run rule as a unique index.
- One typed decoder per query: the only place a raw row is read.
- The run state machine is a table of allowed transitions; every state write is a guarded update generated from it, in one transaction; one function ends a run.
- A contract test suite runs against the real database engine (transactions, concurrent dispatch and leases, constraints), so fast in-memory tests elsewhere don't hide engine behaviour.
- No migrations while one person uses it: a schema change means a fresh database.

## Events over timers

Anything that doesn't have to be a timeout isn't. Normal paths run on explicit messages: a result lifts the fence, a cancel rides the worker's next journal reply (runners take no inbound calls), a client reports a finished worker. Timers only detect a party that died and can't say so.

## The worker

- A package with the same three roles, enforced the same way; built into one deterministic file the server serves and hashes.
- Git, processes, HTTP and the clock sit behind small interfaces, so tests use fakes.
- Process handling for Windows and Linux (rules.md › Processes) is part of the process boundary from the first version.

## The API

- Designed from the requirements, as small as it can be: the resources and actions the requirements need, nothing per screen.
- Models are discriminated unions where the domain is; the web's types are generated from the server's schema.
- Writes that can conflict carry a version and get `stale_version` back.

## Tests and gates

The test rules are in `AGENTS.md`. The gates come over from V1 with an empty baseline (the `code-gates` skill).

# API

V2's API, drafted from the requirements and mapped against V1's ([api-v1.md](api-v1.md)). Resources and actions are settled here; the models follow the states (plan step 2), and the OpenAPI schema comes from the code.

**43 endpoints against V1's 66.** The table at the end maps every V1 endpoint to V2.

## Principles

- **One shape per resource.** No second path that changes the same thing: no `/resolve` beside `PATCH`, no `/workflow` beside the pipeline.
- **One context-item API**, used by a ticket and by the library.
- **No per-screen endpoints, and no copies.** A screen composes resources. Run state is served once, by the run.
- **Payloads don't depend on the viewer.** The board says who a ticket waits on; the web turns that into "needs you" by comparing it with the signed-in user.
- **Context is versioned, the same way everywhere:** items and settings. Ticket fields aren't (last write wins, D22).
- **No polling.** One event stream tells the web what to refetch (D21).
- **Readable by viewers, written by role.** Nothing is public except health, the session and the worker program. Settings are readable by viewers on purpose (V1's public `/config` leaked repo URLs; rules.md › Access).

## Conventions

| Topic | Rule |
|---|---|
| Auth | Session cookie for people, as V1 (rules.md › Access). Bearer job token (plus an instance header once bound) for workers; Bearer client token for clients. |
| CSRF | `X-AgentOS: 1` on every cookie write; CORS off. |
| Roles | Reads need viewer; ticket and context writes need writer; library, settings and people writes need admin. Pending users see only their session. |
| Versions | Items and settings areas carry `version`. A person's edit to one, whatever its method, takes `?base_version=N` (0 creates); 409 `stale_version` if it moved. Appends (request-changes notes) and the system's writes (a run's synced items, repo-only stages turned off in the workflow item) take none. Every write to an item adds a version; derived fields (the board, drift) never bump one. Tickets carry no version. |
| Locks | While a run is active, the ticket's run lock refuses some edits with 409 `run_active`. Its scopes, and when each starts, are in rules.md › Runs and jobs. |
| Pagination | One convention: `?after=<cursor>&limit=N`, or `before=` to page backwards, returning `{items, next}`. Every list that grows pages: tickets, runs, messages, events, item versions. A page may come back short while `next` is set. |
| Errors | V1's body: `{"error": {code, message, issues[{loc, message}]}}`. One closed code set, smaller than V1's: one `not_found` (the message names the resource) instead of five lookup codes; 409 for state conflicts, 422 for bad input. The set is fixed with the states. |
| Ids | Tickets by key; items by name (a path, rules.md › Files and paths); everything else by integer id. Timestamps are UTC ISO 8601. |

## Endpoints

### Session and people

| Endpoint | Access | What |
|---|---|---|
| `GET /api/health` | pub | Liveness for the container |
| `GET /api/session` | pub | `{auth_mode, jira_url, me \| null}`: everything the web needs before signing in |
| `POST /api/session` | pub | Sign in. Body by mode: Cloud `{email, token}`, Data Center `{token}`, dev `{name}` |
| `DELETE /api/session` | signed | Sign out |
| `GET /api/people` | viewer | Everyone, in one shape for every viewer: `{id, name, avatar, role, disabled}` |
| `PATCH /api/people/{id}` | admin | `{role?, disabled?}`. Nobody demotes or disables themselves; a configured admin can't be demoted (R2) |
| `GET /api/me/clients` | viewer | My client tokens, each with `online` |
| `POST /api/me/clients` | writer | `{name}`; the token is in this answer only |
| `DELETE /api/me/clients/{id}` | viewer | Revoke |

### Tickets and conversation

| Endpoint | Access | What |
|---|---|---|
| `GET /api/tickets` | viewer | The board, paged and filtered in the database: `?state=` (default open and done; closed is hidden, R10), `owner`, `type`, `priority`, `q`, and `needs=<person>` (my queue: waiting on a human, and owned by that person or nobody, R13). `needs` filters on derived fields, so the core applies it after the database has applied the others and before the page is cut. Newest activity first; the cursor follows that order (a ticket whose activity moves while someone pages can repeat, which is fine at this scale). Each ticket carries its board fields (phase, rail, `waiting_on`, now, plan progress), derived from its runs and its plan item |
| `POST /api/tickets` | writer | Create or take in: `{from: "new", title, ...}` or `{from: "jira", ref}`. Taking in an existing one returns it (200, not 201). The ticket starts with copies of the Space's default items and default workflow (`settings.defaults`) and the agents it uses |
| `GET /api/tickets/{key}` | viewer | The ticket, its board fields, its active run's id, and the actions it offers now, each with why it's blocked (R11). Each action names the role it needs and whether only the owner may target their client; the web applies those for the viewer. Its items and runs are their own lists |
| `PATCH /api/tickets/{key}` | writer | Fields, owner, repo, base branch, and the state: `{state: done \| closed, note?}` resolves (the note is posted to the conversation), `{state: open}` reopens. It sends only the changed fields, and the last write wins per field; a PATCH touching a locked field is refused whole; subject to the run lock and the workspace pin (409 `workspace_pinned` for the repo or base branch once a stage has started in repo mode) |
| `GET /api/tickets/{key}/messages` | viewer | The conversation, paged |
| `POST /api/tickets/{key}/messages` | viewer | `{body}` |

### Context items

One API for both scopes: `/api/tickets/{key}/items` (a ticket's copies) and `/api/library/items` (the Space's). Item names are paths, so actions on items are not under `/items/`.

**An item** is `{name, kind, writable, version, author, run_id, updated_at}`:
- The kinds are `instructions`, `skill`, `agent`, `note`, `plan`, `file` and `workflow`. A ticket has exactly one `workflow` item, which can't be deleted.
- The content is text for every kind but one. An agent is markdown with frontmatter for its runtime, model and effort, the form agent CLIs already read. A workflow is its stages and loops as JSON.
- A ticket's item also carries `copied_from` (the library name and version, and the copy's own version when it was made) and the library item's current version. Together they show drift both ways (R19).

| Endpoint | Access | What |
|---|---|---|
| `GET {scope}/items` | viewer | The items, with versions and drift, and a plan's progress (done and total); no contents. `?deleted=1` lists deleted items too |
| `GET {scope}/items/{name}` | viewer | The content, `?version=N` for an old one, plus the latest 50 versions (who or which run wrote each), older ones paged with `before`. A deleted item's history stays readable (R17) |
| `PUT {scope}/items/{name}` | writer (library: admin) | Create or update: `{kind, content, writable?}`, versioned. The content is parsed and checked as its kind on save: a workflow's rules and prompts (422 lists every issue), an agent's frontmatter. Subject to the run lock |
| `DELETE {scope}/items/{name}` | writer (library: admin) | Versioned; the delete is a version, so the history stays. Library: 409 `in_use` for the default workflow, a default item, or an agent a library workflow uses |
| `POST /api/tickets/{key}/take` | writer | Replace the ticket's item with the current version of a library item: `{name, from?}` (`from` defaults to the item it was copied from), versioned against the ticket's copy. Taking a workflow also copies any agent its stages use that the ticket doesn't have yet; the ticket's own agent copies are kept, and drift shows where they differ. Switching workflow is `take` on `workflow` with another library workflow |
| `POST /api/tickets/{key}/promote` | admin | Write a version of the ticket's item into the library: `{name, version, to?}`. `version` is the copy's version the admin reviewed, and is refused if it isn't current. `to` defaults to the item it was copied from; a new name creates a library item. Versioned against the library item (0 for a new one). If the library moved, 409 `stale_version` with the diff. A workflow using an agent the library doesn't have is 422. Afterwards the copy's `copied_from` is the new library version |

`{scope}` counts as two prefixes in the total (8 endpoints plus take and promote). One implementation serves both.

### Runs

| Endpoint | Access | What |
|---|---|---|
| `POST /api/tickets/{key}/runs` | writer | Dispatch: `{from_stage?, notes?, target?: runner \| client}` (the runner route is mailbox when the runner is configured for it). With no `from_stage`, it starts from the next stage (continue, retry), or from the first stage if the ticket's workflow changed since the last run (D18; continue, retry and request changes aren't offered then). `notes` is "request changes", and can't be combined with `from_stage`: the run starts from the gated stage, and the notes are appended, as the caller, to the ticket's `changes` note (created if missing), so the run records them (R21). The target defaults to my client if I own the ticket and any of my clients is online, else the runner. 409 with the reason when the action isn't offered |
| `GET /api/tickets/{key}/runs` | viewer | The ticket's runs, paged |
| `GET /api/runs/{id}` | viewer | The run: state, route, stage runs with rounds and verdicts, reason, PR URL |
| `GET /api/runs/{id}/package` | viewer | The job exactly as the worker got it: what each stage was given and how it was called (R32) |
| `GET /api/runs/{id}/events` | viewer | The run's log records, paged by sequence |
| `GET /api/runs/{id}/output` | viewer | The run's other output, as a download. Mailbox runs have none (as V1): their outbox carries only journal records |
| `POST /api/runs/{id}/cancel` | writer | Cancel (rules.md › Runs and jobs) |

### Live updates

| Endpoint | Access | What |
|---|---|---|
| `GET /api/changes` | viewer | A server-sent event stream: one event per change, `id: <seq>`, `data: {changed: [{kind: ticket \| run \| items \| messages \| library \| settings \| people \| clients \| intake, id}]}` |

How it works:
- **It replaces V1's polls:** the board and four ticket polls every 3 s, and a run's every 1 s. The web holds one stream for all its tabs (a `SharedWorker`; browsers allow six connections per host over HTTP/1.1) and refetches only what an event lists; a run's log is fetched from its last sequence.
- **Connecting:** a connect without `Last-Event-ID` first gets a `ready` event with the current id, and the web fetches what it shows only after it. `EventSource` reconnects by itself with `Last-Event-ID`. An id older than the change log keeps (24 h), or ahead of the current one (a fresh database), gets a `reset` event with the current id: refetch everything. After a 401 the browser stops retrying, so the web reopens the stream after signing in.
- **Access:** signing out a session, or disabling a user or sending them back to pending, closes the affected streams at once (the server keeps open streams by session; V2 runs as one server process). Every 15 s a comment line keeps proxies from closing the stream, and the session is re-checked, which catches expiry. A pending user has no stream; their waiting page has a "Check again" button that reads `/session`. Responses set `X-Accel-Buffering: no`.
- **Every write bumps one sequence in its own transaction,** so a change can't be missed. Writes made only for liveness (a heartbeat's last-seen, a lease's time) don't; a `clients` change is emitted only when a client goes online or offline. This needs commits applied one at a time; the database contract tests check it (architecture.md › Database). A run's change also lists its ticket, whose board fields and actions follow from it.
- **Changes that aren't writes become writes.** The live reaper already runs every 15 s. It emits a `clients` change when a client passes 60 s since its last lease (online is still derived from the last lease, in one place), and it ends a job at its deadline, which lifts the fence.
- **Jira intake changes outside AgentOS,** so the server rereads the saved queries every minute (and at once when they're saved), keeps the result for `GET /jira/intake`, and emits an `intake` change when it differs.

### Settings and Jira

| Endpoint | Access | What |
|---|---|---|
| `GET /api/settings` | viewer | Every area in one document: `{area: {value, version, updated_at, updated_by}}`. The areas are `space`, `repos`, `intake`, `mappings`, `runner`, `runtimes` and `defaults` (runtime, model, effort; the default items and the default workflow). This also replaces V1's `/config` |
| `PUT /api/settings/{area}` | admin | `{value}`, versioned by the area's own version. 409 `in_use` when it removes a repo or runtime still in use; 422 when `defaults` names a library item that doesn't exist |
| `POST /api/settings/{area}/check` | admin | `{value, sample?}` → `{issues, preview}`, saving nothing. One check for every area; the preview is the area's own (a JQL's first issues, a mapping's result for a sample issue) |
| `GET /api/jira/fields` | admin | Jira's fields, for the mappings picker |
| `GET /api/jira/intake` | viewer | Per saved query, the Jira issues not yet taken in. Take one in with `POST /api/tickets` |

A mapping sets a ticket's base branch when the ticket is taken in. V1 also re-applied mappings to existing tickets on every save; no requirement needs that, so it's gone.

### Worker (no cookie, no CSRF)

| Endpoint | Access | What |
|---|---|---|
| `GET /api/worker/program?format=7z\|tar.gz` | pub | The worker program as an archive: 7z for Windows, tar.gz for Linux (the default). Its content hash, the same for both, is in a header (R42, D17) |
| `GET /api/worker/job` | job | The job package |
| `POST /api/worker/journal` | job | `{records ≤500}` → `{ack, cancel, rejected[]}`. Binding, records, heartbeat and the cancel reply, as V1 (rules.md › Worker protocol) |
| `PUT /api/worker/output` | job | The output upload, streamed. The token names the job; the server hashes the body, and the `output` record that follows must match |
| `POST /api/worker/lease` | client | `{wait_s ≤25, take, alive[], gone[]}` → a job or nothing, plus the protocol version and the worker's hash |

The protocol keeps V1's shape, because its rules came from real bugs. It changes in three ways:
- the mailbox outbox is the same journal records through the same ingest, so there's one wire format (V1's outbox still used protocol 1's calls). A mailbox worker writes no `started` (the server marks the run running when it hands the job out) and no `output`;
- the upload stops repeating the job id, hash and file list;
- the record types are a closed union, shared with the worker through one module (architecture.md › Modules).

## V1 to V2

| V1 | V2 |
|---|---|
| `/config`, `/me`, `/auth/login`, `/auth/logout` (4) | `GET`, `POST`, `DELETE /session` (3); the rest of `/config` is `GET /settings` |
| `/people`, `/users`, `PATCH /users/{id}` (3) | `/people` and `PATCH /people/{id}` (2) |
| `/tickets/import`, `/resolve` | Folded into `POST /tickets` and `PATCH /tickets/{key}` |
| `/pipeline`, `/workflow` | The ticket's `workflow` item: `PUT`, or `/take` to switch |
| Files and versions (5) | Ticket items (4); versions are in the item's GET |
| Workflows (5), template (2) | Library items; the defaults (workflow, scaffold items, runtime, model, effort) are `settings.defaults`; save as preset is `promote {to}` |
| Settings (20) | 3 |
| `/runs/{id}/manifest`, `/sync-back` | `/package`, `/output` |
| `/intake`, `/mappings/jira-fields`, `/intake/preview`, `/mappings/preview` | `/jira/intake`, `/jira/fields`; the previews are `check` |
| `/chat` (2) | `/messages` (2) |
| New | `/changes`, `take`, `promote` |

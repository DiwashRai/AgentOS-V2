# AgentOS V1 API (reference)

What V1 exposes, written down so the V2 API can be mapped against it. Facts only, no design.

V1's words are kept: its "dispatched" run is V2's "launched", its "pipeline" is a ticket's workflow copy, its "sync-back" is a run's output.

Source: V1 branch `cleanup` @ 7dd6f8e. `web/src/api/openapi.json` (paths, models), `backend/server/agentos/` (routes, `models.py`, services), `backend/worker/agentos_worker/` (the worker side) and `web/src/api/queries.ts` (what the web calls). Where V1's docs disagree with this code, the code wins.

**66 endpoints** in the schema, all under `/api`. Outside `/api` the server only serves the SPA (`index.html` for unknown paths).

| Area | Count | Area | Count |
|---|---|---|---|
| Meta, auth, people | 8 | Runs and events | 7 |
| Clients | 3 | Workflows | 5 |
| Tickets | 8 | Template | 2 |
| Files and versions | 5 | Settings | 20 |
| Chat | 2 | Intake (Jira) | 1 |
| | | Worker | 5 |

## 1. Conventions

**Access levels.** Roles rank `pending` < `viewer` < `writer` < `admin`. A role check runs before body validation, so a too-low role gets 403 even with a bad body.

| Level | Meaning |
|---|---|
| pub | No auth |
| signed | Session cookie of any enabled user, `pending` included (only `GET /api/me`) |
| user | Approved user (viewer and up). `pending` gets 403 `pending_approval` |
| writer | Writer or admin, else 403 `forbidden` |
| admin | Admin only, reads included |
| job | `Authorization: Bearer <job token>`, plus `X-AgentOS-Instance` (the worker's random id) once the job is bound |
| client | `Authorization: Bearer <client token>`. Its user must be a writer (403) |

**Session.** Cookie `agentos_session`: HttpOnly, SameSite=Lax, path `/`, 14 days, Secure iff the public URL is https. Login is rate-limited to 10 attempts a minute per key (429 `rate_limited`). Proxy headers count only with `AGENTOS_TRUST_PROXY=1`. Dev auth accepts only direct loopback requests.

**CSRF.** Every non-GET/HEAD/OPTIONS request under `/api/`, except `/api/worker/*`, needs `X-AgentOS: 1`, else 403 `csrf_header_missing`. CORS is off.

**Error body.** Every non-2xx: `{"error": {"code", "message", "issues": [{"loc", "message"}]}}`. `issues` is non-empty on a 422 (one per problem, `loc` relative to the body) and `[]` otherwise.

**`ErrorCode`** (closed set, `backend/server/agentos/models.py`):

| Group | Codes |
|---|---|
| Generic | `unauthorized` `forbidden` `not_found` `method_not_allowed` `http_error` `validation_error` `internal_error` `not_implemented` `csrf_header_missing` `rate_limited` `upstream_error` `too_large` |
| Auth | `missing_credentials` `invalid_credentials` `no_project_access` `user_disabled` `pending_approval` |
| Lookups | `ticket_not_found` `file_not_found` `version_not_found` `run_not_found` `user_not_found` |
| Conflicts | `stale_version` `run_active` `bundle_locked` `already_claimed` `key_taken` `in_use` |
| Runs, pipeline, branch | `invalid_stage` `invalid_pipeline` `render_error` `run_gone` `base_branch_missing` `base_branch_locked` |

**Status codes used.** 200, 201, 204; 400 (missing credentials), 401, 403, 404, 405, 409, 410 (worker: run gone), 413 (file, bundle or sync-back too large), 422, 429; 500, 501 (Jira service account not configured), 502 (Jira failed).

**Ids and keys.** Integers for users, clients, runs, workflows, chat messages. Tickets by key (`SCRUM-6`, or the Space's `key_prefix` for native tickets). Files by path (case-insensitive). Jobs by string id `<run_id>-<segment>-<16 hex>`. Intake queries by a slug. Timestamps are timezone-aware ISO 8601.

**Pagination.** Only two lists page:
- `GET /api/tickets/{key}/chat`: `after_id` (next `limit` after it) or `before_id` (the `limit` before it), else the latest; `limit` 1-200, default 50; oldest first.
- `GET /api/runs/{run_id}/events`: `after_seq` (the first `limit` after it), else the last `limit` before `before_seq`; `limit` 1-1000, default 500; ascending seq.

Everything else returns the whole list. `GET /api/intake` is capped per query.

**Versioning.** Optimistic, with `base_version` → 409 `stale_version`:

| Resource | Read field | Write |
|---|---|---|
| Ticket file | `FileInfo.version` | PUT body `base_version` (0 = create); DELETE query `?base_version` |
| Ticket pipeline | `TicketDetail.pipeline_version` | `PUT .../pipeline`, `POST .../workflow` |
| Template | `Template.version` | `PUT /api/template` |
| Workflow | `Workflow.version` | `PUT /api/workflows/{id}` |
| Settings documents (space, repos, intake, mappings, runner) and runtimes | `version` | PUT `base_version` |

Not versioned (last write wins): ticket fields (`PATCH /api/tickets/{key}`), users, client tokens, chat.

## 2. Endpoints

### Meta, auth, people

| Method path | Access | What |
|---|---|---|
| `GET /api/health` | pub | `{status: "ok"}` |
| `GET /api/config` | pub | UI bootstrap: auth mode, Jira URL/deployment, space name, key prefix, repo catalog (with URLs), default repo, runtime names, effective default runtime/model/effort, `default_workflow_id`, `server_default_runtime`, `sources` |
| `POST /api/auth/login` | pub | `{email?, username?, token?}` (Cloud: email+token; Data Center: token; dev: username). Sets the cookie, returns `Me`. 400/401/403 (`no_project_access`, `user_disabled`)/429/502 |
| `POST /api/auth/logout` | pub | Deletes the session and the cookie. 204 |
| `GET /api/me` | signed | `Me {id, display_name, email, avatar_url, role}` |
| `GET /api/people` | user | Enabled, approved users as `Person {id, display_name, avatar_url}` (owner pickers) |
| `GET /api/users` | admin | Every user with `disabled`, `env_admin`, `created_at`, `last_login_at` |
| `PATCH /api/users/{user_id}` | admin | `{role?, disabled?}`. Disabling ends their sessions. 422 when demoting or disabling yourself, or demoting an env admin (disabling one is allowed) |

### Clients (the signed-in user's own client tokens)

| Method path | Access | What |
|---|---|---|
| `GET /api/me/clients` | user | My tokens: `{id, name, created_at, last_seen_at, online}` (online = leased in the last 60 s) |
| `POST /api/me/clients` | writer | `{name}` → 201 `{client, token, server_url}`. The plaintext token appears only here |
| `DELETE /api/me/clients/{client_id}` | user | Revoke mine. Its next lease gets 401; started runs finish on their job tokens. 204, 404 |

### Tickets

| Method path | Access | What |
|---|---|---|
| `GET /api/tickets` | user | Board: every ticket as `TicketSummary`, newest activity first. Query `q`, `type`, `priority`, `include_closed`. Done and abandoned tickets always included. Viewer-dependent (`attention`, gate states) |
| `POST /api/tickets` | writer | `{title, description, type, priority, labels, repo?, base_branch?, owner_id?, workflow_id?}` → 201 `TicketDetail`. Copies the workflow's pipeline and writes the template scaffold as files v1 |
| `POST /api/tickets/import` | writer | `{ref (Jira key or link), workflow_id?}` → 201 `{ticket, created: true}`, or 200 `{created: false}` if imported before. 409 `key_taken`, 501, 502 |
| `GET /api/tickets/{key}` | user | `TicketDetail`: summary plus description, workspace, repo URL, base branch and its info, branch, pipeline + `pipeline_version`, workflow, `next_stage`, `active_run_id`, TASKS.md `plan` |
| `PATCH /api/tickets/{key}` | writer | Any of title, description, type, priority, labels, state, repo, base_branch, owner_id (null only for the last three). 409 `run_active`, `base_branch_locked` |
| `POST /api/tickets/{key}/resolve` | writer | `{outcome: completed\|abandoned, note?}` → state done/closed with a resolution. 409 `run_active`. Reopen is PATCH `state: open` |
| `PUT /api/tickets/{key}/pipeline` | writer | `{pipeline, base_version}`. 409 `run_active`/`stale_version`; 422 `invalid_pipeline`/`render_error` |
| `POST /api/tickets/{key}/workflow` | writer | `{workflow_id, base_version}`: replace the pipeline with a copy of a workflow's. Same conflicts, 404 unknown workflow |

### Files (the ticket's context bundle) and versions

| Method path | Access | What |
|---|---|---|
| `GET /api/tickets/{key}/files` | user | Current files as `FileInfo {path, mode, version, size, author, author_run_id, updated_at}`, no content |
| `GET /api/tickets/{key}/files/{path}` | user | `FileContent` (info + `content`); `?version=N` for an old one. 404 `file_not_found`/`version_not_found` |
| `PUT /api/tickets/{key}/files/{path}` | writer | `{content, mode: replace\|block, base_version}` → `FileInfo`. 409 `stale_version`, `bundle_locked` (run dispatched or running, or a client run queued); 413 |
| `DELETE /api/tickets/{key}/files/{path}` | writer | `?base_version=N`. Appends a delete version. Same conflicts. 204 |
| `GET /api/tickets/{key}/versions/{path}` | user | Every version of a path, deletes included, oldest first |

### Chat

| Method path | Access | What |
|---|---|---|
| `GET /api/tickets/{key}/chat` | user | Messages, paginated (see §1) |
| `POST /api/tickets/{key}/chat` | user | `{body}` (1-4000 chars, not blank) → 201 `ChatMessage` |

### Runs and events

| Method path | Access | What |
|---|---|---|
| `POST /api/tickets/{key}/runs` | writer | Dispatch, Continue, Retry, Run from: `{from_stage?, target: server\|client}` → 201 `RunSummary` (queued). `from_stage` omitted = `next_stage`. `client` is owner-only (403) and needs a client token (422); `server` needs a configured runner (422); a repo outside the catalog is 422 `validation_error`. 409 `run_active`, `base_branch_missing`, `invalid_stage` (ticket not open); 422 `invalid_stage`/`render_error` |
| `GET /api/tickets/{key}/runs` | user | The ticket's runs, newest first, as `RunSummary` (status, stages, times, stop/queue reason, error, launch ref/url, `log_delivery`, target, `client_online`) |
| `GET /api/runs/{run_id}` | user | `RunDetail`: summary plus `stage_runs[]` (one per stage execution and round, with verdict) and `sync_back {files, bytes}` |
| `GET /api/runs/{run_id}/manifest` | user | The stored job package (`JobPackage`), exactly as the worker got it. 404 before dispatch |
| `GET /api/runs/{run_id}/sync-back` | user | The run's sync-back zip as a download. 404 if none |
| `POST /api/runs/{run_id}/cancel` | writer | queued/dispatched → cancelled at once; running → stop requested (reason `cancel`); terminal → unchanged. Returns `RunSummary` |
| `GET /api/runs/{run_id}/events` | user | `RunEvent[]`, paginated (see §1). Types: `stage_started`, `stage_finished`, `log`, `warning`, `verdict`, `verdict_repair` |

### Workflows (named pipeline presets)

| Method path | Access | What |
|---|---|---|
| `GET /api/workflows` | user | Every workflow with its full pipeline, `version`, `updated_*`, `default` |
| `POST /api/workflows` | admin | `{name, description, pipeline}` → 201. 422 duplicate name, `invalid_pipeline`, `render_error` |
| `PUT /api/workflows/{workflow_id}` | admin | Same plus `base_version`. 409 `stale_version`. Never changes existing tickets |
| `POST /api/workflows/{workflow_id}/default` | admin | Make it the default for new tickets. Returns the workflow |
| `DELETE /api/workflows/{workflow_id}` | admin | 204. 409 `in_use` for the default. Tickets keep their copy |

### Template

| Method path | Access | What |
|---|---|---|
| `GET /api/template` | user | `{scaffold: FileEntry[], defaults: {runtime, model, effort}, version}` |
| `PUT /api/template` | admin | `{scaffold, defaults?, base_version}`. 409 `stale_version`; 422 unknown runtime |

### Settings (admin only, reads included)

Space, repos, intake, mappings and runner share one shape. GET → `{value, version, updated_at, updated_by}` plus read-only extras. PUT `{value, base_version}` → the same (409 `stale_version`, `in_use`). POST `.../validate` `{value}` → 204 or the save's 422, nothing saved.

| Method path | Access | What |
|---|---|---|
| `GET` `PUT /api/settings/space`, `POST .../space/validate` | admin | `{name, default_repo, key_prefix, jira_projects, claim_timeout_s}` |
| `GET` `PUT /api/settings/repos`, `POST .../repos/validate` | admin | `{repos: [{name, url, default_branch}]}`; extra `open_ticket_counts`. Removing a used repo → 409 `in_use` |
| `GET` `PUT /api/settings/intake`, `POST .../intake/validate` | admin | `{queries: [{id?, name, jql}]}`. Saving drops the intake cache |
| `POST /api/settings/intake/preview` | admin | `{jql}` → `{total, error, items ≤5}`, live, not cached |
| `GET` `PUT /api/settings/mappings`, `POST .../mappings/validate` | admin | `{mappings: [{target: base_branch, source: jira, field, field_name, rules[{match, value}]}]}`. Saving re-applies the mapping to unlocked tickets it set |
| `GET /api/settings/mappings/jira-fields` | admin | Jira's fields `{id, name, kind}` for the picker, cached ~10 min. 501, 502 |
| `POST /api/settings/mappings/preview` | admin | `{mapping, values \| issue}` → `{values, value, rule, reason}` |
| `GET` `PUT /api/settings/runner`, `POST .../runner/validate` | admin | `{github_repo, workflow, ref}`; extras `launcher`, `token_set` (from env) |
| `GET` `PUT /api/settings/runtimes` | admin | Own shape: `{runtimes: RuntimeEntry[], version, updated_at, updated_by}`; PUT `{runtimes, base_version}`. 409 `in_use`. No validate |

That table covers 20 endpoints: each `GET` `PUT` row is two plus its validate.

### Intake (Jira)

| Method path | Access | What |
|---|---|---|
| `GET /api/intake` | user | Each configured query with the Jira issues not yet in AgentOS (`IntakeQuery {id, name, jql, items, total, error}`). Cached ~45 s; `?fresh=1` refetches. Take one in with `POST /api/tickets/import` |

### Worker (no cookie, no CSRF)

| Method path | Access | What |
|---|---|---|
| `GET /api/worker/worker.py` | pub | The worker as one zip file that `python worker.py` runs |
| `GET /api/worker/job` | job | The job's stored `JobPackage`. 401 unknown token, 409 `already_claimed`, 410 `run_gone` |
| `POST /api/worker/journal` | job | `{records ≤500}` → `{ack, cancel, rejected[]}`. Binds, reports, heartbeats, delivers cancel (§3). 401, 409, 410, 422 |
| `PUT /api/worker/jobs/{job_id}/sync-back` | job | Raw zip body, query `sha256`, `files`. 204. 404 another job's id, 410 unless running, 413, 422 hash mismatch. A repeat replaces it |
| `POST /api/worker/lease` | client | `{wait_s ≤25, take, alive[≤100], gone[≤100]}` → `{job: {job_id, run_id, server_url, job_token} \| null, protocol: 2, worker_sha256}` |

## 3. Worker protocol

**A run's life (live report).** The run stores its route at dispatch: push (a launcher such as GitHub Actions starts the worker, given the server URL and job token) or pull (the owner's client leases it). The server dispatcher ticks every 2 s.

1. `GET /api/worker/job` with the job token and a fresh random `X-AgentOS-Instance`.
2. Bind: `POST /api/worker/journal` with one `started` record at `journal.first_seq`, waiting for its ack. The first valid `started` binds the job to that instance. A 409 means another instance holds it: exit 0. The workdir is untouched until here.
3. Workspace: clone (or `git init` in no-repo mode), write context and notes, emit the package's `warnings`.
4. Per stage execution: `stage_started`, `log` lines, for a check `verdict_repair`* then `verdict`; then the after-stage steps: `sync` (changed write files), and in repo mode commit, push, `pushed`; then `stage_finished`.
5. Finish: look up the branch's PR with `gh`, upload `PUT .../sync-back` and record `sync_back`, then `result`.

**Journal records.** Each is `{seq, ts, job, type, stage_id?, data}`. `seq` runs across the run. The server applies in strict seq order: a seen seq is skipped, a gap stops the batch, nothing applies after `result`. A record that can't apply is consumed: a `warning` takes its seq and the seq goes in `rejected`. Over 100,000 events, `log` events are dropped.

| Type | Key `data` fields | Effect |
|---|---|---|
| `started` | `protocol: 2`, `worker_sha256` | Binds the job; run → running. A sha mismatch only warns |
| `stage_started` | `round` | Event; moves `stage_runs`; the first one locks the ticket's base branch |
| `stage_finished` | `status`, `exit_code`, `reason`, `round` | Event; finishes the stage run |
| `log` | `stream` (stdout/stderr/system), `text`, `truncated` | Event |
| `warning` | `message` | Event |
| `verdict` | `round`, `verdict` pass/fail, `notes`, `source`, `repairs` | Event; sets the stage run's verdict |
| `verdict_repair` | `round`, `attempt`, `error` | Event |
| `sync` | `files[{path, content \| null, mode}]` | New file versions authored by the run; only the package's write entries and notes |
| `sync_back` | `sha256`, `bytes`, `files` | Must match the uploaded zip, else rejected |
| `pushed` | `branch`, `head`, `commits`, `method` git/api | Stores the head commit |
| `result` | `status` completed/failed/cancelled, `failed_stage`, `error`, `pr_url` | Ends the run (gated or succeeded, failed, or per the stop reason) and the job |

**Timing.** The worker sends a batch every 1 s, or as soon as 200 records are buffered, at most 500 per post. It sends an empty journal post (the heartbeat) at least every 10 s. Unacked records are resent from `ack + 1`. Network errors and 5xx are retried with backoff 0.5 s to 10 s for up to 300 s. Server side, the reaper (every 15 s) fails a run with no post for 90 s ("worker lost") and stops one past `started_at + budget + 15 min`.

**Errors on the journal.** 409 at bind: exit 0. 401, 409 or 410 after it: the run is gone; kill the stage, publish nothing, exit 1. Any other 4xx, or 300 s unreachable: commit and push what exists, exit 1; the reaper fails the run. A `result` listed in `rejected`: publish nothing more, exit 1. A terminal run answers 410, except a resent batch ending in the matching `result` (200), so a lost answer still exits cleanly.

**Cancel.** `POST /api/runs/{id}/cancel` on a running run sets a stop. The worker learns it only as `cancel: true` on its next journal answer (within about 1 s while events flow, at most about 10 s when idle). It kills the stage tree, still syncs, commits and pushes, then posts `result: cancelled`. No result 2 min after a stop: the reaper ends the run.

**Client lease loop** (`worker.py --client`, token in `AGENTOS_CLIENT_TOKEN`):
- The first lease goes out at once. A taking lease sends `wait_s: 25`; the server checks for a queued client run of that user every 1 s and returns early when the client disconnects. HTTP timeout 40 s.
- A leased job starts a detached `worker.py --server ... --workdir ... --lock-file ...` with `AGENTOS_TOKEN` set to the job token. It then runs the live protocol above.
- With every slot busy (`--max-runs`, default 1) the client sends `take: false` every 30 s as a heartbeat. Each lease lists running jobs in `alive` (display only) and exited ones in `gone`; the server ends exactly the `gone` jobs, once.
- Network errors, 5xx, 408/425/429 and malformed answers back off up to 60 s, forever. Any other 4xx (401 revoked, 403 not a writer) or another protocol: the client exits 1.
- A client is "online" for 60 s after a lease. A pull job not started 2 min after its lease fails "never started".

**Mailbox variant** (runners that can't reach the server, `worker.py --manifest --outbox --workdir`). No worker HTTP at all:
- The server's mailbox dispatcher (every 2 s) marks the run running itself, so no worker ever binds (any job-token call gets 409). It puts `worker.py` and `manifest.json` (the package) in a store and starts the GitHub workflow.
- The worker writes `outbox.jsonl`: line 1 `{"outbox": 1, "run_id": N}`, then one `{path, body}` line per protocol-1 call: `/api/worker/events {events[]}` (display records, renumbered 1..N), `/api/worker/sync {stage_id, files}`, `/api/worker/complete {status, failed_stage, error, pr_url?}`. `started`, `pushed` and `sync_back` are not written; sync-back is not returned.
- The mailbox reaper (every 20 s) watches the Actions run, fetches the outbox when it appears and replays it through the same ingest, numbering records from `first_seq`. Cancel goes to the Actions run, not the worker. Its only run-gone is the job's `not_after`.

## 4. How the web uses it

All calls go through `web/src/api/queries.ts` (react-query). Polling pauses in background tabs. There is no push channel (no SSE or WebSocket) and no conditional GET.

| Endpoint | Poll | Where |
|---|---|---|
| `GET /api/tickets` | 3 s | Board |
| `GET /api/tickets/{key}` | 3 s | Ticket page, peek panel, expanded compact row |
| `GET /api/tickets/{key}/files` | 3 s | Ticket page (Context tab). A file's content is refetched when its listed version moves |
| `GET /api/tickets/{key}/runs` | 3 s | Ticket page (Runs tab) |
| `GET /api/tickets/{key}/chat` | 3 s | Talk, expanded compact row. Always the latest 50, never `after_id` |
| `GET /api/runs/{run_id}` | 1 s while active | Runs tab |
| `GET /api/runs/{run_id}/events` | 1 s while active | Run log: `after_seq` of the last held event, pages of 1000, keeps the newest 5,000 |
| `GET /api/me/clients` | 15 s | Dispatch target choice on every ticket action surface, Settings › My client |
| `GET /api/intake` | 60 s | Intake view |
| `GET /api/me` | 15 s | Pending-approval page only |

Not polled: `/api/config` (cached until a Settings or Template save in this tab), `/api/people` (60 s stale time), template, workflows, settings, jira-fields (10 min), manifest (fetched once). Mutations refetch the ticket, its children and the board.

**Screens that need several calls.**
- Ticket page: ticket, files, runs, chat (four 3 s polls), clients (15 s), config, me, people, workflows; then run detail and events per open run (1 s), file content per open file, the manifest on demand.
- Board: tickets, me, config.
- New ticket form: config, me, people, workflows.
- Settings › Space: space, repos, config. Runners: runner, runtimes. Field mappings: mappings, jira-fields.

**Endpoints only one screen uses.** `GET /api/settings/mappings/jira-fields` and `POST .../mappings/preview` (Field mappings); `POST .../intake/preview` (Intake settings); `GET /api/runs/{id}/manifest` (the run's stage calls view); `GET /api/runs/{id}/sync-back` (a download link in the Runs tab).

**Never called by the web.** `GET /api/health`, `GET /api/tickets/{key}/versions/{path}`, the worker routes. `GET /api/tickets` is always called without `q`, `type`, `priority` or `include_closed`.

(The snapshot has no `web/src/app/`; the board's call site was read from V1 `main`.)

## 5. Observations

- Two paths change a ticket's state: `PATCH /api/tickets/{key}` `state` and `POST .../resolve`. They give different results (an abandoned ticket stays on the board; a PATCH-closed one is hidden unless `include_closed`), and PATCH `state` clears the resolution.
- Two paths replace a ticket's pipeline: `PUT .../pipeline` and `POST .../workflow`, both versioned by `pipeline_version`.
- Space-wide defaults for a new ticket are split over four resources with four shapes: `/api/template` (scaffold, agent defaults), `/api/workflows` (pipeline, `default` flag), `/api/settings/space` (default repo, key prefix), `/api/settings/runtimes` (the first is the server default).
- Settings use three shapes: five documents with `{value, version, updated_*}` plus validate; runtimes with `runtimes` at the top and no validate; the template with `version` but no `updated_*` and no validate.
- Five `.../validate` endpoints repeat the PUT's checks without saving; no other resource (pipeline, workflow, template, runtimes) has one. Two more "try it" endpoints (`intake/preview`, `mappings/preview`) exist per feature.
- `/api/config` re-serves admin-only settings data in another shape (repo catalog, runtime names, effective defaults, `default_workflow_id`). It is public, so the repo URLs are readable without signing in. The web caches it until reload, so another admin's save is not seen.
- `default_workflow_id` (config) duplicates `Workflow.default`, and the default is moved by its own `POST /api/workflows/{id}/default` rather than a field.
- `GET /api/intake` (user, Jira candidates) and `/api/settings/intake` (admin, the queries) share a name for different things.
- Run state is served three times on the ticket page, all polled: `TicketSummary.latest_run` and `active_run_id` (3 s), `GET .../runs` (3 s), `GET /api/runs/{id}` (1 s).
- `GET /api/tickets` returns every ticket, done ones forever, each with a server-computed rail, phase track and "now" line, every 3 s per open board. It is not paginated, `q` filters in Python after loading all rows, and the payload differs per viewer (`attention`, gate states), so nothing can be shared between users.
- Unpaginated lists besides tickets: runs per ticket, files, versions, users, people, workflows. The two paginated lists use different parameter names (`after_id`/`before_id` vs `after_seq`/`before_seq`) and limits (50/200 vs 500/1000).
- The web refetches the latest 50 chat messages every 3 s although the endpoint supports `after_id`.
- Everything live is polling: about six concurrent polls on the ticket page with a run open, with no change signal or conditional GET.
- Optimistic concurrency is uneven: files, pipeline, template, workflows and settings use `base_version`; ticket fields, users and chat don't. File PUT sends `base_version` in the body, file DELETE in the query.
- Not-found codes are mixed: tickets, files, runs and users use specific codes; workflows, clients, manifest, sync-back and jobs use generic `not_found`. Some codes carry an unexpected status: `invalid_stage` as 409 for dispatching a closed ticket, `user_not_found` as 422 for a bad `owner_id`.
- `GET /api/runs/{id}/manifest` and `GET /api/worker/job` serve the same stored package to two audiences.
- The sync-back upload repeats what the job token already identifies (`job_id` in the path, 404 on a mismatch), and its `sha256`/`files` query parameters are sent again in the `sync_back` record that must follow.
- One worker endpoint, the journal, carries binding, data, heartbeat and cancel delivery. Cancel waits for the next journal answer (up to about 10 s idle).
- The client lease is also the client heartbeat (`take: false`) and the job-exit report (`gone`). Online status is served twice (`ClientToken.online`, `RunSummary.client_online`), and the web polls `/api/me/clients` every 15 s wherever ticket actions show.
- The mailbox outbox still uses protocol-1 call paths (`/api/worker/events`, `/sync`, `/complete`) that no longer exist as endpoints. So one journal has two wire formats, and replay renumbers the records.
- Saves have side effects on other resources: `PUT /api/settings/mappings` rewrites tickets' base branches, `PUT /api/settings/intake` drops a cache, `PUT /api/settings/repos` changes every ticket's resolved repo URL. The web has to know which queries to refetch after each.
- Unclear: whether anything outside the web (a container health check, scripts) calls `GET /api/health`, the ticket list filters or `GET .../versions/{path}`.

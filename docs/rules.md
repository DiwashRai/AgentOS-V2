# Rules

The invariants and edge cases V1 learnt the hard way, most of them from a real bug. Each is a requirement for V2 however it's built. Refs point at V1 (`S/` = `backend/server/agentos/`, `W/` = `backend/worker/agentos_worker/`).

## Access and credentials

- Sessions, job tokens and client tokens are stored hashed. A client token is shown once; revoking it deletes it. A disabled user's sessions and tokens stop working at once.
- Sign-in checks browse rights on the Space's Jira projects; a 401, 403 or 404 from a project means "can't browse". Jira redirects are never followed.
- Cookie: HttpOnly, SameSite=Lax, Secure when the public URL is https. CORS off. Proxy headers count only when configured. Sign-in is limited to 10 tries per minute per address and user.
- Nothing about repos or settings is readable below viewer (V1's `/api/config` leaked repo URLs).
- Tokens never go on argv, into logs or into the agent's environment: the worker strips every AgentOS credential before it runs git or a stage (`W/main.py:36`).
- CI: the job token is masked from the event payload (not `env:`, which is logged first); no `${{ }}` inside `run:`; `::stop-commands::` before agents run; the echo of agent output strips control characters, so no `::` injection.
- The runner's repo access is the job's own `GITHUB_TOKEN`. Pull requests opened with it don't trigger CI (a GitHub rule).
- Raise without chaining credentials (`from None`); scrub before clipping.

## Runs and jobs

Dispatch is the request: it queues a run. The job is built when the run leaves the queue (launch), so it always has current context.

- One active run per ticket, enforced by the database.
- A run's route (runner, mailbox or client) is stored at dispatch and kept.
- Dispatch needs an open ticket and a workflow that renders; only the ticket's owner may target their own client, and it must exist; in repo mode, a repo in the catalog and a base branch. At launch the planned stage ids must still match.
- While a run is active, the ticket's workflow, state, repo and branch can't change. The base branch locks at the first stage start. A queued client run also locks the owner, title, description and type (they run with the owner's credentials).
- Context is read at launch and locks then (from the queue, for client runs, which run on the owner's machine); it unlocks when the run ends.
- A dispatch from a stage inside a loop starts at that loop's round 2.
- Launch takes the oldest unfenced run first. A launch that fails (a render error, changed stage ids, a provider start error) fails the run with the reason.
- The workspace is deleted after success or cancel and kept after a failure.
- Providers (run targets) never touch the database; a provider's CI run counts as ended only when all its CI jobs are done; the CI job's timeout is longer than any job's deadline.
- A job's deadline: launch + start allowance (a runner setting, default 1 h; 2 min for a client) + budget + 15 min, plus 30 min in mailbox mode.
- The fence: a new run waits while an earlier job of the ticket may still write (not ended and before its deadline), even after that run ended. A result, the provider reporting the CI run ended, a client's "gone", or an unbound job's run ending lifts it at once.
- Cancel: a queued or launched-but-unstarted run is cancelled at once; a running stage is killed, the work is still synced, committed and pushed, then the worker reports cancelled.
- Over budget: the same, and the run fails with the reason.

The reaper (live routes; every 15 s; the first rule that applies wins; it writes only if the run is still as it saw it, a compare-and-set):

| Rule | Applies to | Ends the run as |
|---|---|---|
| The server itself slept (last tick over 60 s ago) | all | nothing: refresh running runs' last-seen and skip |
| No launch reference 15 min after launch | launched (not started) runner runs | failed: no launch |
| Not started within the start allowance (unless the provider reports it running), or past the deadline whatever the provider says | launched (not started) runner and client runs | failed: never started |
| 90 s without a post | running runs | failed: lost |
| Past start + budget + 15 min, no stop asked yet | running runs | ask the worker to stop (budget) |
| No result 2 min after a stop was asked | running runs | by the stop's reason: cancelled, or failed over budget |

Whenever the reaper (or a cancel) ends a runner run, it also cancels the CI run, so an orphan job doesn't hold a runner. Queued client runs never time out. Mailbox runs have their own rules (Mailbox below).

One function ends a run: it keeps the first error and cancels the run's open stage runs.

## Workflows

- A loop needs at least one check and one maker; loops don't overlap; a gate only on a loop's last stage; at most 5 rounds.
- Makers resume their session each round; checks start fresh. A check's "fail" counts as done except in the last round.
- A shell stage is a check when marked: exit 0 passes.
- Stages that need a repo are turned off on a no-repo ticket (at creation, when its repo is cleared, when it switches workflow); a no-repo ticket can't be saved or dispatched with one turned on. Changing a ticket's repo resets its base branch.
- Repairs and resume belong to agent stages; a shell stage has none.
- The default workflow can't be deleted; admins edit library workflows and change the default.
- Open: V1's Continue and Retry skip a `setup` stage (dependency install) that the fresh workspace still needs (Q14).

## Worker protocol

- The first `started` binds the job to the worker's instance; the worker touches nothing until that is acknowledged. Another instance is refused; an ended unbound job is refused.
- Records carry a run-wide sequence. The server applies each record and advances the acknowledged sequence in one transaction; duplicates are skipped; a gap stops the batch; a bad record is consumed with a warning and listed as rejected, without blocking the ones after it; nothing applies after the result.
- An exact resend of the final result to an ended run is accepted; anything else is refused, and the worker then publishes nothing. A rejected result is a failure.
- The worker buffers records until acknowledged and resends from the next sequence; it flushes every second (or at 200 records) and sends a heartbeat at least every 10 s; it retries server errors with backoff for a bounded time. If it can't reach the server, it still commits and pushes before its deadline.
- Cancel and "the run has ended" reach the worker on its next journal reply (runners take no inbound calls), so within the heartbeat interval.
- Limits: 500 records a post, 100k events a run with 1k kept for non-log events, agent lines 256 KiB and other streams 8 KiB.
- Version check: the worker and server speak one protocol version exactly; the worker's hash is checked hard in mailbox mode and reported otherwise.
- The worker's live console echo and its end-of-run PR lookup can each be turned off (for local debugging).

## Client

- Started with a token from Settings and an env file for agent and git credentials; one client per root folder (a lock file); its root must not be inside a git repo.
- It is the default target while it's online (leased in the last 60 s).
- Each run worker holds an OS lock on its own lock file; it is "gone" only once its process has exited and the lock is free. "Gone" is explicit, idempotent and resent until acknowledged; workers outlive a client restart. Alive and gone lists are bounded (100).
- A lease takes a job in one transaction. The long poll runs off the event loop and before the write lock, and notices a disconnect by reading the request (behind middleware, FastAPI's `is_disconnected` never fires). A busy client still checks in every 30 s. Transient errors (5xx, 408, 425, 429) back off up to 60 s and retry forever; other errors and a protocol mismatch stop the client.
- Nobody reads another process's lock file; lock state is tested by trying the lock.

## Mailbox

Mailbox workers can't talk to the server during a run, so the live exchanges don't apply:
- The job and the worker go to Artifactory with their hashes. The CI workflow has three jobs: fetch (holds the secret, checks the hashes), work (no secret), publish (uploads the outbox, at most 512 MiB). Runner pools are separate or ephemeral.
- There is no binding: the server marks the run running itself when it hands the job out, and refuses any token use.
- Liveness and cancel go through the CI provider, checked every 20 s: "never picked up" is decided from the work job alone: still pending past the start allowance (1 h), the CI run is cancelled and the run fails as never started; no launch reference 15 min after launch fails the run; past the deadline the CI run is cancelled and the run fails over budget.
- Cancel cancels the CI run. Once the CI run has ended with no outbox, a cancelled run ends cancelled and any other fails ("see the CI run"); the run waits up to 15 min only while the provider can't report the CI run's status.
- An outbox over 512 MiB, or one that fails to replay, fails the run. The run's Artifactory folder is deleted after every replay and every end; an hourly sweep removes folders of no active run.
- The outbox is the same journal records as live mode, replayed through the same ingest when it arrives.

## Git

- Never force-push; push only the ticket's branch; a branch that moved is rejected, not overwritten.
- Branch names match a pattern; a URL may not start with `-` and goes after `--`; no userinfo except `git@`; `GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`, `core.quotePath=false`; blobless clones without tags.
- Context files, protected paths and `.agentos/` never get committed: excluded, skip-worktree, then unstaged and checked after `git add -A` (`.gitignore` negations leak), and a final guard over the run's commits. Build junk (`*.pyc` and the like) is excluded.
- Before every publish and before an API ref write: check the run isn't gone and the deadline hasn't passed.
- Hooks run, and chain to the user's own hooks; pre-push requires the run's marker. Local and client workers commit as the user (no `--no-verify`, no identity override); only CI uses the AgentOS identity.
- A repo's own `AGENTS.md` is kept: the ticket's instructions go in as named blocks between markers, and the file is never committed back. A generated CLI file (R20) that the repo already has, such as its own `CLAUDE.md`, gets the same treatment: blocks in the existing file, never committed. A shipped agent or skill file that already exists in the repo (compared ignoring case) is never overwritten: setup fails instead. Other context files are written over the checkout and never committed.
- API publishing: setup first probes that the token can write blobs; blobs are read from git's object database, not the working tree; one commit per publish; non-ancestors and merges refused; the tree must equal HEAD's; ref updates never force and an ambiguous reply is read back; afterwards the local branch is synced to the published commit (fetch, soft reset, set upstream) so the next stage builds on it; a GitHub 401 is GitHub's, never "the run is gone"; redirects are refused (they would forward the token).
- PR URLs come from `gh`, never from agent output.

## Files and paths

- One path rule set, tested from one table on both ends: ASCII `[A-Za-z0-9._ @+-]`; no `..` or `.git` in any case; no trailing dot or space; no reserved Windows names (including `CON .txt`); no Unicode normalisation; unique ignoring case; no links at any component; only regular files are read.
- Context limits: 1 MiB per file, 20 MiB per ticket.
- Only items shipped writable sync back, after each stage, in their declared mode; the server accepts only matching paths and modes. A note that is rewritten rather than appended to gets a warning.
- Instruction blocks: written between `agentos:begin/end <name>` markers; no markers inside a block; read back byte-exact for LF and CRLF.
- The verdict file is deleted before each check.
- Uploads: token checked before the body; an oversize Content-Length is refused (413) unread; the size limit is enforced while streaming; the hash must match; file names that can't be encoded are handled, not crashed on.
- Workdirs must be absent or empty and outside any git repo (a parent repo's instructions leak in). Cleanup deletes only folders the client owns.

## Processes (R45)

- Windows: stages run in a job object with kill-on-close, plus a tree kill; detached with `CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW`, stdin from DEVNULL or a thread, output to a log; git and helpers get `CREATE_NO_WINDOW` too. POSIX: a new session and `killpg`.
- Read pipes before writing stdin, write stdin from a thread, abandon reader threads after 5 s (orphans hold the pipes).
- Liveness is an OS file lock, never a PID (a venv `python.exe` is a stub; PIDs get reused).
- Deleting a workspace clears read-only flags and retries (git packs); junctions count as links; environment names are case-insensitive on Windows.
- A `.cmd`/`.bat` shim (npm's `claude`, `copilot`) never gets `\r\n"&|<>^%!` in its argv.
- Tests re-enable Ctrl+C (`SetConsoleCtrlHandler(None, False)`) and prove a run survives it.

## Templates and agents

- Prompts are sandboxed Jinja with undefined names as errors; imported Jira text is untrusted. Checked at save against sample tickets; rendered at launch, every round and repair up front.
- Argv placeholders replace whole elements (except the session id), so a value can't split into flags.
- Agent CLI quirks belong in the runtime's template: Copilot's `--resume=<id>` starts a new session with that id; a usage limit (429) shows only as exit 1; headless `claude -p` kills background tasks after 10 minutes.

## Jira

- Cloud search is `POST /rest/api/3/search/jql`, with no total: page by `isLast`, count with `/search/approximate-count`. Data Center keeps v2 with a total.
- Invalid JQL comes back as an empty page on Cloud, so an empty result is checked with `jql/parse?validation=strict`.
- Import reads v2 (descriptions as wiki text); issue types map to the four ticket types. Any valid Jira key imports (V1 refused keys with `_`: a bug).
- Intake and field discovery use a Jira service account configured in the environment.

## Config

- Environment: only what's needed to start (URLs, host, port, data and web folders, secrets, run target, admins, dev auth, proxy trust). Unknown keys fail startup, reporting every problem at once.
- Everything else is one versioned document per Settings area, seeded on a fresh database.

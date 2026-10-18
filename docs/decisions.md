# Decisions

## Taken

| # | Decision | Why |
|---|---|---|
| D1 | Rebuild from scratch; no V1 code or tests come over. Only the gates, the requirements and the lessons. | V1's shape fought every refactor: refactors grew code, and its tests outgrew it (22.5k lines against 17.6k) and were slow. |
| D2 | Gates from the first commit, empty baseline, run in CI on every PR. | glance v2 moved fast because its shape was held from the start; V1's gates never ran in CI. |
| D3 | Requirements over V1's interface: a smaller API that meets every requirement is preferred. | V1's API grew per screen. |
| D4 | Server first, then the worker; the web app stays in V1 until V2's API exists. | The server is the centre; V1's web shows the requirements in use. |
| D5 | `AGENTS.md` is the one authored instructions file; anything a CLI needs beyond it is generated (R20). | Portable across agent CLIs. |
| D6 | Turso, behind one boundary module. | Its built-in MCP server is wanted later; the boundary keeps SQLite as a fallback. |
| D7 | Fast tests: fakes for git and processes, in-process API tests, a small marked integration suite, markers instead of timers. | V1's unit suite ran real git and timer-based asserts: slow, and it flaked. |
| D8 | Windows and Linux process handling are requirements from day one (R45). | Each V1 rule there cost a real bug. |
| D9 | Every change through a PR, reviewed by an Opus reviewer and a Codex reviewer (both high effort), looped until no must-fix finding remains. | Two independent reviewers catch what one misses; the loop gives a clear stop. |
| D10 | The visual style is V1's; the web is built only from reusable components and tokens. | V1 had no kit: 4 list editors, 1,545 raw px values. |
| D11 | A ticket's context items are its own copies of library items, with drift shown and promote by hand. | Nothing changes under a running ticket; one versioning scheme for every kind. |
| D12 | The docs follow the code: a PR that changes behaviour updates the docs it contradicts. | V1's docs drifted from its code. |
| D13 | Mailbox stays, as a transport of the one protocol, its outbox as journal records. | Work CI can't reach the server. |
| D14 | Merging needs green CI (check, tests, integration tests on Windows and Linux, gates) and the review loop; the owner merges. | V1's checks ran only on the developer's machine. |
| D15 | Python for the server and the worker; TypeScript for the web. | The worker must be stdlib Python 3.11 on runners; prompt templates need a proper sandbox (Jinja); the gates are built for Python. |

## Open

| # | Question | Default until decided |
|---|---|---|
| Q1 | Which social features beyond owner and conversation: mentions, notifications, presence, Jira comment sync? | Owner and conversation first; mentions next. |
| Q2 | Turso: which engine (libSQL or the new Turso), and does it pass the spike? It must: install from Artifactory on RHEL 8 / Python 3.11 and on Windows, run in the container, support partial unique indexes, CHECK constraints, foreign keys and immediate write transactions with a busy timeout, and give a per-test in-memory database fast enough for the speed gate. | The spike, before any database code. |
| Q3 | How does the web reach V2 if the API changes: an adapter in V1's web, or a new web app? And its kit: a component library, or our own? | Decide when the API is drafted. |
| Q4 | The worker as a zip served under a `.py` name may trip workplace scanners. Zip, plain file, or something else? | Check at work before the worker is built. |
| Q5 | Gates on runs: "dispatch again" to continue, or an approval record? Does a run's completion read the workflow it ran or the current one? | Dispatch again; the workflow it ran. |
| Q6 | Package compatibility: exact protocol lockstep, or ignore unknown fields? | Lockstep (V1); revisit with the worker. |
| Q7 | Liveness: a renewable lease, a wake signal, or V1's heartbeat with timers? | Heartbeat on the journal; events where a party can say so. |
| Q8 | Live updates: polling (V1) or a stream? | Polling every 1-3 s; a stream if the API draft shows it's simpler. |
| Q9 | Ticket edits: versioned like everything else? Ticket lists paginated? | Versioned; paginated. |
| Q10 | May any writer edit any ticket, or only its owner? | Any writer (V1). |
| Q11 | A CLI usage limit (429) shows only as exit 1: detect it and pause, or fail? | Fail with a clear reason. |
| Q12 | The network path from work runners to the server is unproven. | A spike before the GitHub Actions target. |
| Q13 | Claude Code may read only `CLAUDE.md`, not `AGENTS.md`. The owner's goal is no `CLAUDE.md`. If Claude Code needs one, is a generated one-line pointer (`@AGENTS.md`) acceptable, in runs and in this repo? | Check current Claude Code behaviour in step 1; ask the owner. |
| Q14 | Continue and Retry skip a `setup` stage (dependency install) that a fresh workspace still needs. A stage flag "runs every time"? | The flag. |

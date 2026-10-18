# Decisions

## Taken

| # | Decision | Why |
|---|---|---|
| D1 | Rebuild from scratch; no V1 code or tests come over. Only the gates, the requirements and the lessons. | V1's shape fought every refactor: refactors grew code, and its tests outgrew it (22.5k lines against 17.6k) and were slow. |
| D2 | Gates from the first commit, empty baseline, run in CI on every PR. | glance v2 moved fast because its shape was held from the start; V1's gates never ran in CI. |
| D3 | Requirements over V1's interface: a smaller API that meets every requirement is preferred. | V1's API grew per screen. |
| D4 | Server first, then the worker. V1 keeps running, with minor changes only, until V2 does everything V1 does; V2 gets a new web. | The server is the centre; V2's API is too different for V1's web ([api.md](api.md)). |
| D5 | `AGENTS.md` is the one instructions file shipped by default; nothing is generated per CLI. A Space that wants a `CLAUDE.md` adds one (pointing at `AGENTS.md`) to its library's default items; it isn't seeded, and a Space running Claude Code likely needs it. This repo has `AGENTS.md` only, and every brief tells agents to read it. | Portable across agent CLIs, and nothing to generate. |
| D6 | Turso, behind one boundary module, assumed to do what V2 needs (no spike). Where a dependency can't be installed from Artifactory, the owner supplies the binary for the container. | It's SQLite with extra features for agentic development (a built-in MCP server); the boundary keeps SQLite as a fallback. |
| D7 | Fast tests: fakes for git and processes, in-process API tests, a small marked integration suite, markers instead of timers. | V1's unit suite ran real git and timer-based asserts: slow, and it flaked. |
| D8 | Windows and Linux process handling are requirements from day one (R45). | Each V1 rule there cost a real bug. |
| D9 | Every change through a PR, reviewed by an Opus reviewer and a Codex reviewer (both high effort), looped until no must-fix finding remains. | Two independent reviewers catch what one misses; the loop gives a clear stop. |
| D10 | The visual style is V1's; the web is built only from reusable components and tokens. | V1 had no kit: 4 list editors, 1,545 raw px values. |
| D11 | A ticket's context items are its own copies of library items, with drift shown and promote by hand. | Nothing changes under a running ticket; one versioning scheme for every kind. |
| D12 | The docs follow the code: a PR that changes behaviour updates the docs it contradicts. | V1's docs drifted from its code. |
| D13 | Mailbox stays, as a transport of the one protocol, its outbox as journal records. | Work CI can't reach the server. |
| D14 | Merging needs green CI (check, tests, integration tests on Windows and Linux, gates) and the review loop; the owner merges. | V1's checks ran only on the developer's machine. |
| D15 | Python for the server and the worker; TypeScript for the web. | The worker must be stdlib Python 3.11 on runners; prompt templates need a proper sandbox (Jinja); the gates are built for Python. |
| D16 | Social is the owner and the conversation. No presence, no notifications; maybe mentions later. Jira sync is a much later feature, likely to come. | Keep the first version small. |
| D17 | The worker program is served as an archive: 7z for Windows, tar.gz for Linux, with one content hash for both. Windows machines unpack with the installed `7z` (a prerequisite, like git). Details in rules.md › Worker protocol. | The team uses 7z daily; no format questions at work. |
| D18 | A gate is passed by Continue: a new run from the stage after the gate. No approval record. A run uses the ticket's workflow as it is at launch, and records it. If the workflow changed since the last run, Continue, Retry and Request changes aren't offered: the choices are Dispatch (from the first stage) or Run from a chosen stage. | Simplest and intuitive: an edited workflow is the one that runs, and "continue" never resumes a plan that no longer exists. |
| D19 | The worker and the server speak one protocol version exactly (lockstep). | The most robust: a mismatch fails at once, never half-works. |
| D20 | Worker liveness: V1's heartbeat on the journal, with timers only for a party that died. | Simplest safe option; its rules are known. |
| D21 | No polling from the web: one server-sent event stream (`/changes`) says what changed. | A plain HTTP stream: simpler than WebSockets, and it reconnects on its own. |
| D22 | Ticket fields aren't versioned (last write wins); context items are. Ticket lists are paginated. | Context is what matters; a ticket's title or description changing needs no history (an imported ticket's lives in Jira). |
| D23 | Any writer may edit any ticket. | As Jira. |
| D24 | A CLI usage limit (429, which shows only as exit 1) fails the stage with a clear reason, found by the usage-limit marker the runtime declares in its output (R22). | Clear beats clever. |
| D25 | A runner on the owner's own machine reaching the server is proven. A self-hosted runner reaching it is unproven and a bonus, not a blocker. | The own-machine path covers the work that matters now. |
| D26 | A `setup` stage that runs on every dispatch (dependency install) isn't built; a stage is a record of named fields, so a "runs every time" flag can be added later as one new field. | Not in V1 either. |

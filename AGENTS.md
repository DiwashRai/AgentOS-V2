# AgentOS V2: rules for agents

Read first: `docs/vision.md` (what and why), `docs/architecture.md` (how), `docs/requirements.md` and `docs/rules.md` (what it must do). This is the one authored instructions file.

## The core idea

Check at the edges, trust the types inside. Anything from outside (HTTP, the database, Jira, GitHub, git, processes, files, config) is parsed once at the boundary into our own types. Past that point code trusts its types: no re-checking, no `isinstance` or `is None` just in case, no defensive `try`. Bad states can't be written down: a value's type says which state it's in.

## Layout

A feature is a package whose files say their role: `model.py`, `rules.py` (core: pure), `service.py` (shell: use cases), `routes.py`, `rows.py` and adapters (boundary). A use case spanning features is its own shell module. The worker is its own package with the same roles. import-linter and the gates enforce them; see `docs/architecture.md`.

## Changes

- Every change is a PR: one concern, modules a person can read in a sitting (none over 1,000 lines).
- Each PR's description carries its gate card (`just card`).
- Review: an Opus reviewer and a Codex reviewer, both at high effort, label findings must-fix, should-fix or nit. Fix and re-review until neither reports a must-fix.
- A change to behaviour updates the docs it contradicts, in the same PR.
- Commits: one task each; the message from a file (`git commit -F`); only a `Co-Authored-By` trailer, never a session link.
- Never skip the hook (`--no-verify`). Never weaken a check or a gate to make it pass: a failing gate means simplifying the code, not moving or disguising it to get past. `raises` entries in the gate baseline are the owner's to add.
- A PR merges when CI is green and the review loop is done. The owner merges.

## Commands

| Command | What |
|---|---|
| `just check` | Format, lint, types (strict), import rules |
| `just test` | The fast suite (under 10 s; its time is gated) |
| `just test-integration` | Real git and real processes |
| `just gates` | The measured limits: complexity, defensive patterns, `Any` in the core, fan-out, file size, suppressions |
| `just ratchet` | Lower the gate baseline after the code improved |
| `just card` | The gate numbers for a PR's description |

The pre-commit hook runs `check`, `test` and `gates`. CI runs all of them, `test-integration` included, on Windows and Linux for every PR.

## Tests

- Behaviour at the seams, never exact wording; one test per behaviour, not per function. The core with plain values; the API in-process against an in-memory database; git, processes, HTTP and the clock faked.
- Real git and processes only in the integration suite, for what fakes can't prove: the git protections and process handling (`docs/rules.md`). The database engine has its own contract tests there too.
- No sleeps and no picked-number deadlines: inject the clock, assert on markers. A wait in an integration test is bounded by configured timing.
- Tests strip ambient credentials and CI variables (`GITHUB_ACTIONS`, `GH_TOKEN`, `AGENTOS_*`).

## Platform

- Windows 11 for development; Linux (RHEL 8) in containers and on runners. Both are first-class.
- A process the server or worker starts runs in its own process group with no console window; on Windows inside a job object that kills the tree, on Linux in a new session killed with `killpg` (`docs/rules.md` › Processes).
- Files are LF everywhere; write with `newline="\n"`.
- Installs come from Artifactory at work: no unsigned binaries, no public registries in the container build.

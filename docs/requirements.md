# Requirements

What V2 must do: the parity list against V1. Every V1 capability is here, or under "Dropped" with a reason. The invariants and edge cases behind them are in [rules.md](rules.md). V1's interface (endpoints, field names) is a reference, not a contract: a smaller API that meets every requirement is better.

## People and access

- R1. Sign in with your own Jira credentials (Cloud: email + API token; Data Center: PAT), checked against Jira and never stored. Sign out.
- R2. A new user waits as pending until an admin approves them. Configured admins are always admin. Admins disable users; nobody can demote or disable themselves.
- R3. Roles: pending, viewer, writer, admin. Viewers read and talk; writers change tickets; admins change the Space.
- R4. 14-day browser sessions with a CSRF header on writes; sign-in is rate-limited.
- R5. Dev sign-in, loopback only; the dev user is always admin.

## Tickets

- R6. Create a ticket: title, description, type (feature, bug, improvement, task), priority (high, normal, low), labels. Native keys are `<PREFIX>-<n>`; the prefix can't be a Jira project key of the Space.
- R7. Take a ticket in from Jira by key; taking the same one again returns it, not a copy.
- R8. Edit a ticket's fields, owner, repo (or no repo) and base branch, and see where the base branch came from (set by hand, from a Jira field, the repo's default).
- R9. States: open, done, closed. Resolve as completed (done) or abandoned (closed); reopen.
- R10. List and search; filter by type and priority; closed tickets hidden by default.
- R11. The server decides which actions a ticket offers now (dispatch, continue, retry, run from, request changes, cancel, resolve, reopen) and why one is blocked. Request changes sends a gated ticket back to its last stage with the reviewer's notes added to its context.

## Board

- R12. Derived from runs, never stored: the phase (inbox, plan, build, verify, review, done); the rail of stages (pending, current, done, failed, stale, skipped, with gate state and "round N of M"); attention (needs you, waiting on someone, running, queued, blocked, inbox, done); and a one-line "now".
- R13. Attention depends on the viewer: "needs you" if you own the ticket or nobody does, else "waiting on <owner>". My queue is how you learn something needs you, until notifications exist (Q1).
- R14. Views: my queue, a compact list, intake, the ticket (overview, runs, context, workflow, conversation) and a quick peek. Changes appear within 3 s.

## Conversation

- R15. Each ticket has a human-only conversation (never sent to agents), paged, open to viewers and above.

## Context

- R16. A ticket's context items: `AGENTS.md` (instructions, as named blocks), skills, agents, notes (append-only logs agents add to), a `TASKS.md`-style plan whose progress is counted, and plain files. The ticket says, per item, whether agents may change it (writable items sync back). A new ticket starts with the library's default items (instructions, a ticket skill, a plan, the notes). Limits in rules.md › Files and paths.
- R17. Each item is versioned, with who or which run wrote each version; every version can be read back.
- R18. Edit, add and delete items with a version check, so two people can't overwrite each other.
- R19. The Space library holds the shared items, agents and workflows. A new ticket copies what it uses. Drift between a ticket's copy and the library is shown both ways; a ticket can take the library's newer version. Admins edit the library directly and promote a ticket's version into it, with a version check: if the library moved meanwhile, promote is refused with the diff.
- R20. Each runtime gets the context the way its CLI reads it, from one authored source: people write `AGENTS.md` and skills once; any CLI-specific file or folder is generated per run, never authored or committed.
- R21. A run gets exactly the item versions current at launch (when its job is built), and records them.

## Agents and workflows

- R22. A runtime is how to call an agent CLI: an argv template, edited in Settings. Claude Code and Copilot CLI are built in.
- R23. An agent is a library item: instructions plus a runtime, model and effort. A stage uses an agent, can override its runtime, model and effort, and has its own timeout.
- R24. A workflow is a library item: stages, each with enabled, gate after, phase, needs a repo and timeout. An agent stage can resume its session and be a check with verdict repairs (0-3); a shell stage can be a check (exit 0 passes).
- R25. Loops: a block of stages repeated up to 5 rounds until its checks pass (rules.md › Workflows).
- R26. A check's verdict is pass or fail with notes, from the CLI's structured output or a verdict file. An invalid verdict is repaired by resuming the session; failing that, the check fails.
- R27. A ticket copies a workflow at creation and may switch; it shows which workflow and version it came from. Writers edit the ticket's copy (stages, enabled, gates, loops, prompts, overrides) with a version check. "Standard" (plan, gated → implement → lint, off → review → open a PR) is seeded and is the default; admins manage library workflows.
- R28. Prompts are templates over ticket fields, checked when saved and at dispatch, rendered at launch.

## Runs

- R29. Dispatch from the next stage or a chosen stage; continue after a gate; retry after a failure; cancel.
- R30. A run runs its stages up to the next gate or the end, and ends gated (a gate with an enabled stage after it), succeeded, failed or cancelled, with the reason shown.
- R31. A time budget from the stages' timeouts, rounds and repairs, capped so it fits the CI job's timeout; over budget, the run fails.
- R32. Watch a run live: stages, rounds, verdicts, summarised agent output, warnings; see exactly what each stage was given and how it was called; download its other output (at most 20 MiB; mailbox runs have none).
- R33. The worker commits and pushes after every stage and syncs declared context back after every stage.
- R34. The last stage can open a pull request; the ticket gets its URL.
- R35. Runs that never start, go silent or outlive their budget are ended with the reason (rules.md › Runs and jobs).

## Where runs run

- R36. GitHub Actions runners, reporting live.
- R37. Mailbox: for work CI that can't reach the server, the job goes out and the results come back as files through Artifactory.
- R38. Your own machine: a client started with a token from Settings takes your runs, several at once, and survives restarts.
- R39. Run targets are plugins; adding one doesn't touch the core. Runtimes are data (argv templates). Jira sits behind one boundary module.

## Worker protocol

- R40. One protocol for every target: a complete job package built at launch (no secrets in it), and an ordered journal from the worker (started, stage started and finished, logs, warnings, verdicts, synced files, pushes, result), applied once each, in order.
- R41. Live targets: the first worker to start a job owns it, and learns within 10 s that its run ended or was cancelled. Mailbox works through the CI provider instead (rules.md › Mailbox).
- R42. The server serves the worker program, versioned and hashed.

## Safety and platform

- R43. Agents have a shell, so credentials stay out of their reach (rules.md › Access and credentials).
- R44. Git and the repo are protected (rules.md › Git).
- R45. Windows is first-class (rules.md › Processes); so is Linux.
- R46. One path rule set on both ends (rules.md › Files and paths).
- R47. Publishing through the GitHub API where work CI forbids `git push`.

## Settings and deployment

- R48. Environment holds only startup config; everything else is edited in Settings, stored and versioned (rules.md › Config).
- R49. Settings: Space, repos, intake (saved JQL with a preview, validation), mappings (a Jira field to the base branch, with discovery and a preview), runner, runtimes, prompt defaults, users, my client. Agents and workflows live in the library.
- R50. Runs in a container and fits the workplace: Artifactory-only installs, RHEL 8, Python 3.11 on runners, no unsigned binaries.

## Dropped from V1

- `CLAUDE.md` as an authored file: `AGENTS.md` is the source (R20 generates what a CLI needs).
- Protocol 1, the local launcher (the client covers it), `agentos.toml` seeding, server-sent events with no client, upgrade shims: dead weight in V1.
- Separate "template" and "save as preset" mechanisms: one library with promote (R19).

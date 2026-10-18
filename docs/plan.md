# Plan

Each step is one or more PRs, each green in CI (D14), with its card in the description.

1. **Skeleton.** `justfile`, the gates (empty baseline), the pre-commit hook, ruff, mypy strict, import-linter, pytest with the speed gate, CI on Windows and Linux with branch protection (D14), startup config (R48). A server that starts and answers health. The Turso spike (Q2) and the Claude Code check (Q13).
2. **States.** Every state and transition of runs, jobs, stage runs, tickets and context items, as types and a transition table, reviewed before the API.
3. **API draft.** The requirements mapped to the smallest API: resources, actions, models, error codes, as a short doc and an OpenAPI schema.
4. **People.** R1-R5.
5. **Tickets, context and the library.** R6-R10, R15-R21.
6. **Agents and workflows.** R22-R28.
7. **Runs.** Dispatch, the state machine, the journal, the board, with a fake worker driving the protocol. R11-R14, R29-R35, R40-R42 (server side).
8. **The worker.** The protocol from the worker's side; the process, git and file boundaries. R33, R40-R47.
9. **Targets.** GitHub Actions (after the network spike, Q12), the client, mailbox. R36-R39.
10. **Web.** The component kit first, then the screens on the new API (Q3).
11. **Settings, intake and deployment.** R49-R50.

## Measuring progress

Kept per step, so "is V2 faster" has an answer:
- requirements met, and calendar days taken;
- production and test lines per requirement, against V1;
- test suite time;
- gate failures per PR, and named exceptions in the baseline (target: zero).

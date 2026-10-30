# AgentOS V2

A control pane for coding agents, shared by a team. You write a ticket, give it context (`AGENTS.md`, skills, notes), pick a workflow of agents, and dispatch it. A worker on a runner or your own machine runs the agents on a branch, stops at gates for a human, and ends with a pull request. Everyone sees who owns what, what is running and what needs them.

V2 is a rebuild of [AgentOS V1](https://github.com/DiwashRai/AgentOS). It keeps V1's requirements and lessons, not its code: the code is written from scratch under quality gates from the first commit.

Status: design. No code yet.

## Read

| Doc | What |
|---|---|
| [docs/vision.md](docs/vision.md) | The product: problems, principles, words, the loop, context |
| [docs/requirements.md](docs/requirements.md) | What V2 must do, checked against V1 |
| [docs/rules.md](docs/rules.md) | The invariants and edge cases V1 learnt the hard way |
| [docs/architecture.md](docs/architecture.md) | How it's built: layers, states, boundaries, tests |
| [docs/decisions.md](docs/decisions.md) | Decisions taken, and the ones still open |
| [docs/plan.md](docs/plan.md) | Build order and how we measure progress |
| [AGENTS.md](AGENTS.md) | Rules for agents (and people) working in this repo |

## Branches after the 2026-10-30 clean-up

The local working copies had grown to many worktrees and stale branches, so they were cleared out. What was worth keeping now lives on two branches:

- **`frontend`** (this one): the web restyle (`web-restyle`, plus the 29 commits of front-end checks from `web-patterns`), and [docs/design/](docs/design/README.md): the HTML mockups, the gauntlet notes (`web-review/gauntlet3/state.md` is the full history) and the review rounds.
- **`backend`**: ticket-01 (the database), the gates rework as a patch, the ticket list, and the API docs (`docs/api.md`, `docs/api-v1.md`, `docs/api-map/`). Its README says how to pick each up.

Screenshots were not kept. The app's screens regenerate from `web/e2e/screens.spec.ts`. The owner keeps the final screens and the Linear references separately.
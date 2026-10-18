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
| [docs/architecture.md](docs/architecture.md) | How it's built: layers, modules, states, boundaries, tests |
| [docs/api.md](docs/api.md) | The API: resources and actions, mapped from V1's |
| [docs/api-v1.md](docs/api-v1.md) | V1's API as built, for reference |
| [docs/decisions.md](docs/decisions.md) | Decisions taken, and the ones still open |
| [docs/plan.md](docs/plan.md) | Build order and how we measure progress |
| [AGENTS.md](AGENTS.md) | Rules for agents (and people) working in this repo |

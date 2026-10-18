# Vision

AgentOS is where a team runs its coding agents. It makes agent work visible, reviewable and repeatable, and it makes the context agents need easy to write, share and improve.

Simplify aggressively. If a feature doesn't clearly help one of the problems below, cut it.

## The problems

- **Context is scattered.** The instructions, skills and notes that make an agent good live in random files and chats. Good context isn't shared, and a lesson learnt on one ticket is lost on the next.
- **Agent work is invisible.** Nobody can see what is running, where it got to, or what is waiting for a human.
- **Runs aren't repeatable.** What a run was given (prompt, context, stages, model) isn't recorded, so a good result can't be reproduced and a bad one can't be explained.
- **Humans are the bottleneck, badly.** Agents should stop where judgement is needed and nowhere else, and the person needed should know.
- **Where agents run is messy.** Work CI can't reach the server, laptops come and go, and agents have a shell, so their credentials must be narrow.

## Principles

- **Context is the product.** Writing, sharing, reviewing and improving context is the main job of the UI.
- **Portable over proprietary.** `AGENTS.md` is the instructions file; no authored `CLAUDE.md`. What we ship to agents works with any agent CLI.
- **Everything a run used is recorded.** A run can be explained from its record alone.
- **Plain code first, AI second.** Rules are ordinary code; agents do the work that needs judgement.
- **Social by default.** Every ticket has a conversation, can have an owner, and says clearly who it's waiting on.
- **One look.** The visual style is decided (V1's). Screens are built from a small set of highly reusable components and tokens, never styled one by one.

## Words

| Word | Meaning |
|---|---|
| Space | One team's AgentOS: its people, repos, settings and shared library. |
| Ticket | A unit of work with a description, an owner, context and a workflow. Native, or imported from Jira. |
| Context | What a ticket gives its agents (the kinds are in R16). |
| Library | The Space's shared context items, agents and workflows, which tickets start from and promote back to. |
| Runtime | How to call one agent CLI (Claude Code, Copilot CLI): an argv template. |
| Agent | A library item: instructions plus a runtime, model and effort. Stages use agents. |
| Workflow | A library item: ordered stages, with loops and gates. A ticket works on its own copy. |
| Stage | One step: an agent stage or a shell stage. A stage can be a check that passes or fails. |
| Loop | Stages repeated until their checks pass, up to a limit. |
| Gate | A stop after a stage where a human decides what happens next. |
| Run | One dispatch of a ticket: its stages from where it starts to the next gate or the end. Dispatch queues it; it launches (its job is built) when it leaves the queue. |
| Worker | The program that runs a run's stages in a workspace and reports back. |
| Client | A worker on your own machine that takes your runs. |
| Runner | A CI machine (GitHub Actions) that runs a worker for one run. |

## The loop

1. **Create** a ticket, or take one in from Jira.
2. **Shape** its context and workflow, starting from the library.
3. **Dispatch.** A worker clones the repo, writes the context in, runs the stages on the ticket's branch, and commits, pushes and syncs context back after each stage.
4. **Gate.** The run stops; the owner reviews the work, the agent's notes and the diff, edits context, and continues, retries or redoes a stage.
5. **Finish.** The last stage opens a pull request. Lessons go back into the library.

## Context

Context handling is the heart of V2, and its main improvement over V1.

- **First-class items:** `AGENTS.md`, skills, agents and the rest (R16), and workflows (R24). Each is a named, versioned item, not just a path.
- **Written once, delivered per CLI.** People write `AGENTS.md` and skills; whatever a particular CLI needs (a pointer file, a skills folder) is generated for each run, never authored.
- **The library** holds the Space's items. A new ticket copies the items it uses; its copies are its own to change.
- **Promote** sends a ticket's improved item back to the library (an admin, with a version check). **Drift** shows where a ticket's copy and the library differ, both ways.
- **Every version is kept**, with who or which run wrote it. A run records the exact versions it used.
- **Agents write context too:** a run's notes and updated files sync back after each stage, so the next run starts from them.

## Social

- A ticket can have an owner; it waits on someone, and they see it in their queue.
- A conversation per ticket for humans, never sent to agents.
- People, roles and approval of new users.
- Next: mentions and notifications; later, presence (Q1).

## Out

- Our own agent runtime or model hosting: we drive existing agent CLIs.
- A general CI system: shell stages are checks inside a run, not pipelines of their own.
- Repo hosting beyond GitHub for now.

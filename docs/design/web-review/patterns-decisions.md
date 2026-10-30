# The patterns layer: decisions

The owner said "let's get it done" (2026-10-23) to `.review/patterns-plan.md`. Where the plan left a call open, it is settled here: the plan's recommendation where it gave one, otherwise one rule for every screen. This file overrides the plan where they differ.

## Product calls (plan §2, §6.1)

- **Empty owner:** "Unassigned" everywhere ("Nobody" goes).
- **Load wording:** "Loading {id, else the noun}"; "Can't reach the server · {message}"; "No {noun} {id}" (so `ticket-missing` changes).
- **Age:** "3h 10m" in a cell, the full form ("Updated 3 hours ago") in its tooltip. Intake's "1h ago" goes. One `ago()` in `domain/format`.
- **Queued titles:** recede (tone 2) in Compact too, as in All teams. One rule in `TicketTitle`; `recede` goes.
- **A running row's age:** "now" everywhere (as Compact).
- **All teams' key:** gets the priority bars, the same `KeyCell` as every list.
- **The agent's name in a run's line:** plain (All teams'), not 500.

## Structure calls (plan §6.2–6.6)

- **Missing vs unreachable:** yes. The `DataSource` boundary parses a not-found into a typed error, so `Load` can say `missing` truthfully (check at the edges).
- **The editors:** `features/shared/itemEditor/` and `features/shared/workflowEditor/`.
- **A budget for patterns:** none. The 2-screen rule and the domain-props rule are the control, both enforced.
- **Stale `single` reasons:** the check fails on them (fix the reasons in the same PR).
- **Intake's filter:** moves to `?only=`.

## How it's built

- Branch `web-patterns`, off `web-restyle` at `2498400`. One commit per PR in the plan's §5, in order; each commit is the PR's one concern.
- Each commit passes the pre-commit hook (check, test, gates) and `just shots`. A commit whose screenshots change rebaselines them (`just shots --update-snapshots=all`) and its message says which and why; a pure move changes none.
- At the end: an Opus and a Codex review of the branch, fixed until neither reports a must-fix.

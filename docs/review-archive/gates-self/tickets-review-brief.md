# Review: AgentOS V2's ticket breakdown

Read-only: don't edit, create, commit or push anything, except your one answer file.

## What to review
`C:\code\AgentOS-V2\docs\tickets.md` (new, uncommitted): the whole build as 43 tickets, each meant to be one PR.

The owner asked for **vertical slices**:
- little chunks of logic that can be verified and tested;
- each PR in the same or neighbouring packages, so the owner can follow it;
- not thin horizontal slices across many modules.

It replaces plan.md's steps 2–11. In particular, "design every state, then every API model" becomes types per ticket, with one exception: ticket 18 designs the run state machine on its own, before any dispatch code.

The context is on branch `docs/api` (PR #2, not merged); read it with `git -C C:\code\AgentOS-V2 show docs/api:<path>`:
- `docs/requirements.md` (R1–R50)
- `docs/rules.md`
- `docs/api.md`
- `docs/architecture.md` (› Modules: each package's "uses" list)
- `docs/decisions.md`
- `docs/plan.md`

Main also has `AGENTS.md` and the merged skeleton (`src/`, `tools/gates`).

## Judge on
1. **Vertical and small.** Is each ticket one verifiable behaviour, in the same or neighbouring packages, at a few hundred lines? Name tickets that are too big (split how?), horizontal, or too thin to verify alone.
2. **Order and dependencies.** Does any ticket need something from a later one? Does any ticket's package list break the module map's "uses" lists (for example, a package using something below it that isn't on its list)?
3. **Coverage.** Every requirement R1–R50 and every rule in `rules.md` that needs building has a ticket. List what's missing. Say if something is in no ticket at all, or is only implied.
4. **Verify lines.** Can the owner actually check each ticket that way, without reading every line?
5. **Brevity and clarity.**

Label every finding **must-fix**, **should-fix** or **nit**. Must-fix means a missing requirement, a dependency on a later ticket, a module-map violation, or a ticket that isn't a vertical slice. Cite ticket numbers. Say plainly what's good. Under about 700 words.

Note: the file was revised after Opus's round 1 (C:\code\AgentOS-V2\.review\tickets-review-opus-1.md): now 46 tickets. Review the current file.

Round 2 note: revised after round 1 (Opus: C:\code\AgentOS-V2\.review\tickets-review-opus-1.md; Codex: tickets-review-codex-1.md, same folder). Now 50 backend tickets plus the web track (W1-W11, proposed by the web implementer and approved by the lead; judge them on the same criteria but lightly). Check round 1's must-fixes are resolved, then a fresh pass. Must-fix only for a missing requirement or rule, a dependency on a later ticket, a module-map violation, or a ticket that isn't a vertical slice; anything else one line. Don't ask for every rule's full wording in a ticket: a ticket naming the rule and its section in rules.md is enough.

# Review brief: the patterns layer

Review the branch `web-patterns` in `C:\code\AgentOS-V2-web` against its base: `git diff 2498400 HEAD` (14 commits, `git log --oneline 2498400..HEAD`; read each message). Read-only: edit nothing, commit nothing.

What it is: a middle layer, `web/src/patterns/`, between the kit (`web/src/kit`, the only place that renders elements or holds CSS) and the screens (`web/src/features/<screen>`). The plan is `.review/patterns-plan.md`; the owner's settled calls are `.review/patterns-decisions.md` (they win over the plan). AGENTS.md's rules apply, above all: check at the edges and trust the types inside; never weaken a check or a gate; one concern per commit; a behaviour change updates the docs it contradicts.

Look for, with file:line evidence:
- **Correctness:** behaviour lost or changed in a move that the decisions didn't ask for; a read's loading, failure or absence handled wrong; URL state (`useParam`, `usePeek`, Intake's `?only=`); keys, focus, accessible names (a name read twice, a face with no name).
- **The layer's rules, and whether the gates really enforce them:** patterns draw the kit only, import only the kit, `domain`, `api/types` and other patterns, take domain values or slots as props (never kit vocabularies), serve 2+ screens; screens import no other screen; `features/shared` imports none. Try to find a way round each check (`web/eslint.config.js`, `web/tools/kit.mjs`, `web/tools/patterns.mjs`, `tools/gates/`). A check that can be passed by moving or disguising code is a must-fix.
- **Design:** is each pattern the right unit (too big, too small, a prop that's really a styling knob, a slot that hides a missing concept)? Anything that should be a pattern and isn't, or is and shouldn't be? Dead code left behind, two copies still alive.
- **Tests and docs:** behaviour at the seams, one per behaviour; `docs/architecture.md` › The web and AGENTS.md say what the code does.

Label each finding **must-fix** (a real defect, a broken or bypassable rule), **should-fix**, or **nit**. Be harsh and specific; skip praise. Report under 900 words: a one-line verdict, then the findings ranked, each with file:line and a one-line fix.

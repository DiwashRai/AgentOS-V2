# Section, round 1: what was fixed

From `section-opus-1.md` (3 should-fix, 8 nits) and `section-codex-1.md` (1 should-fix, 1 nit).

## Should-fix
- **The panel context leaked (Opus 1, Codex 1).** Section wraps its body in `InPanel value={false}`, so only a panel's direct Sections are parts. Each Dialog also resets it, so a full Dialog opened from inside a panel is not a part.
  - Probe (`k13-probe.mjs`): a side Dialog's "Outer" Section is padded 16px. A full Dialog inside it has an "Inner" Section padded 0.
- **The head-to-body gap (Opus 2 and 3).** The head keeps `--sp-3` more room under it, so the head-to-body gap is 16px on every Section (`k14-probe.mjs`).
  - `note` takes a node, so the Workflow tab's drift chips and "Edited by" sit under the title as its subline again.

## Nits taken
- **Opus 4:** the heading uses Text's own `heading` role class, rather than a third copy of it.
- **Opus 5:** the peek's head part is named by the ticket's title.
- **Opus 6:** the Library panel's tablist is named "Kind", not "Library" a second time.
- **Opus 8:** a Section's note describes it. Talk's region says "Just people here. Agents don't read this."
- **Opus 9:** `aside` and `note` are typed alike. PlanSection passes `aside` only when there is a plan.
- **Opus 10 and Codex 2:** the kit sheet shows Section in all three forms. Its own local helper is renamed `Block`.

## Not taken
- **Opus 7, every Section a landmark:** the regions are few per screen (at most 3 or 4), and each is a part a person would jump to.
- **Opus 11, a side Dialog's children can't be forced to be Sections:** React can't type that. Dialog's doc says it, and the one side Dialog (the peek) uses Sections in all three of its states.

Checks, 17 web tests, gates and 22 screenshots pass. The baselines for the peek, the ticket page, the skill and workflow editors and the kit sheet were re-taken after a look. Kit: 44/45 components, 8,363 of 9,000 lines.

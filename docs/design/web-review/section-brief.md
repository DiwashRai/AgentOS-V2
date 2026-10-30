# Review brief: Section

Repo `C:\code\AgentOS-V2-web`, branch `web-restyle`, commit `d7fd10a` (the change is `26943ed..d7fd10a`). Read only: don't edit, commit or stash. Write your findings to the file named in your prompt.

The owner asked for a `Section` kit component, which settles decision #1 in `kit-review-done.md`: the peek's Dialog side look used to style each top element of its children as a section, by position.

- `web/src/kit/Section.tsx` is a named `<section>`, either with a heading (and optional `aside`, `note` and `end`) or with only an `aria-label`.
- In a side Dialog (the `InPanel` context) each Section is one of the panel's parts, padded and ruled off. Dialog's positional `.body > *` rule is gone.
- It is used in the peek, on the ticket page (Plan, "The agent reads", Talk), in the library rail, on the Workflow tab and in the editor's Library panel. Plan and Talk are now shared between the ticket page and the peek (`features/ticket/plan.tsx` and `talk.tsx`).

The rules are as in `kit-review-brief.md` and `kit2-brief.md`: you may run the app on your port (Opus 5221, Codex 5231), and stop what you start.

Look for: behaviour and accessibility (region names, headings, landmarks, duplicate names); API design (bad states that can be written, props that overlap); regressions on the screens that changed (the peek, the ticket page, its Workflow tab, the library editors, the workflow editor), in both themes; and anything left that still lays a part out by position.

Label each finding must-fix, should-fix or nit, with `file:line` and a concrete failure. End with `Verdict: done` if there is nothing above nit.

## Round 2

Round 1's findings are in `section-opus-1.md` and `section-codex-1.md`; the fixes are in `fdb81f1`, listed in `section-r1-fixes.md` (with two declined, and why). Review at `fdb81f1`: check the fixes hold and look again at `26943ed..fdb81f1`. The owner wants to start the gauntlet next: end with 'Verdict: done' if only negligible details remain.

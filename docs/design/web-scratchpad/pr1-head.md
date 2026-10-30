The web's W0, on fixtures with no server yet: the design kit, the screens, and the restyle to a flat, quiet look. It is the first web PR. `main` has no web today, so this is large: 64 commits and 234 files.

## What's in it

- **The kit** (`web/src/kit`): the only place that renders elements or holds CSS.
  - 44 of 45 components, 8,460 of 9,000 lines, at most 8 props each.
  - Every component, prop and variant has a reason in `ledger.json`, checked by `web/tools/kit.mjs`.
  - The budget raises (26 → 40 → 45 components) are the owner's.
- **The screens:**
  - My queue, Compact, Intake, All teams;
  - the ticket page and its peek;
  - the library (workflows, agents, skills, files) and the workflow editor.
- **Two themes:** Paper (light) and Carbon (dark), from one token file (`kit/tokens.css`).
- **Screenshot tests:** 22 Playwright tests, `just shots`, with Windows baselines. CI doesn't run them.
- **Development only:** the kit sheet and the Linear twins at `/kit`, used to judge the design. They are skipped by the reuse count.
- **Small changes to shared files:** `.github/workflows/ci.yml`, `justfile`, `AGENTS.md`, `.gitignore`, and `tools/gates` (`ts_measures`, the raw-tag measure, and its test).

## How it got here

| Commits | What |
|---|---|
| `ed1775b`…`4102414` | The W0 kit spike, the Graphite look, the first restyle, the library and workflow-editor screens |
| `7350393`…`fdb81f1` | Kit consolidation, then the Base UI pieces (Tooltip, Menu, Toast, Checkbox, Radio) and Section, each through Opus and Codex review loops until both said done |
| `cc43902`…`64c804d` | The design gauntlet: rounds judged by blind design panels against Linear's screens, plus the owner's own calls (two themes, bands, palette, Inter) |
| `2498400` | A cleanup after the gauntlet: names that say what they draw, one place per theme in the tokens, dead variants gone. No product screen changes |

## Review status

- The kit up to `fdb81f1` went through the Opus and Codex loop. `.review/kit-review-done.md` and `.review/kit2-review-done.md` hold the record. Those files are local only; `.review/` isn't in the repo.
- The gauntlet commits (`cc43902`…`64c804d`) were judged for design, not reviewed as code.
  - An Opus audit of the kit after them found the decay that `2498400` fixes.
  - The Opus and Codex code-review loop has **not** been run over `cc43902`…`2498400` as a whole.

## Known

- **Renderer drift:** this machine's Chrome now draws every screenshot 1–5 px differently on unchanged code, so `just shots` on this branch fails locally by a few pixels. The follow-up branch rebaselines it on its own commit (`608c6b4`).
- **Follow-up:** `web-patterns` (29 commits, reviewed clean by Opus and Codex) stacks on this branch. It adds the patterns layer between the kit and the screens, and resolved-path layer checks.

## Gate card


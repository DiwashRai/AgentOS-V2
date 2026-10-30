# Review brief: W0, the kit spike (round 1)

You are reviewing an uncommitted change in `C:\code\AgentOS-V2-web` (branch `web-w0`; `git status`
shows it: `web/` is new, plus small edits to `justfile`, `.github/workflows/ci.yml` and
`.gitignore`). Read `AGENTS.md` first. Do not edit any file except your answer file.

## The ticket
`C:\agents\memory\agentos-v2\work\w0-kit-spike.md` (read it): prove a small kit can rebuild V1's
main screens (My queue with the peek, Compact with an expanded row, Intake, the ticket page) and a
new All teams screen, as static screens on typed fixtures behind one data module. Rules from the
owner: our own tokens and visual components; a headless library (Base UI was chosen over React Aria
by building a theme Menu and an owner picker with each) only for keyboard/focus/placement pieces;
the browser's `<dialog>` for dialogs. Gates: only `web/src/kit/` renders elements or has CSS;
screens hold 0 raw tags; kit props are token names; Stylelint refuses raw values; `count.mjs`
counts both webs; a kit ledger (`web/src/kit/ledger.json`), a budget (25 components, 8 props, the
kit's line count) and a reuse count (`web/tools/kit.mjs`); Playwright screenshot tests rather than
many unit tests. The lead's earlier rules are in `C:\agents\memory\agentos-v2\work\web-decisions-1.md`.

## What is where
- `web/src/kit/`: tokens (`tokens.css`, the only raw values), 25 components, `ledger.json`.
- `web/src/api/`: hand-written API types (`types.ts`), the `DataSource` seam, the fixture source,
  the query hooks. `web/src/domain/`: pure helpers (`board.ts`, `format.ts`, `plan.ts`) and the
  invented fixtures (`fixtures.ts`, excluded from the gates as data).
- `web/src/features/`: the screens (queue, peek, compact, intake, ticket, teams), `shared/`, and
  `sheet/` (the `/kit` page). `web/src/app/`: routes and the layout.
- `web/tools/kit.mjs` (ledger, budget, reuse; `just gates` and `just card` run it),
  `web/tools/count.mjs` (V1 vs V2 counts), `web/e2e/` (Playwright screenshots, baselines committed).
- ESLint boundaries in `web/eslint.config.js`; Stylelint in `web/stylelint.config.mjs`.

## What to judge
1. **Shortcuts around the gates.** Is ad hoc, screen-specific code hiding in the kit? Any raw value
   smuggled in (TSX numbers, inline styles, `calc` tricks), any prop that isn't a token name, any
   way a screen could pass a class or style? Known escape hatches, to judge whether each is
   acceptable: `tokenPx()` reading a token for Base UI's numeric offsets; `Stepper`'s fit check
   mirroring its CSS geometry in numbers; SVG coordinates in `Icon`; the `vars()` helper; the
   `features/sheet` page excluded from the reuse count.
2. **The kit gate and the counter.** Does `kit.mjs` really catch a component, prop or variant
   without a ledger reason, and stale ledger entries? Is the reuse count honest (how `shared/`
   modules are attributed)? Does `count.mjs` count V1 and V2 the same way?
3. **Correctness.** The board's viewer-relative rules in `domain/board.ts` (needs you = waiting on
   me or on nobody, R13), the stage model, the screens' use of the fixtures; anything that renders
   wrong or crashes for another fixture state.
4. **Types and boundaries.** "Check at the edges, trust the types inside": no defensive checks
   inside, no `any`, discriminated unions used rather than optional soup. The API types vs
   `docs/api.md` (`git show origin/docs/api:docs/api.md`): anything that contradicts it.
5. **Accessibility and behaviour** of the interactive kit pieces (Row's opener, Dialog, Menu,
   Select, Tabs, Segmented, the search field).
6. **The shared files** (`justfile`, CI, `.gitignore`): are the changes small, correct on Windows
   and Linux, and do they keep the fast suite fast?

## Answer
Write findings to `C:\code\AgentOS-V2-web\.review\w0-opus-1.md`, each labelled **must-fix**,
**should-fix** or **nit**, with `file:line` and one or two sentences: what is wrong and why it
matters. Guard against accidents and shortcuts, not an adversary. End with a one-line verdict.
You may run read-only commands (`just check`, `just gates`, `node web/tools/kit.mjs --check`,
`node web/tools/count.mjs C:\code\AgentOS\web web`, `npm --prefix web run shots`); don't change files.

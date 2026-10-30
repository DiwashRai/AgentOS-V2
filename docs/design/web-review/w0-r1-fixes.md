# W0 review round 1: what was done with each finding

1. **Fixed.** The budget is re-measured at the end: `lines: 4081`, the kit's count by the gates' own measure (see 27). `just gates` passes.
2. **Fixed.** `kit.mjs` rewritten on the TypeScript checker. Every PascalCase value export from `kit/index.ts` resolves through its call signature, whatever its spelling (function, const arrow, memo, forwardRef). A PascalCase export with no call signature fails ("isn't a component"). The props come from the first parameter's type, union members included.
3. **Fixed.** Variants are string and number literals. Item props are walked one level in (`Table.columns[].width`, `Page.counters[].mark`, `Segmented.items[].mark`, `Frame.nav[].icon`), each shape of a union item too. A prop typed with one of the kit's vocabularies (`Space`, `Width`, `Tone`, `MarkKind`, `IconName`) takes the vocabulary's reasons, given once in `ledger.vocab`; each vocabulary's values are checked both ways. Unused numeric variants were removed: `Stack.cols` is `3 | 5`, `Text.weight` is `500 | 600`.
4. **Fixed.** The card lists every variant set by 0 or 1 screens (from JSX literal attributes, through shared modules). The unused variants are removed: `Button.variant="outline"`, `Tone "warn"`, `Select.look` (Select is inline-only), `Menu.look` (Menu is the rail's; a page menu comes with W4).
5. **Fixed.** `--check --base REF` (default `HEAD`) fails on a budget field raised above the base without a `raises` entry `{budget, to, why}`. The card shows budget changes, new and changed `single` reasons, new vocabulary values and removed components.
6. **Fixed.** In `features/` and `app/`: react-router's `Link`, `NavLink` and `Form`, `react-dom` and `@base-ui/*` are restricted. All of `src/**/*.tsx` except the kit refuses intrinsic JSX (`no-restricted-syntax`), so `app/` and `api/` are covered too (the raw-tag gate still measures features).
7. **Fixed** (before round 1 closed): `calc` factors are capped at `* 2`, `* -1` and `/ 2`; colour functions are refused outside `tokens.css`, which holds the five derived `color-mix` tokens; `stroke-width` must be a `--line-` token; `lh`, `vmin` and `cq*` aren't allowed units; `fill-wide` is gone.
8. **Fixed.** `count.mjs --features a,b` limits screens in every web to those folders. A component is a PascalCase function, or a PascalCase const bound to an arrow function, memo or forwardRef. Kit exports are the index's exports that the kit defines as components (no names hard-coded).
9. **Fixed.** Two concepts, one definition each, named apart. "Needs you" is `groupOf === "needs_you"` (waits on me or on nobody), used by All teams and Compact. "Your move" is `isYourMove` in `domain/board.ts` (that, or blocked and mine or nobody's), used by My queue, whose zone and counter now say "Your move" / "your move". This is a proposed change from V1, which says "need you" there.
10. **Fixed.** My running tickets past the tiles' cap go to the rack ("Yours, running"). Done shows `CAP.done` with a "+N more" line.
11. **Fixed.** The ticket page and the peek say "Ticket not found · KEY" on an error. My queue and All teams show Loading and a failed read; Compact shows its error. The fixture source rejects an unknown key, as the API's 404 would. There is a new screenshot state, `ticket-missing`.
12. **Fixed.** Compact's running cell carries `progress: Progress | null` and draws no meter for null.
13. **Fixed.** Compact reads `?repo=` (with the repo in the context), and a new screenshot state, `compact-repo`, covers it.
14. **Fixed.** `ActionButton` has a `header` flag, and Dispatch run takes the accent only there. `blocked` always applies.
15. **Fixed.** `items(key)` is now in the DataSource (`ItemSummary`, fixtures, `useItems`). The Context count and "The agent reads" come from it, and the Runs count comes from `useRuns`.
16. **Fixed.** `Dialog` reports `onClose` only when the screen still wants it open (a ref of `open`), so a close that follows the URL doesn't push a second entry.
17. **Partly.** `Action` has `owner_only`, and `ActionButton` blocks an action whose role the viewer lacks ("Needs the writer role"). The `waiting_on` against `attention` shape and actions on rows are listed in the report, for the lead to settle with api.md's owner. I don't edit the backend's doc.
18. **Partly.** The `Number.isFinite` guard is gone. Parsing timestamps once at the boundary belongs to W11's HTTP client, the real edge. The fixture source serves ISO strings exactly as the API will; listed in the report.
19. **Fixed.** `ButtonProps` is a union: with children, or icon-only with `icon` and `title` required.
20. **Fixed.** `Row` takes `action: {label, run}`. A real `<button>` sits under the cells, stretched over the row, with `aria-label` and `aria-expanded` (when the row has an expansion). The cells sit above it with `pointer-events: none`, except for their own controls. The focus ring goes round the row.
21. **Fixed.** A blocked Button uses `aria-disabled`, stays focusable and does nothing. The reason is in a visually hidden span linked by `aria-describedby`, and in the tooltip.
22. **In the report.** The shots are manual: win32 baselines, run by `just shots`, not in CI or the hook. The tolerance is now `maxDiffPixels: 0` (the 0.2% ratio let a changed word through), stable over repeated runs.
23. **Fixed.** AGENTS.md: the prerequisites (Node 24, npm, Chrome), the `web/` row, the `dev-web` and `shots` rows, and Vitest outside the timed gate. The ESLint comment now says "AGENTS.md › Layout", and the "no web yet" texts in `ts_measures.py` and `test_pyfile.py` are gone.
24. **Fixed.** `tokenPx` throws on a missing token.
25. **Fixed.** The Stepper's fit check reads the tokens it is made of (`--sp-4`, `--sp-5` + `--line-1`, `--sp-3` + 2 × `--line-1`, `--sp-1`, `--w-glyph`), with a pointer to the CSS.
26. **Fixed**, apart from one point. Attribution follows resolved imports (exact paths, POSIX), and tags come from the AST (comments don't count). Still true: importing only a helper from a shared `.tsx` credits all its components. Peek stays its own screen.
27. **Fixed.** TypeScript lines are counted by `tools/gates/ts_measures.mjs` (the file-size gate's own measure). CSS lines are the non-blank lines left after removing `/* */` blocks. The program is built from `web/tsconfig.json`.
28. **Fixed** (the test's name).
29. **Fixed.** Esc collapses Compact's open row while no peek is open.
30. **Fixed.** The strip names steps only when the plan's length equals the run's step total.
31. **Not done** (nit): the optional props in Mark, Notice, Meter and Stepper, and Age's parse. Listed for W1+.
32. **Not done** (nit): a generic `Menu`, and `prefixOf` against `projectPrefix`. Listed for W1+.
33. **Partly.** The peek's close button is icon-only and named "Close peek". The rest is listed for W1+: two h1s on the ticket page, folded heads that aren't headings, the counters' aria-live, `/` while the peek is open, the static Send, and the double name on a Select option with a face.
34. **Fixed** (AGENTS.md, see 23).

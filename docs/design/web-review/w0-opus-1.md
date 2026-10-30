# W0 review, round 1 (Opus)

Commands run: `just check` (passes), `just gates` (**fails**, see 1), `npm --prefix web run test` (4 pass, about 1 s),
`npm --prefix web run shots` (14 pass, 7.5 s), `node web/tools/kit.mjs --check` / `--card`,
`node web/tools/count.mjs C:\code\AgentOS\web web`.

## must-fix

1. **must-fix**: `web/src/kit/ledger.json:2`. `just gates` fails right now: `4081 kit lines > 4077`. `Thread.module.css` changed (02:51) after the budget was set (ledger 02:44). The pre-commit hook runs `gates`, so this can't be committed, and CI would go red. Re-measure, and report the new number as the kit's budget.

2. **must-fix**: `web/tools/kit.mjs:43`. `readKit` only sees exports that are a `FunctionDeclaration`. A kit component written as `export const Foo = (p: FooProps) => …`, or as `memo(...)` or `forwardRef(...)`, is skipped without a word: no ledger entry needed, no prop cap, no reuse count, and it doesn't count toward the 25. The gate's job is to stop that kind of drift, and this is the most common React spelling. Fail on any PascalCase value export that isn't a function declaration, or resolve its call signature and treat it like one.

## should-fix

### The gates and the counter

3. **should-fix**: `web/tools/kit.mjs:54-61`. The ledger only sees top-level, string-literal variants.
   - Numeric variants are never checked: `Stack.gap` (`Space`), `Stack.cols` (2–5), `Text.weight`, `Text.truncate: 2`. Adding `cols: 6` or `weight: 700` needs no reason.
   - Neither are variants nested in item props: `Column.width` (13 `Width` values, `vars.ts:29`), `Segment.mark` and `Counter.mark` (`MarkKind`), `Step.state`, `Option.face`.

   A new width or column kind can land with no ledger line. Ledger number literals too, and walk at least one level into the array and object props.

4. **should-fix**: `web/tools/kit.mjs:85-105`. Reuse is counted per component, never per variant, so screen-specific code can hide inside a widely used component. Examples:
   - `Row.kind="band"` is used only by teams, and `item` and `tile` only by queue.
   - `Button.variant="lit"` is only intake's, `"accent"` and `Meter.size="strip"` only the ticket's.
   - `Head.level="zone"` and `"rack"` are only queue's.

   Some variants no screen uses at all: `Button.variant="outline"` (`Button.tsx:9`), `Text.tone="warn"` (`vars.ts:25`), `Select.look="box"` and `Menu.look="default"`. Each has a ledger reason, so nothing flags them. Report reuse per variant on the card, and flag variants with 0 or 1 users.

5. **should-fix**: `web/tools/kit.mjs:155-182` and `:131-140`. The budget lives in the same file as the entries, and nothing compares it with the base. A PR can raise `budget.lines`, `budget.components` or `budget.props` without the card or the check mentioning it. The quality baseline's `raises` rule exists to prevent exactly this. Show budget changes against `--base` on the card, and fail `--check --base` on an unexplained raise. The card also leaves out new or changed `single` reasons and removed entries.

6. **should-fix**: `web/eslint.config.js:34-45`. Screens may import `react-router`'s `Link`/`NavLink` and `@base-ui/react/*`. Each renders DOM elements without an intrinsic JSX tag, so the raw-tag gate never sees them and the kit's look is bypassed. A `<Link>` in a screen is an easy accident. Restrict `@base-ui/**` (and `react-dom`) in features and app, and allow only react-router's hooks there. Also, `tools/gates/common.py:12` gates raw tags only under `web/src/features/`. `app/` (and any `.tsx` in `api/`) can render raw tags with no gate, though "only kit renders elements" is the rule.

7. **should-fix**: `web/stylelint.config.mjs:4-34`. Raw values get back in through `calc`, unitless numbers and `color-mix`:
   - `calc(var(--fs-2) * 2.6)` (`Meter.module.css:81`)
   - `calc(var(--sp-2) + var(--line-1) / 4)` (`Stepper.module.css:189`)
   - `calc(var(--h-row) * 2 + var(--sp-7) * 2)` (`Row.module.css:192`)
   - `min(calc(var(--w-menu) * 2 + var(--sp-9)), …)` (`Dialog.module.css:4`)
   - unitless `stroke-width: 1.7` (`Icon.module.css:23`), which is a length in px
   - `color-mix(… 20%, transparent)` colours (`Button.module.css:78`, `Stepper.module.css:74`, `Mark.module.css:156`)
   - `"fill-wide": "minmax(0, 1.15fr)"` in TypeScript (`vars.ts:46`), where Stylelint can't see it

   None of these is a lint error today, so "Stylelint refuses raw values" holds only by letter. Either move them into tokens, or cap `calc` factors (for example `-1` and `2`) and list the allowed unitless properties. `color()` and units such as `lh`, `vmin` and `cq*` are also missing from the deny lists.

8. **should-fix**: `web/tools/count.mjs:35`. It counts the same way for both webs, but not the same scope. V1's whole `src` (about 20 features: settings, runs, workflows, auth…) is compared with V2's 5 screens. "screen TypeScript 14,848 vs 2,462" and "raw tags 964 vs 0" read as like for like when they aren't. Add a per-feature breakdown, or a `--features queue,compact,intake,peek,ticket` filter.
   - Smaller issue: `COMPONENT` (`:20`) counts `const TICK = (` (`Icon.tsx:14`) as a component.
   - Smaller issue: the `MARK_WORD|HUES|GLYPH_SLOT` exclusion (`:81`) is hard-coded to V1's names, not a rule.

### Correctness

9. **should-fix**: `web/src/features/queue/model.ts:53-58` vs `teams/TeamsView.tsx:117` and `compact/model.ts:51`. "Need you" has three definitions:
   - My queue counts blocked tickets that are mine or nobody's.
   - All teams and Compact's pill count only `groupOf === "needs_you"`.

   With these fixtures the top bars say "3 need you" on My queue and "2 need you" on All teams. Put one `needsYou(t, me)` in `domain/board.ts` and use it everywhere.

10. **should-fix**: `web/src/features/queue/model.ts:62` (`CAP.tiles`). If I have more than 5 running tickets, the sixth onwards vanish. The rack excludes mine (`:38`), and no "+N more" is drawn. Likewise `QueueView.tsx:374` uses `slice(0, 3)` (not `CAP.done`) while the head counts every done ticket, with no "+N". Use `Notice kind="more"`, as Intake does.

11. **should-fix**: `web/src/features/peek/Peek.tsx:146` and `ticket/TicketView.tsx:296`. An unknown key (`/t/NW-99`, `?peek=X`) makes `ticketOf` throw, and the query errors. Both screens ignore `error` and show "Loading" forever. My queue and All teams ignore `pending` and `error` from `useBoard` (`shared/board.ts:10-11`), so they draw "All clear · nothing needs you" while loading or after a failed read (`QueueView.tsx:287`). Compact handles pending but not error.

12. **should-fix**: `web/src/features/compact/model.ts:189`. A running ticket with `progress: null` (the type allows it) becomes `{done: 0, total: 0}`. That draws an empty meter and the text "0/0" (`CompactView.tsx:81-84`). Queue and Teams handle null correctly; use the same union here.

13. **should-fix**: `web/src/features/teams/TeamsView.tsx:179`. "Open list →" goes to `/compact?repo=…`, but Compact never reads `repo`, so the link shows every ticket. Implement the filter, or link somewhere that works.

14. **should-fix**: `web/src/features/ticket/TicketView.tsx:80-84`. Dispatch run is drawn with a bare `Button variant="accent"`, so `action.blocked` is ignored and a blocked dispatch shows as enabled (R11). Give `ActionButton` the accent case instead.

15. **should-fix**: `web/src/features/ticket/TicketView.tsx:265-266` and `:215`. The tab counts (`Runs 2`, `Context 4`) and the "The agent reads" list are literals in the screen. They aren't fixtures behind the data module, so the ticket page shows the same invented data for every ticket. Read them from the source, or leave them out until W5/W6.

16. **should-fix**: `web/src/kit/Dialog.tsx:21-25` with `features/peek/Peek.tsx:153-159`. When the URL drops `?peek` (the "Open" or "Open ticket →" links), the effect calls `d.close()`. That fires the `close` event, which runs `onClose`, and `setParams` pushes a second history entry for the same URL, so Back needs two presses. Call `onClose` only for a user close (`cancel`/Esc, or while `open` is still true), or close with `replace`.

### Types and boundaries

17. **should-fix**: `web/src/api/types.ts:80-86, :123, :128`. The types contradict `docs/api.md` (origin/docs/api, 7ebd5e8):
   - api.md names the board field `waiting_on`; the types use `attention: {kind: "waiting", on}`. The header says fields are "used as named".
   - api.md lists actions only on `GET /tickets/{key}`, not on board rows. `web-decisions-1.md` says api.md now puts them on rows, but it doesn't at that commit.
   - `Action` lacks the "only the owner may target their client" flag api.md names.
   - `ActionButton` (`shared/Actions.tsx:34-43`) never applies `role` for the viewer, though api.md says the web does.

   Either align the types, or update api.md and list the change in the report.

18. **should-fix**: `web/src/domain/format.ts:5-8`. `Iso = string` goes all the way in: `Date.parse` runs in `format.ts`, `queue/model.ts:10` and `compact/model.ts:57`. `minutesSince` guards the result with `Number.isFinite(d) ? … : 0`, a "just in case" check the core rule forbids. Parse timestamps once at the source (epoch ms or a branded type), and drop the guard.

19. **should-fix**: `web/src/kit/Button.tsx:11-23`. A button with no `children` and no `title` type-checks, and renders with no accessible name. Make icon-only a union member that requires `title` (or `label`).

### Accessibility

20. **should-fix**: `web/src/kit/Row.tsx:68-84, :119`. `onOpen` puts `role="button"` on the cell wrapper, which contains real buttons. My queue's Item has Request changes and Approve inside it (`QueueView.tsx:169`). A button's children are presentational, so screen readers flatten them, and the row's name is all of its text. Make the opener a real control (a button or link on the title cell, stretched over the row) rather than a role on the wrapper.

21. **should-fix**: `web/src/kit/Button.tsx:84-85`. `blocked` uses `disabled` plus `title`. A disabled button leaves the tab order, and the reason (R11) is only a hover tooltip, which keyboard and touch users never get. Use `aria-disabled` and keep it focusable, with the reason in an accessible description.

### Shared files and docs

22. **should-fix**: `.github/workflows/ci.yml:39-40`, `justfile` (`shots`). The screenshot tests are the web's tests by the ticket, but neither CI nor the hook runs them, and the baselines are `-win32` only. Run `just shots` on the Windows job (or add Linux baselines), or record in the report that they are manual.

23. **should-fix**: `AGENTS.md:11`. The change makes the docs wrong, and AGENTS.md says such a change updates them:
   - The prerequisites still say Python, uv, just, git and pwsh, but `just setup` and `just check` now need Node 24 and npm, and `shots` needs Chrome.
   - The layout table and the commands table don't mention `web/`, `dev-web` or `shots`.
   - `web/eslint.config.js:7` cites "web/AGENTS.md", which doesn't exist.
   - `tools/gates/ts_measures.py:3` and `tools/gates/test_pyfile.py:292` still say "no web yet".

## nit

24. **nit**: `web/src/kit/vars.ts:21`, `tokenPx`. Acceptable as an escape hatch, but `|| 0` turns a mistyped token name into a silent 0 offset. Throw instead: a missing token is a bug.

25. **nit**: `web/src/kit/Stepper.tsx:62-67`. The fit check's `8 / 11 / 2 / 81` mirror `--sp-4`, `--sp-5 + --line-1`, `--sp-1` and `--w-glyph` with no link to them. Acceptable for the spike, but name them after the tokens with a pointer to `Stepper.module.css:1-24`, so a CSS change shows where the numbers must follow. Icon's SVG coordinates and `vars()` (kit-only, not exported) are fine.

26. **nit**: `web/tools/kit.mjs:98`.
   - Shared attribution uses `text.includes("shared/Actions")`, so `shared/ActionsBar` would credit `Actions` too.
   - Nested shared paths use `\` on Windows and never match.
   - Importing only a pure helper from a shared `.tsx` credits all its components.
   - The tag regex (`:86`) also matches inside comments.
   - Peek counts as its own screen. That is honest, since it opens over any view, but it is how `Facts` reaches 2.

27. **nit**: `web/tools/kit.mjs:73`. Line counting treats CSS lines starting with `*` (`base.css:2-4`, the universal selector) as comments. It counts block-comment interiors that don't start with `*` (`tokens.css:2-8`) as code. `:33` builds its program without the project's tsconfig, so library-derived prop types would resolve to `any` and hide their props. Reuse `ts_measures.mjs`'s comment mask.

28. **nit**: `web/src/domain/board.test.ts:33`. "never at Done" doesn't hold in `board.ts:163`: an abandoned ticket whose rail stages are all done stops, crimson, at Done.

29. **nit**: `web/src/features/compact/CompactView.tsx:323-325`. The foot advertises "Esc Collapse", but nothing collapses on Esc (only the search field handles Escape, `Page.tsx:74`).

30. **nit**: `web/src/features/ticket/TicketView.tsx:172`. The run strip's step names are the plan items. They line up only because NW-17 has 5 of each; NW-19 (4 steps) would mislabel them.

31. **nit**: `web/src/kit/Mark.tsx:20-33`, `Notice.tsx:5-14`, `Meter.tsx:14`, `Stepper.tsx:34`. Optional soup: `ask`/`text` are ignored with `glyph`, `name` with `kind="you"`, `error` outside `status`, `names` outside `strip`, `compact` outside `steps`. `Badge`'s union shows the better pattern. Also, `Age.tsx:14` re-parses the screen's own string with a regex fallback. Pass the parts.

32. **nit**: `web/src/kit/Frame.tsx:82`. `id === "dark" ? "dark" : "light"` re-narrows because `Menu` is string-typed; make `Menu` generic over its ids. `domain/format.ts:46` `prefixOf` duplicates `kit/identity.ts:22` `projectPrefix` with different rules (trim, numeric suffix), and the footer chips and the key tints use different ones.

33. **nit**: small accessibility points:
   - Peek's close button is named "Esc" (`Peek.tsx:43-45`).
   - The ticket page has two `h1`s (`Page.tsx:120`, `TicketView.tsx:91`; the e2e works around it with `.first()`).
   - Folded group heads aren't headings (`Head.tsx:51-59`).
   - The counters are `aria-live` and re-announce on every keystroke of a search (`Page.tsx:86`).
   - `/` is swallowed while the modal peek makes the search inert (`Page.tsx:51-55`).
   - The composer's "Send" is a `span` (`Thread.tsx:53`).
   - A Select option with a face is named twice (`Select.tsx:29`).

34. **nit**: `justfile` `test`. Vitest runs in `just test`, but its time isn't under the speed gate (`tests/speed_gate.py` times pytest only). At about 1 s it is fine; note it in AGENTS.md's "under 10 s" line. The justfile, CI and `.gitignore` edits are otherwise small, on their own lines, and work under pwsh and sh.

**Verdict:** the spike is close. Fix the failing kit budget and the const-component hole in the ledger gate (must-fix). Then close the gate holes (variants, budget raises, router and Base UI imports, `calc` arithmetic) and the need-you inconsistency before the owner reviews it.

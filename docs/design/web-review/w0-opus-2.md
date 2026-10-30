# W0 review, round 2 (Opus)

Commands run, all passing: `just check`, `just test` (pytest, then Vitest: 4 tests), `just gates` (kit `25/25 components, 4081 lines, budget 4081`), `npm --prefix web run shots` (18 pass, 7.6 s), `node web/tools/kit.mjs --check` / `--card --base HEAD` / `--list`, and `count.mjs --features …`.

Probes, all in temporary files and since removed (`git status` and a hash of every file under `web/` match the state before the probes):
- **Kit components.** `export const ProbeMemo = memo(...)` and a const arrow component, exported from the index with no ledger entry. Both caught: no entry, over the component budget, over the line budget, and 0 screens.
- **Variants.** A new `Stack.cols` value (`6`) is caught. So is a new `Width` value (`huge`), and a new literal item prop on `Counter` (`size`). New `Step.state` and `StepGate.state` values (`paused`, `parked`) are **not** caught.
- **Budget raise.** Raising `budget.lines` to 5000 passes `--check --base HEAD`, because HEAD has no ledger. Against a dangling commit that holds the old ledger (made with a scratch index; unreachable, nothing else touched), the raise is caught, and the card shows it. A misspelt `--base origin/mian` passes without a word.
- **ESLint.** In a screen, the rules catch `@base-ui/react/select`, bare `@base-ui/react`, `react-dom`, `Link`, `NavLink as N` and `import * as RR from "react-router"`. In `src/app`, they catch `<section>` and `<p>`. `createElement("div")` passes; that's not a likely accident.
- **Stylelint**, in a probe `.module.css` file. `12px`, `#fff`, `1.2rem` and `calc(var(--sp-2) * 3)` are refused. `calc(var(--sp-2) * 2.6)`, `calc(7 * var(--sp-3))`, `* -1.5` and `/ 2.5` all pass.
- **Browser** (a temporary Playwright spec):
  - Peek, then "Open ticket →", then one Back lands on `/?peek=NW-17`. History grows by one entry per step.
  - Clicking Approve inside a row doesn't open the peek. Enter on the row's button does.
  - The rows' accessibility trees now list the cells' text and Request changes / Approve as separate buttons.
  - A blocked Button stays focusable, but its accessible name is "blocked Why it can't".
  - `elementFromPoint` on a row's titled cell returns the row's own button.

## Round-1 findings

| # | Finding | Verdict |
|---|---|---|
| 1 | Kit budget failing | Verified (4081, `just gates` passes) |
| 2 | Const, memo and forwardRef components skipped | Verified (probed) |
| 3 | Numeric and item-prop variants | Partly: numbers and array items verified by probes; object props aren't walked, so `Stepper.model`'s `Step.state` / `StepGate.state` (named in round 1) still need no reason. New finding 2. |
| 4 | Reuse per variant | Fixed in form; the list is mostly false. New finding 3. |
| 5 | Budget raises unexplained | Works in the hook (probed); a no-op in CI. New finding 1. |
| 6 | Link / Base UI / react-dom in screens; raw tags in `app/` | Verified (probed) |
| 7 | Raw values through `calc` / colour functions | Colours, `stroke-width` and units verified. The `calc` cap is wrong. New finding 4. |
| 8 | `count.mjs` scope | Verified (`--features` works, same rules both webs) |
| 9 | Three "need you" definitions | Verified (two named concepts; the naming change is in the report for the owner) |
| 10 | Tiles and done capped silently | Verified (`queue/model.ts:38`, `QueueView.tsx:359-364`) |
| 11 | Unknown key / errors / pending | Verified (`Peek.tsx:145`, `QueueView.tsx:405-408`, `ticket-missing` shot) |
| 12 | `progress: null` in Compact | Verified |
| 13 | `?repo=` ignored | Verified (`CompactView.tsx:315`, `compact-repo` shot) |
| 14 | Blocked Dispatch ignored | Verified (`Actions.tsx:59-71`) |
| 15 | Ticket tab counts as literals | Verified (`useItems`, `useRuns`) |
| 16 | Peek pushes two history entries | Verified in the browser |
| 17 | Types against `docs/api.md` | Acceptable to defer: `owner_only` is in; the shape question is the report's open question 1, for the lead and api.md's owner |
| 18 | ISO strings parsed inside | Acceptable to defer: the guard is gone; parsing at the edge belongs with W11's HTTP client, and the report says so |
| 19 | Icon-only button without a name | Verified (`Button.tsx:20-25`) |
| 20 | `role="button"` over real buttons | Verified in the browser; a regression, see new finding 5 |
| 21 | Blocked button leaves the tab order | Verified focusable; the name now carries the reason, see new finding 6 |
| 22 | Shots not in CI | Acceptable to defer: manual, and in the report as open question 2 |
| 23 | Docs out of date | Verified for AGENTS.md; see new finding 7 |
| 24 | `tokenPx` silent 0 | Verified |
| 25 | Stepper's magic numbers | Verified |
| 26 | Shared attribution | Verified (resolved paths, AST tags); a helper import crediting all of a module's components remains, acceptable |
| 27 | Kit line measure, tsconfig | Verified |
| 28 | Test name | Verified |
| 29 | Esc on Compact | Verified; see new finding 9 |
| 30 | Run strip names | Verified |
| 31 | Optional soup in Mark, Notice, Meter, Stepper | Acceptable to defer (nit, listed for W1+) |
| 32 | Generic Menu, two prefix helpers | Acceptable to defer (nit, listed) |
| 33 | Small accessibility points | Acceptable to defer (the close button's name is fixed; the rest is listed) |
| 34 | Vitest outside the timed gate | Verified (AGENTS.md) |

## New findings

1. **should-fix**: `justfile:39` and `web/tools/kit.mjs:182-193`.
   - The raise check is a no-op in CI. CI runs `just gates --base origin/main`, but the recipe passes `{{ args }}` only to `gates.py`, so `kit.mjs --check` compares with HEAD. On a PR, HEAD is the merge commit, which already holds the raised budget.
   - `ledgerAt` also turns any `git show` failure into "no ledger at the base". A misspelt or unfetched ref passes silently (probed with `origin/mian`).
   - Pass the base through, as the merge base like `gates.py` uses, and fail when the ref doesn't resolve. Keep "no ledger there" as the only quiet case.
   - The report says raises work "the way glance's work". Today that holds only in the hook.

2. **should-fix**: `web/tools/kit.mjs:57-66`. Only array props are walked. An object prop such as `Stepper.model`, with `stages[].state` and `stages[].gate.state` (`Stepper.tsx:11, 17`), isn't. A new stage or gate state is exactly the kind of variant the ledger exists for, and round 1 named `Step.state`. The probe adding `"paused"` and `"parked"` passed. Walk object-typed props too, and the arrays one level inside them. Otherwise, correct the report's "every component, prop and variant has a one-line reason".

3. **should-fix**: `web/tools/kit.mjs:141-154` (the card's "Variants set by 0 or 1 screens"). Only literal JSX attributes count, so most of the 65 lines are false:
   - All five `Row.edge` values and all three `Row.look` values are listed as "no screen sets it", though every Compact and My queue row sets them (`QueueView.tsx:153-154`, `CompactView.tsx:205-206`).
   - `Button.variant=you`, `ink` and `accent` are listed too, though `ActionButton` sets them.

   An owner reading the card would take these for dead variants, and real ones are lost in the noise. Take the attribute's type from the checker (its literal members) instead of requiring a literal, or label the list "set only by expressions or defaults".

4. **should-fix**: `web/stylelint.config.mjs:41`. The `calc` cap misses common forms:
   - The lookahead `2\b` accepts `2.6`, because `.` is a word boundary. So `calc(var(--fs-2) * 2.6)`, the very case round 1 cited, passes. So do `* -1.5` and `/ 2.5`.
   - A factor before the token isn't checked at all: `calc(7 * var(--sp-3))` passes.

   No kit CSS uses these today, but the report says Stylelint refuses `calc` factors other than `* 2`, `* -1` and `/ 2`. Use `(?!(?:-1|2)(?![\d.]))` and also refuse `\d\s*\*`.

5. **should-fix**: `web/src/kit/Row.module.css:75-82`. With `pointer-events: none` on the cells, nothing inside an opening row gets hover any more, so every `title` tooltip there is dead. That includes:
   - truncated titles (`QueueView.tsx:66, 72, 107`, `CompactView.tsx:221`, `TeamsView.tsx:84`);
   - the Stepper's full path;
   - Age's "full time on hover".

   The probe's `elementFromPoint` on a titled cell returned the row's button. The ledger gives "the full text on hover" as the reason for `Text.title` and `Age.title`, and on a truncated title it is the only way to read the rest. Text in rows can't be selected or copied either (a key, a branch). A fix that keeps the stretched button:
   - Put the opener on the title cell, stretched with `::after`, and leave the other cells hit-testable.
   - Or let `[title]` cells take pointer events and forward their clicks to the row's button.

6. **nit**: `web/src/kit/Button.tsx:82-84`. The reason span is inside the button, so it is part of the name as well as the description. The kit sheet's blocked button is named "blocked Why it can't", and a screen reader says the reason twice. An exact-name query (`getByRole("button", { name: "Approve", exact: true })`) would also miss it. Add `hidden` or `aria-hidden="true"` to the span (`aria-describedby` still reads hidden nodes), or move the span outside the button.

7. **nit**: `AGENTS.md:24, 48`.
   - The new `web/` row points to `docs/architecture.md`. Its only web line (`:10`) says "V1's web app until V2's API exists; then … a component kit (plan step 10)". It describes neither `src/kit` nor `src/features`, and W0 contradicts its order. Fine to leave for the owner's review, but the report should name it.
   - The `just gates` row doesn't mention the kit gate (ledger, budget, reuse).
   - Nothing says whether the ledger's `raises` entries are the owner's to add, as the baseline's are.

8. **nit**: `web/src/features/shared/Actions.tsx:65`. `useSession().data?.me?.role ?? "pending"` treats a session still loading as the role "pending". Against a real API, every action would show "Needs the writer role" until the session arrives. Draw nothing, or the server's state, until the session is known, rather than a reason that isn't true.

9. **nit**: `web/src/features/compact/CompactView.tsx:289-299`.
   - The Esc handler is on `document`, so Esc in the search field both clears the search (`Page.tsx:74`) and collapses the open row.
   - `collapse` is a new closure on every render, so the listener is re-added each render.

   Ignore events whose target is an input, or handle Esc on the row.

10. **nit**: `web/tools/kit.mjs:225, 262-265`. A budget key removed from `ledger.json` turns its check off without a word (`n > undefined` is false), and so does a renamed one. Fail when `budget.components`, `budget.props` or `budget.lines` is missing.

11. **nit**: `web/src/features/queue/model.ts:1`. The header still says "Needs you (incl. blocked tickets …)". The zone is now "Your move".

**Verdict:** no must-fix. The round-1 fixes hold in the code and in the browser. Before the owner reviews the spike, fix findings 1 to 5, or correct the report's claims about raises, variants and `calc`. The opener's dead tooltips (finding 5) are the one regression a user would notice. Deferring 17, 18, 22 and 31 to 33 is acceptable for a spike that stops for review.

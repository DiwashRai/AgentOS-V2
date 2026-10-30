# Web kit review — Codex, round 6

Reviewed the whole kit, its screen compositions, ledger and gate tooling at `32afe00` on `web-restyle`, including `kit-r5-fixes.md` and both findings in `kit-codex-5.md`. Source files were read only.

**0 must-fix, 2 should-fix, 0 nits.** Both previous Codex findings are fixed. Two substantive issues remain in nested dialogs and one use of the new Avatar flag.

## Findings

### 1. should-fix — Closing a nested editor also requests closure of its parent

**Location:** `web/src/kit/Dialog.tsx:144` (the native `onClose` handler); nested use at `web/src/kit/TextArea.tsx:75`.

The handler treats every close event reaching it as this dialog's own close. React propagates a nested dialog's close event to the ancestor handler, even though the native event has `bubbles: false`. The ancestor's `wanted.current` is still true, so it calls its screen's `onClose` too.

**Reproduction:** Open `/t/NW-17?edit=workflow`, edit Implement, change Name, then open Prompt in the whole window. Press Escape in Prompt, or click Done. Prompt closes, but the workflow immediately asks “Save your changes to NW-17's workflow?” and focuses Keep editing. Returning from the prompt editor should leave the workflow editor active without requesting its closure.

Chrome event capture confirms that the event target is the Prompt dialog; the workflow dialog remains natively open. This happens with both Escape and Done, so the remaining problem is the close event's ownership, rather than the new Escape keydown guard. When the outer screen has no changes, its callback can instead close that outer editor outright.

**Fix:** Accept a native close only when `event.target === event.currentTarget`, before consulting `wanted.current`. Keep the Escape prevention and its `defaultPrevented` check. Apply the same ownership rule to any native cancel handling that can receive descendant events. Add a browser regression covering both Done and Escape from a nested TextArea, asserting that the parent neither closes nor opens its close question.

### 2. should-fix — Avatar.beside removes the workflow author's full identity

**Location:** `web/src/features/library/list.tsx:201`; the flag's behavior is implemented at `web/src/kit/Avatar.tsx:52`.

ChangedCell now passes `beside`, but its neighboring text is `firstName(by.person.name)`, not the full name. The flag removes both the face's accessible name and its title, and the neighboring Text supplies no replacement title or full name.

On `/library/workflows`, the Standard row now exposes only “Bea” where the previous Avatar identified “Bea Quinn”. Chrome's accessibility tree contains no full author name, and neither the author text nor its face has a tooltip revealing it. The same applies to the other person-authored rows. A reader cannot establish the full author from this row, and people sharing a first name become indistinguishable to assistive technology.

**Fix:** Do not pass `beside` when only an abbreviated name is written next to the face. The smallest fix is to retain the named Avatar in ChangedCell. Alternatively, expose the full identity through the neighboring text and preserve its hover text before making the face decorative. The other reviewed uses with a complete adjacent name can keep `beside`.

## Round-5 accounting

| Previous Codex finding | Result |
|---|---|
| C1, bare gate named only “Gate:” | Fixed. The template interpolates the label; Chrome exposes `img "Gate: Plan sign-off"` on `/compact?open=NW-17`. |
| C2, unused project-colour helpers | Fixed. Both helpers are removed, and identity.ts's introduction describes faces and neutral project keys. |

The additional round-5 changes were checked against their notes and implementation. Repeated Escape alternates between asking and dismissing, restores focus to Name, and produces no native close events. Escape after a scrim click also restores Name; another Escape asks again with focus inside the question. An open Agent picker consumes Escape without asking to close the workflow, and the peek closes normally. Finding 1 covers the separate nested-dialog close event that remains.

The new Avatar union rejects `beside` on grouped or empty faces. Grouped faces keep their collective name while hiding their individual drawings. Complete adjacent names remain available in the account sheet, options, conversation, owner and library/editor compositions; finding 2 identifies the abbreviated-name exception. Mark's non-YOU named form now requires its name. The invalid Select edge, Lane's spoken gate prefix, decorative SVG handling, root ground fallback, ledger corrections and actual mergeProp order test agree with the fixes described. The documented side Dialog section contract and empty-lane dashed ring remain the previously acknowledged owner choices.

## Validation

- `npm run check` passes: TypeScript, ESLint, Stylelint and formatting.
- All **13 unit/tooling tests** pass.
- All **22 screenshot tests** pass against the existing Paper/Carbon baselines, using a temporary configuration for port 5231. No baselines were updated. The kit sheet was also visually inspected in both themes.
- `node tools/kit.mjs --check --base 13b95fc` passes: **40/40 components, 7,555 lines** (3,404 TS, 3,669 CSS, 482 token lines), within the unchanged 7,628-line/8-prop checkpoint.
- In-memory strict TypeScript probes accept the intended Avatar and named Mark forms and reject contradictory Avatar, Mark, Button and column combinations. Token scanning found no unused design tokens after accounting for dynamically constructed spacing and column references.

Source/API/CSS review found no further substantive issues. Browser probes and diagnostic artifacts changed no source files. Vite ran only on **5231**, was stopped, and the port has no listener. The tracked working tree remains clean.

Verdict: another round

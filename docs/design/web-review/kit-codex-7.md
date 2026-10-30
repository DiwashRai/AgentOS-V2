# Web kit review — Codex, round 7

Reviewed the whole kit, its screen compositions, ledger and gate tooling at `9e0670a` on `web-restyle`, against the review brief, `kit-r6-fixes.md` and every finding in `kit-codex-6.md`. Source files were read only.

**0 must-fix, 1 should-fix, 0 nits.** Both round-6 Codex findings are resolved. One additional public API case can leave an editor unusable.

## Findings

### 1. should-fix — An accepted boolean question leaves Dialog inert behind an empty alert

**Location:** `web/src/kit/Dialog.tsx:57`; the permissive prop is at `web/src/kit/Dialog.tsx:35`, and the corresponding opening-focus predicate is at `web/src/kit/Dialog.tsx:115`.

`ask` accepts any ReactNode, including the ordinary conditional-content pattern `ask={asking && <Question />}`. When `asking` is false, React renders no question content, but `hasAsk` evaluates to true because it excludes only null and undefined. Dialog therefore makes its editor inert and draws an empty modal alert over it. Returning from true to false leaves it in that state instead of restoring editing and focus.

**Evidence:** An in-memory strict TypeScript probe accepts `ask={false}`. A browser-mounted probe using the actual Dialog and Button modules confirms an empty alertdialog, an inert editor, and an editor button that cannot receive focus. Chrome's accessibility tree exposes only the outer dialog and its empty alertdialog, with no buttons. A stateful `asking && <Question />` probe remains blocked after clicking Keep editing to set `asking` back to false.

The existing screens use ternaries returning null, so their current fixture flows avoid this defect. The kit's declared API nevertheless permits this common composition without a type error, and its effect is substantially more than cosmetic.

**Fix:** Make the absence contract consistent with the accepted type. Prefer narrowing `ask` to a question element or null/undefined if boolean nodes are unsupported; the current screen compositions already satisfy that contract. Alternatively, treat React's empty boolean nodes as no question. In either case, align question rendering, inertness, focus restoration and the opening-focus predicate. Cover the false → question → false transition, or enforce rejection of the boolean form in a type check.

## Round-6 accounting

| Previous Codex finding | Result |
|---|---|
| C1, nested close also closes/questions its parent | Fixed. Both native close and cancel handlers check event ownership. Done and Escape were exercised in both clean and dirty workflow overlays: all four cases leave one open dialog, no close question, the same `edit=workflow` URL, and focus on the Prompt expansion button. Only Prompt emits a native close event. |
| C2, changed-by cell loses full identity | Fixed. ChangedCell retains its named Avatar. On `/library/workflows`, Chrome exposes `img "Bea Quinn"`, and the face's title also contains the full name. |

The other round-6 fixes hold. Four consecutive Escape keydowns, three repeated, leave the close question asked; releasing and pressing Escape again dismisses it and restores Name. An Agent picker consumes its Escape without questioning the parent. Empty `?peek=` opens no dialog. Compact's folding group heads are level-2 headings and high priorities have their spoken label. The ticket's Properties, Code and Workflow definition lists reference their visible heads.

The Now glyph is named Running once. The read-only stage lane exposes the agent's name through its text, its last-run state once, and the gate prefix; its decorative face adds no duplicate image name. ChipAfter accepts `agent: true` and rejects the removed string form, false, an empty after object, and a count combined with an agent. The remaining naming, ledger and private-export changes agree with the fixes described.

The brief's owner decisions were left closed: side Dialog sections by position, the empty-lane dashed ring, and FormRow/group nesting.

## Validation

- `npm run check` passes: TypeScript, ESLint, Stylelint and formatting.
- All **13 unit/tooling tests** pass.
- All **22 screenshot tests** pass against the committed Paper/Carbon baselines, using a temporary configuration pointing at port 5231. No baselines were updated. The kit sheet was also visually inspected in both themes.
- `node tools/kit.mjs --check --base 32afe00` passes: **40/40 components, 7,575 lines** (3,420 TS, 3,673 CSS, 482 token lines), within the unchanged 7,628-line/8-prop checkpoint.
- In-memory strict TypeScript probes also reject contradictory Avatar, Button, Mark and column forms. Token scanning found no unused design tokens after accounting for dynamically constructed references.
- Additional browser checks passed for switch keyboard operation, numeric range rejection and arrow stepping, sortable focus after reordering, and invalid-field descriptions in a popped-out TextArea.

The wider source/API/CSS review found no further substantive issues. Diagnostic probes changed no source files. Vite ran only on **5231**, was stopped, and the port has no listener. The tracked working tree remains clean.

Verdict: another round

# Web kit review — Codex, round 3

Reviewed `web-restyle` at `1e873bd`, covering the whole kit, its ledger and `web/tools/kit.mjs`. Findings: **1 must-fix, 4 should-fix, 2 nit**. The remaining work is substantive.

## Findings

### 1. must-fix — Sticky list headers cover the choice popup and intercept clicks

**Location:** `web/src/kit/choice.tsx:58`; `web/src/kit/Popover.module.css:8`; `web/src/kit/Table.module.css:53`.

On `/compact` at 1280×900, open the `+5` filter menu. The Needs-you header covers its search field, and the Blocked header covers the “Waiting on others” option. The popup positioner has `z-index: auto`, below the headers' `z-index: 2`. Chrome hit testing at the Waiting option's center returns the Blocked header; a real pointer click cannot select that option. This reproduces in Paper and Carbon. Mounting in a portal has not established a stacking order above the app.

**Fix:** Establish the shared popup positioner's stacking level above ordinary page content, using the kit's tokens. Apply the same policy to the account popover, and retain the existing dialog-local portal mounting. Verify pointer access to the filter input and every option over sticky headers, both outside and inside a modal.

### 2. should-fix — Segmented fits against the previous selection's width

**Location:** `web/src/kit/Segmented.tsx:89`; `web/src/kit/Segmented.tsx:110`; `web/src/kit/Segmented.tsx:201`.

The hidden ruler's last chip changes with `value`, but `useRoom` depends only on the labels/counts key and observes only the track. Selecting another item does not refresh `room.named`. Fitting then reserves the previous selection's width for the new overflow chip.

This affects the production filter: on `/compact` at 1200×900, open overflow, type “Waiting”, and select it with ArrowDown/Enter. The resulting “Waiting on others 2” chip extends **35px beyond** its 238px track and is clipped by `overflow: hidden`. At 1440px it extends about 11px beyond the track. A separate mounted-kit probe with a short initial selection and a longer overflow selection reproduced the same stale reservation.

**Fix:** Remeasure the selected ruler chip when its content changes, either through the measurement dependencies or by observing the relevant ruler geometry. Include other width-affecting item changes, such as marks. Keep the `fit` path free of measurement. Verify selection changes without requiring a window resize.

### 3. should-fix — Compare loses the information needed to understand a conflict without sight

**Location:** `web/src/kit/Compare.tsx:35`; `web/src/kit/Compare.tsx:44`; `web/src/kit/Compare.tsx:51`.

On `/library/agents/builder?still=conflict`, Chrome's accessibility tree exposes the two header texts and buttons, followed by one interleaved stream of both versions' lines. There are no row/column relationships associating a line with Yours or Bea's version. `changed` exists only as a CSS data attribute, and gaps are hidden, so neither changed lines nor missing counterparts are identified. For example, “Effort: high Effort: xhigh” arrives without a relationship identifying which side owns each value. The sighted comparison's essential information is missing when choosing which version to keep.

**Fix:** Give the comparison semantic row/column relationships with headers, or an equivalent accessible reading structure that identifies each side and line pair. Expose changed and missing-line states in accessible text as well as visually. Verify the actual accessibility tree on the existing conflict fixture.

### 4. should-fix — Dismissing the close question abandons editor focus

**Location:** `web/src/kit/Dialog.tsx:51`.

`Full` focuses the question's first button when `hasAsk` becomes true, but never restores focus when it becomes false. Reproduction on `/kit`: open the full-window overlay, press Escape, then choose Keep editing. `document.activeElement` becomes `body`; the next Tab restarts at the overlay's Close button. An editor opened deep in a workflow consequently loses its keyboard position when the user cancels closing it. The native outer dialog cannot restore focus for this inner, div-based question.

**Fix:** Preserve the editor's focused element before showing the question and restore it after dismissing the question while the outer dialog remains open. Use a sensible dialog-local fallback if that element was removed. Cover Keep editing and Escape dismissal, while retaining focus return to the outer opener when the entire dialog closes.

### 5. should-fix — Content inspection still determines layout across kit boundaries

**Location:** `web/src/kit/Facts.module.css:68`; `web/src/kit/Notice.module.css:113`; `web/src/kit/Table.module.css:50`.

The brief's prohibition on styling feature-supplied children by position or attribute is still violated:

- Facts removes padding only when its supplied value renders as a direct, sole `button`, and suppresses hover whenever any descendant is a button. Wrapping the same Select in a Stack changes its padding; changing a Button from an action to an anchor changes the treatment too. The `Fact` model does not declare that distinction.
- Notice shifts only a first-child `button`. The same action supplied as a Button with `href`, or inside a Stack, loses that alignment.
- Table makes feature-supplied direct children sticky by matching `[data-head="group"]`. An otherwise equivalent group wrapped in a Stack loses the behavior.

These are implicit DOM contracts, rather than presentation states declared by the components' APIs.

**Fix:** Make the padding/interaction treatment explicit in Facts' presentation model; put Notice's action alignment on a kit-owned slot; and let Head consume Table's scrolling context and style its own wrapper. Account for changed public fields in the ledger. Preserve the current production alignment and sticky behavior without inspecting supplied descendants.

### 6. nit — Stepper requires unused presentation data

**Location:** `web/src/kit/Stepper.tsx:27`.

`StepperModel.label` is required but never read; its top-level `round` is also unused. The component reads each stage's round and hardcodes the list name to “Workflow”. These fields survived the removed glyph presentation and make callers supply data the component ignores.

**Fix:** Narrow the kit's model to the fields Stepper consumes. Keep the domain model's label/round for the other callers that actually use them. This is API cleanup, not a request to remove those domain values.

### 7. nit — The inventory still contradicts current rendering

**Location:** `web/src/kit/ledger.json:42`; `web/src/kit/Avatar.tsx:34`; `web/src/kit/ledger.json:121`; `web/src/kit/ledger.json:851`.

The round-2 Avatar correction fixed the md entry and prop comment, but its component reason and function comment still call row/picker faces neutral. Button's size reason still says four heights although there are three sizes. Stepper.now still promises space alone and “no card”, while the component and stylesheet deliberately draw a bordered run card and ruled now row.

**Fix:** Update these reasons/comments to describe the existing rendering. These are negligible documentation details individually, but the round-2 inventory fix is only partial.

## Round-2 fix verification

The substantive round-2 repairs hold: a popped Prompt exposes both its help and validation error in Chrome's accessibility tree; its invalid state and focus return survive the pop-out. Segmented's Role group consumes the row description. Card's focused summary occupies its full box and is wholly visible at a 560px-high viewport. Ticket/peek draft holders are keyed by ticket. The sheet supplies Build's gate restriction, and Composer's label no longer contains Send.

In-memory TypeScript probes confirmed rejection of whole-track hug/min widths, combined count/person ChipAfter values, empty who values, and stage-only Card props assigned through a spread. An in-memory probe using the actual gate walker confirmed recursive merging of later nested fields and variants through a union intersected with common fields. No source files were changed for these probes.

## Validation

`npm run check`, all seven Vitest tests, and `node tools/kit.mjs --check --base HEAD^` pass. The gate reports **40/40 components, 7,322 lines: 3,193 TS, 3,655 CSS, 474 token lines**, within the unchanged 7,628-line/8-prop checkpoint. A token-reference scan found no unused candidates after accounting for dynamically constructed column names.

Chrome probes and screenshots covered Queue, Teams, Compact, Intake, the ticket, workflow editor, agent editor/conflict, and the kit sheet, with Paper and Carbon visual checks. Additional probes covered popup hit testing, responsive fitting, confirmation focus, prompt descriptions, and short-viewport Card focus. The full screenshot suite was not run and no baselines were updated. Vite ran only on port **5256** and has been stopped; the port has no listener.

Verdict: another round

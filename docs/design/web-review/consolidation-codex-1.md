# Consolidation review

Reviewed `7350393..f5c5943` on `web-restyle`, against `consolidation-brief.md`, `kit-budget-codex.md`, and the repository instructions. Findings below distinguish regressions from unfinished recommendations in the earlier review.

## Regressions

### 1. must-fix — Inline text areas collapse to the width of their contents

**Location:** `web/src/kit/Form.module.css:86`; `web/src/kit/TextArea.tsx:44`.

The new `.areaWrap` replaces the textarea as the flex item inside `FormRow.control`, but does not take the field's available width. Its child has `width: 100%` and content sizing, so the wrapper shrink-wraps the text instead. In Chrome at 1440 pixels, open Standard's Implement stage and replace Prompt with `abc`: the field becomes **49.4 pixels wide inside a 474-pixel control slot**. Clear it and it becomes **27 pixels wide**. The pop-out button then consumes almost the entire field. Editing short or empty prompts is substantially broken.

**Fix:** Give the wrapper the inline field's full-width sizing contract, while preserving its separate fill-height behavior. Verify empty, short and long values inside FormRow, ordinary Stacks and full-height editors.

### 2. must-fix — Waiting chips lose the person they are waiting on

**Location:** `web/src/features/compact/TicketLine.tsx:61`.

`chipWords` calculates `who` but omits it whenever `m.ask` exists. Compact's NW-9 now reads **“· Plan sign-off”**, losing Bea; NW-11 likewise loses Cy. This discards the information the waiting chip exists to convey. The retired Mark implementation included both the person and the ask.

**Fix:** Include `who` in the ask branch, retaining the special treatment for `you`. Cover a waiting-on-another-person row through the rendered seam.

### 3. must-fix — Clearing palette search with Escape also closes the workflow editor

**Location:** `web/src/kit/Field.tsx:32`.

The new search handler clears the query without cancelling Escape's native dialog action. Open `/t/NW-17?edit=workflow`, type `builder` in the Library search and press Escape: the query clears **and the workflow overlay closes**, returning the URL to `/t/NW-17`. With a dirty draft, the same action opens the unsaved-changes question. A search-clear action should not also attempt to leave the editor.

**Fix:** Consume Escape when the field handles clearing or blurring, including preventing the native default. Keep dialog dismissal available after focus has left the search field. Exercise both clean and dirty workflow overlays.

### 4. should-fix — Card activation covers the metadata tooltips

**Location:** `web/src/kit/Card.module.css:46`; `web/src/kit/Card.tsx:38`.

Applying the stage card's absolute, `z-index: 1` hit button to Queue and Teams puts it above all summary content. In Queue, hit-testing the run age, agent pill, owner's face, stage and progress text always returns the hit button. Their existing `title` values can no longer be hovered; users get only “Peek at …”. This loses the full owner name, precise elapsed time and truncated progress text. Row's previous delegated activation allowed those descendants to receive pointer events.

**Fix:** Preserve one named keyboard activation button while allowing summary content to receive hover events, for example with delegated pointer activation and appropriate exclusion of interactive descendants. Do not solve this by removing the metadata titles or by making the content ignore pointer events.

### 5. should-fix — Meter's default presentation now depends on an accidental containing block

**Location:** `web/src/kit/Meter.module.css:47`; `web/src/features/sheet/KitSheet.tsx:519`.

Moving absolute positioning from Row into `.tile` makes every default Meter `position: absolute; inset: auto 0 0`. The existing standalone Meter on `/kit` has no positioned card ancestor, so it leaves its section's flow and anchors to the initial containing block. In Queue it works only because Card's summary happens to be the nearest positioned ancestor. This replaces the old positional selector with another undocumented placement dependency.

**Fix:** Keep a standalone progress meter in normal flow, and let an explicit Card-owned edge/footer slot position its wrapper. Update the sheet to demonstrate the supported composition; changing only the sheet would leave the implicit dependency in the public API.

## Unfinished consolidation recommendations

### 6. should-fix — Form labels, help and validation still do not form one accessible contract

**Location:** `web/src/kit/FormRow.tsx:20`; `web/src/features/workflow/StageFields.tsx:133`.

FormRow only lost `data-setting`. Its visible label remains an `aria-hidden` span, controls still repeat their own labels, and help/errors have no programmatic relationship to the control. Set Implement's Prompt to `{{ verdict.note }}`: the error appears visually, but the textarea has no `aria-invalid`, `aria-describedby` or error-message association. StageFields still decides which field receives an error by `startsWith("The prompt")`. The earlier association/structured-issue recommendation was not implemented.

**Fix:** Introduce shared label/help/error IDs through the existing form family, associate the actual controls, and pass field-targeted validation issues rather than classifying prose. Preserve individual names in multi-control groups.

### 7. should-fix — Search remains duplicated, and the workflow palette still misses `/`

**Location:** `web/src/kit/Field.tsx:20`; `web/src/kit/Page.tsx:57`.

Field gained another search renderer and Escape handler, while Page retains its private input, chrome and shortcut listener. The `/` listener exists only while Page's private SearchField is mounted. The workflow editor has no Page.search, so `/` does not focus its new search field, although the sidebar Search button now finds it by input type. The recommendation was to share the control and make the active screen's focus target explicit; setting `type="search"` implements only part of that contract.

**Fix:** Share the search implementation and focus registration between Page and panel Field, and resolve shortcuts to the active screen/dialog's search rather than an unrelated mounted page underneath it.

### 8. should-fix — Card and Chip still admit the contradictory cases the review asked to exclude

**Location:** `web/src/kit/Card.tsx:15`; `web/src/kit/Chip.tsx:13`.

Card has one flat interface: `look="ticket"` accepts `open`, which is silently discarded; `off` is accepted but has no ticket treatment; stage-only `problem` is rendered for other looks. The original stage's required face also became optional for every case. Chip independently accepts both `lead` and `dot` and renders both, despite documenting them as alternatives. Eight prop names do not make these contracts well typed.

**Fix:** Model Card's presentation/interaction cases as a discriminated union, excluding irrelevant props, and type Chip's dot-versus-leading-artwork alternatives deliberately. Keep the same public components and budget.

### 9. should-fix — The single-choice popup still has two implementations

**Location:** `web/src/kit/Select.tsx:89`; `web/src/kit/Segmented.tsx:125`.

Menu was removed, but Segmented.More still owns a separate Base combobox root, identity lookup/comparison, change handling, portal, filter, empty state, list and indicator. This was explicitly part of the earlier merge recommendation. The theme merger eliminates one copy while leaving the remaining shared interaction duplicated.

**Fix:** Extract an internal choice-popup implementation used by Select and Segmented's overflow, retaining their different triggers, inline behavior and item content. This requires no additional public component.

### 10. should-fix — Composer exposes submission but not the requested controlled draft contract

**Location:** `web/src/kit/Composer.tsx:9`.

The extraction replaced the fake Send with a button, but `text` remains private kit state and is unconditionally cleared after invoking `onSend`. A feature cannot observe, seed, reset or retain its draft through the API. The earlier recommendation specifically required a controlled text/submit contract so ticket identity and draft decisions remain in the screen; the current interface does not provide it.

**Fix:** Accept controlled text and change props alongside submission, and keep draft ownership/clearing decisions in feature composition. W0 can supply local fixture state; no network send implementation is needed.

### 11. should-fix — Feature-child inspection survives, and Chip introduces another instance

**Location:** `web/src/kit/Row.module.css:170`; `web/src/kit/Chip.module.css:77`.

Row still adds spacing to the **last feature-supplied child of the first band cell**, implicitly identifying Teams' “Open list” link by position. Adding another child changes which element receives that treatment. New Chip CSS changes right padding whenever arbitrary `after` content has a direct child with `role="img"`. Wrapping the same Avatar, or adding a labelled Icon, changes pill geometry through accessibility markup. These are the same kinds of hidden contracts the consolidation was meant to remove.

**Fix:** Let the team composition express its own spacing using Stack. Give Chip a stable trailing-slot layout or explicit typed treatment; do not infer presentation from descendants' roles or order.

### 12. should-fix — A sheet-only pill variant was reintroduced during the dead-variant cleanup

**Location:** `web/src/kit/Chip.tsx:23`; `web/src/kit/Chip.module.css:27`; `web/src/features/sheet/KitSheet.tsx:458`.

`tone="strong"` is used only by the sheet's Bug example. Its ledger justification says “a ticket's type”, but production ticket types are plain Facts content in `ticket/properties.tsx`, not Chips. This recreates the exact “the sheet draws it, therefore keep it” inventory problem identified in the earlier review.

**Fix:** Remove the unused strong variant, its CSS and ledger value, and demonstrate a surviving form on the sheet. Retain it only with a concrete current product use.

### 13. should-fix — The other specifically requested type repairs remain open

**Locations and failures:**

- `web/src/kit/Button.tsx:15`: `href` and `onClick` are still independent optionals; supplying both silently discards the click callback in the anchor branch. **Fix:** use mutually exclusive link/click cases.
- `web/src/kit/Dialog.tsx:24`: `foot` is still accepted with `look="full"`, and `ask` with the side look; each is ignored. **Fix:** encode side/full prop cases in the type.
- `web/src/kit/Table.tsx:11`: Column still accepts contradictory `hug`, `min`, `give` and width modes, and `track` resolves them by precedence. **Fix:** model fixed, filling and hugging tracks as explicit cases.

These are unaddressed recommendations from the earlier component dispositions, not newly introduced regressions.

### 14. should-fix — Lane still owns the workflow's gate-eligibility rule

**Location:** `web/src/kit/Lane.tsx:85`.

Lane still determines whether a gate is allowed from loop position and authors the domain explanation “Gates go after a loop's last stage”. The earlier disposition explicitly required gate eligibility and its reason to arrive in the presentation model. This kit/domain coupling was not changed by adding the sortable gutter override.

**Fix:** Compute gate availability/reasons in the workflow feature and pass the resulting presentation state to Lane. Keep loop geometry and control rendering in the kit.

## Remaining smaller recommendations

### 15. nit — Sortable owns the gutter, but the screen still owns the extra reorder controls

**Location:** `web/src/features/library/content.tsx:53`; `web/src/kit/Sortable.tsx:132`.

The spacer Stack is gone, but AGENTS.md's BlockHead still builds Move up/down buttons in addition to Sortable's keyboard handle. The earlier recommendation to centralize a consistent reorder footprint is only partially implemented. **Fix:** put the pointer/keyboard alternatives in Sortable and remove the screen's duplicate control plumbing, preserving a pointer alternative to dragging.

### 16. nit — Segmented.fit still measures a layout that cannot overflow

**Location:** `web/src/kit/Segmented.tsx:184`.

`fit` still calls `useRoom`, installs its ResizeObserver and renders the hidden ruler before ignoring the result and showing every item. This remains unchanged from the earlier recommendation. **Fix:** make the fitting form bypass measurement and ruler rendering, using separate internal paths that preserve hook ordering.

### 17. nit — Deleted presentations left their private token inventory behind

**Location:** `web/src/kit/tokens.css:462`; `web/src/kit/tokens.css:580`.

The removed Row recipes and Stepper glyph left unused tokens including `--tile-agent`, `--tile-chip`, `--tile-chip-edge`, `--tile-dot-idle`, `--teams-badge`, `--teams-badge-edge`, the `--teams-face*` family, `--w-glyph`, and the tile-only face/glyph sizing tokens. These have no remaining `var(...)` consumers under `web/src`. The obsolete branches were deleted without finishing their token cleanup. **Fix:** remove the unreferenced declarations and their stale explanatory comments after checking the complete source tree.

### 18. nit — The ledger still describes retired behavior and misstates real uses

**Location:** `web/src/kit/ledger.json:56`; `web/src/kit/ledger.json:149`; `web/src/kit/ledger.json:451`; `web/src/kit/ledger.json:495`.

Avatar.lg still claims only the sheet draws it, although Frame's account popover uses it. Card's label/onOpen/off reasons still describe only stages despite the new ticket and agent callers. Head.group still names Intake's fold after Intake moved to line. Mark.name still describes its removed chip form. These are concrete inaccuracies in the owner's inventory checkpoint. **Fix:** audit the reasons against actual production and internal uses, including the new default/case behavior; do not treat the direct-import reuse counts as a complete census.

### 19. nit — Override keeps the stage-specific wording the earlier review asked to remove

**Location:** `web/src/kit/Override.tsx:14`.

The accessible name and title still hardcode “set on this stage over the agent's …”. The component remains tied to those domain nouns. **Fix:** use neutral replacement wording in the primitive, leaving stage/agent context in feature composition.

## Recommendation coverage and checks

| Earlier recommendation | Result in these commits |
|---|---|
| Remove unused Age, Button, Badge, Meter, Row and Stepper APIs/renderers | Listed APIs removed. Residual tokens: finding 17. New sheet-only Chip tone: finding 12. |
| Use Avatar.mid explicitly; retain internally used lg | Teams uses mid; Row's Avatar overrides removed. Ledger still wrong: finding 18. |
| Fold Menu into Select; share the popup with Segmented; reuse empty Avatar | Menu/export removed; theme and empty-face callers migrated. Remaining popup duplication: finding 9. |
| One pill across Badge/Chip/Mark; captions outside the kit | Old renderers/styles removed; caption moved to feature code with the regression in finding 2. API/child-contract gaps: findings 8 and 11. |
| Move Row tiles/board cards into Card with explicit interaction cases | Callers migrated; old descendant skins removed. Interaction typing, hover content and edge placement remain incomplete: findings 4, 5 and 8. |
| Explicit Page.side sizing, independent of FormRow descendants | Typed column/rail shape used at callers; content detection and data-setting signal removed. No additional Page variant introduced. |
| Head.line for Intake with folding and interactive summary | Intake migrated; native fold button exposes expanded state; Swap responds to data-row and keyboard focus. |
| Replace Stack's unused five-column form with responsive two-column layout | Replaced; observed two columns at a 614-pixel stage body and one at 306 pixels. |
| Field search and shared form/search associations | Partial: findings 3, 6 and 7. |
| Sortable owns its gutter and interaction footprint | Gutter moved into Sortable; Lane overrides its internal inset. Remaining feature controls: finding 15. |
| Independent Composer, real button, controlled draft/submit | Export and callers split from Thread; input/Send have names. Controlled draft remains missing: finding 10. |
| Tighten Button/Dialog/Table types; narrow Lane decisions; neutral Override wording | Not implemented: findings 13, 14 and 19. |
| Segmented.fit avoids measurement | Not implemented: finding 16. |
| Checklist density names when touching it; Icon geometry canonicalization where practical | Checklist was not touched. Icon only gained expand; geometry consolidation was not attempted. These conditional cleanups are not additional blockers here. |
| Retain the other distinct primitives without creating screen-specific exports | Compare, Drag, Drop, Facts, FormRow, Frame, Icon, Lane, Notice, NumberField, Override, Strip, Surface, Swap, Table, Tabs, Text and Toggle remain. Their specifically requested repairs are identified above. |
| Keep the 40-component/8-prop/7,628-line checkpoint; target at most 7,300 lines | Card reports **40/40 components; 7,110 lines: 2,911 TS, 3,650 CSS, 549 tokens**. No checkpoint increase. |

TypeScript, ESLint, Stylelint, Prettier check, four Vitest tests, and `kit.mjs --check --base 7350393` passed. Chrome checks exercised Queue, Compact, Intake, Teams in Paper/Carbon, the theme picker, workflow fields at two widths, text-area pop-out/return including a nested overlay, search Escape, prompt validation and Composer submission. Existing screenshot baselines were not updated; this is not a claim that the full screenshot suite passes. Vite used port 5256 and was stopped. No source, commit, stash or push changes were made.

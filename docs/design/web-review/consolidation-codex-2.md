# Consolidation review, round 2

Scope: `f5c5943..209457eb6298df20d78d3310376788727abdd47a`, checked against both round-1 reviews and `consolidation-r1-fixes.md`. No must-fix findings. Six should-fix findings and two nits remain.

## Findings

### 1. should-fix — Popping out a field loses its accessible help and error

**Location:** `web/src/kit/TextArea.tsx:44`; `web/src/kit/TextArea.tsx:79`.

The new description context supplies the inline and popped textareas with the same `aria-describedby` IDs. Those IDs identify FormRow's note/error outside the new native modal. Opening the pop-out makes that content inert. Chrome's accessibility tree then drops the popped textarea's description, although it retains `aria-invalid="true"`.

Reproduction: open Standard's Implement stage, enter `{{ verdict.note }}` in Prompt, and inspect the textbox's accessibility description. Inline, it includes both the template-field help and the unknown-field error. Pop it out: after focus reaches the textarea, its accessibility description is absent. The invalid value is announced without the explanation needed to correct it. C6 is therefore only partially resolved; the new association fails in the long-text editing mode.

**Fix:** Render the applicable help/error inside the active pop-out and associate that textarea with IDs belonging to those copies. Carry the description content through an explicit internal contract rather than reading it back from arbitrary DOM descendants. Verify the computed accessible description in both inline and nested modal editing.

### 2. should-fix — The walker merges literal values but discards nested fields from later union cases

**Location:** `web/tools/kit.mjs:84`.

The new merge spreads `old` and combines only `vocab` and `values`. It never combines `p.items`. Consequently, repeated object-valued fields retain only the first case's nested requirements. An in-memory TypeScript probe using the actual walker demonstrated this for both a union and that union intersected with common fields:

```ts
type Outer =
  | { kind: "a"; settings: { look: "plain" } }
  | { kind: "b"; settings: { look: "filled" } };
```

The result contains `kind = ["a", "b"]`, but `settings.look = ["plain"]` only. The gate cannot require a ledger reason for `filled`; a later branch's distinct nested field is likewise omitted. This contradicts the patch's claim that every case's values are retained. The current Table width/min discovery works, but does not validate the general union merge.

**Fix:** Merge nested item metadata recursively, including values at repeated nested keys. Use a consistent merge for the corresponding top-level prop aggregation in `readKit`. Add meaningful walker/gate cases proving that omitting a later branch's nested variant or field fails ledger validation, including an intersection case. Do not merely change which branch wins.

### 3. should-fix — Segmented's actual form buttons do not consume the description context

**Location:** `web/src/kit/Segmented.tsx:161`; `web/src/kit/Segmented.tsx:187`.

The C6 fix connects Field, TextArea, Toggle, NumberField and Choice, but misses Segmented's inline buttons. Standard's Implement stage uses `Segmented fit` for Role inside a FormRow whose note explains Maker versus Check. Neither the Maker/Check buttons nor their immediate group has that note's description association. A FormRow problem would also fail to mark this control invalid. Overflow uses Choice and consumes the context, making the same control's description behavior depend on its presentation.

**Fix:** Apply the shared description/validity contract to Segmented's inline group or controls, consistently with its overflow trigger. Verify the Role explanation and a FormRow error through accessible relationships, without restoring measurement to the fit path.

### 4. should-fix — Column's new cases still accept widths that generate invalid CSS tracks

**Location:** `web/src/kit/Table.tsx:14`; `web/src/kit/Table.tsx:33`.

The cases now exclude contradictory mode flags, but still use the entire `Width` vocabulary in positions that require a length. `Width` includes complete track expressions such as `fill` and `fit`. These assignments pass the project's strict TypeScript configuration:

```ts
const a: Column = { label: "A", width: "fill", hug: true };
const b: Column = { label: "B", width: "fill", min: "fill" };
```

They produce `fit-content(minmax(0, 1fr))` and `minmax(minmax(0, 1fr), 1fr)`, respectively. Chrome rejects both as `grid-template-columns`. The type repair therefore still permits a column configuration that invalidates the table's grid declaration.

**Fix:** Restrict the hug/give widths and fill minimum to tokens that resolve to valid lengths in those positions. Keep whole-track expressions available only where the whole track accepts them. Extend the ledger/walker accounting as needed rather than hiding the narrower cases from the gate.

### 5. should-fix — ChipAfter's two forms are not mutually exclusive

**Location:** `web/src/kit/Chip.tsx:19`.

The new trailing-content union lacks a discriminant or `never` exclusions. TypeScript accepts both a `ChipAfter` value and a direct JSX argument containing all three fields:

```tsx
<Chip label="Build" after={{ text: "3/5", agent: "Builder", face: null }} />
```

`After` takes its `"text" in after` branch and silently discards the agent/face fields. The lead-versus-dot union was repaired, but the newly introduced count-versus-person union recreates the same contradictory-props problem from C8/O S7.

**Fix:** Make the trailing forms exclusive, using a discriminant or explicit `never` fields on the opposite case. Check rejection of the combined form as well as acceptance of both supported forms.

### 6. should-fix — Card's stage-only fields remain accepted through prop spreads

**Location:** `web/src/kit/Card.tsx:39`.

The agent/ticket cases omit stage-only fields instead of forbidding them. Excess-property checks catch a direct literal, but normal object assignment and JSX spreading still accept the contradictory case:

```tsx
const props = {
  look: "ticket" as const,
  label: "Ticket",
  onOpen: () => {},
  face: "ignored",
  open: "ignored",
  problem: "ignored",
};
<Card {...props}>Ticket</Card>;
```

This passes strict TypeScript, and `caseOf` discards the stage-only values. Ticket `off` is similarly accepted through a spread. This leaves C8's silent-discard failure available through the prop-spreading style already used throughout the features. Button, Dialog and Column correctly use explicit exclusions for their corresponding alternatives.

**Fix:** Add `never` exclusions for known props belonging to the other Card cases, including ticket `off`. Verify assignment/spread rejection, not just excess-property checks on fresh literals. No additional prop names are needed.

### 7. nit — The kit sheet was not migrated to Lane's new gate-eligibility contract

**Location:** `web/src/features/sheet/KitSheet.tsx:313`.

LaneSheet declares the Build–Check loop but supplies no `noGate` for Build. Since Lane now correctly delegates this rule to its caller, the sheet exposes an enabled “Add a gate after Build” button inside that loop. Clicking it creates the forbidden interior gate. Before the extraction, this empty diamond was inert. The production editor supplies the new value; this fixture caller was missed.

**Fix:** Give the sheet's Build stage the appropriate explicit eligibility/reason value and retain a separate deliberate invalid-gate example where needed. Keep the workflow rule outside Lane.

### 8. nit — Avatar's ledger and API comments still contradict its default rendering

**Location:** `web/src/kit/ledger.json:42`; `web/src/kit/ledger.json:54`; `web/src/kit/Avatar.tsx:12`.

The lg reason was corrected, but the ledger still describes md as a **neutral 20px** face and says rows/pickers use neutral discs. The API comment repeats that md is neutral. `.md` actually uses the person's `--id-row` hue and `--h-face`, currently **18px** (`Avatar.module.css:26`, `tokens.css:522`). The general seed reason also omits these colored row/picker faces. C18/O S9's inventory audit remains incomplete.

**Fix:** Describe the actual md size and identity coloring consistently in the ledger and API comments; retain the existing rendering unless a deliberate visual change is authorized.

## Round-1 fix accounting

| Round-1 findings | Result of this review |
|---|---|
| C1; O N5 wrapper/fill/focus/scrollbar concerns | Short Prompt measured 474px in its 474px slot. Wrapper/fill classes are separate. Pop-out textarea receives focus after the animation frame and returns to its opener. New description failure: finding 1. |
| C2; O M1/N3 | Waiting chips retain Bea/Cy and the ask; the running tooltip includes its step count. The three model tests pass. |
| C3; O S4 | Escape clears then blurs search while the workflow overlay and its URL remain open. |
| C4; O S1/N1 | Delegated pointer activation leaves text/tooltips under the pointer; clicking the title opens Peek. Named keyboard buttons remain. Header comments updated. |
| C5; O M2 | Default Meter is a static 48px inline track on the sheet. Queue explicitly chooses edge; its placement precondition is documented. The originally suggested Card-owned slot was not implemented; the explicit edge presentation resolves the accidental-default regression. |
| O S2 | Queue card height measured 134.375px; filled repo chip/glyph and live agent disc restored. The amended comment describes the current agent/face arrangement. |
| O S3 | Teams' empty lane uses Notice and has its own inset; no positional child rule was restored. |
| C6 | Typed prompt/gate issues and inline descriptions/invalid state implemented. Remaining gaps: findings 1 and 3. |
| C7/C9; O S5 | Page and palette use Field search; overlay `/` focuses Search agents. Choice is shared by Select and overflow. Theme/filter selection and focus return exercised. |
| C8; O S7 | Lead/dot exclusion implemented. Card and new trailing-content types still have holes: findings 5 and 6. Select.icon's acknowledged nit was explicitly deferred. |
| C10; O N2 | Composer is controlled by its feature, clicking the label wrapper can focus its textarea, and W0 retains the draft after Ctrl+Enter. |
| C11; O S8 | Role-based Chip padding and Row's last-child rule removed. Sortable's gutter is an explicit prop, avoiding inherited overrides. |
| C12 | Sheet-only strong tone and its CSS/ledger value removed. |
| C13 | Button link/click and Dialog side/full exclusions implemented. Column flag exclusions implemented, with the length/track hole in finding 4. Walker merge remains incomplete: finding 2. |
| C14 | Gate eligibility/reason moved to the workflow model; production editor supplies it. Sheet migration gap: finding 7. |
| C15; O N8 | Move buttons and glyph baseline were explicitly left as-is in the fix notes. The owner's move-button alternative is not reopened here. |
| C16/C19 | Fit uses a separate path without ruler/measurement; Override wording is neutral. |
| C17; O S6 | Removed Mark.text, edgeOf/Edge and unused tokens. A source scan found no remaining unreferenced token candidates after accounting for dynamically constructed column names. |
| C18; O S9 | Previously identified Card, Chip, Head, Mark and lg reasons updated. Remaining Avatar inaccuracies: finding 8. |
| O N4/N6/N7/N9/N10 | Line note is inside the fold; keyboard fold/Swap exercised. Two-column layout measured two tracks at 614px and one at 306px. Chip glyph override removed, theme-name weight restored, empty Thread returns null. |

## Verification

TypeScript, ESLint, Stylelint, Prettier check, seven Vitest tests and `kit.mjs --check --base HEAD^` pass. The gate measures **40/40 components, 7,234 lines: 3,113 TS, 3,647 CSS, 474 tokens**, within the unchanged 7,628-line/8-prop checkpoint. This differs from the 7,212 figure in the commit message.

Chrome probes covered the changed controls, modal search, prompt validation/pop-out, Queue activation, theme/filter choices, Intake fold/Swap, responsive form columns and the sheet's Meter/Lane. The description failure was confirmed using Chrome's accessibility tree, rather than only checking ARIA attributes. Type and walker probes used in-memory compiler inputs; no source files were changed. The full screenshot suite was not run and no snapshots were updated. Vite ran on port 5256 and was stopped.

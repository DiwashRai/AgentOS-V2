# Web kit review — Codex, round 4

Reviewed the whole kit, its ledger and tooling at `fb8f3e4` on `web-restyle`, including every round-3 Codex finding and the changes described in `kit-r3-fixes.md`.

**0 must-fix, 2 should-fix, 1 nit.** The remaining editor regression and discarded content are substantive.

## Findings

### 1. should-fix — Page's new measure wrapper collapses the filling editors

**Location:** `web/src/kit/Page.tsx:112`; `web/src/kit/Page.module.css:160`.

The new kit-owned `.measure` element breaks the flex chain between the split Page body and its content. It is a plain block with no growth, so the item editor's `Stack grow` no longer fills the column. Its `TextArea fill` collapses to the minimum height instead.

On `/library/agents/builder` at 1440×900, Instructions is **80px high**, ending at y=293, although the body extends to y=892. Most of the editing column is blank and only a few lines of the instructions are visible. The skill editor has the same problem. This contradicts TextArea.fill's contract and the item editor's documented behavior.

A DOM-only probe making `.measure` a growing flex column increased the same textarea from **80px to 614.8px**, without changing the feature or TextArea. The wrapper introduced for Opus S9 therefore needs its layout behavior completed.

**Fix:** Preserve the available-height/flex relationship through the kit-owned measure wrapper, including the rail editor's growing content, while retaining the ticket's reading width and scrolling behavior. Verify the standalone agent/skill/file editors and the shared item editor inside a ticket overlay. The current screenshot suite does not cover these editors.

### 2. should-fix — Several variant APIs still accept content that rendering discards

**Location:** `web/src/kit/Notice.tsx:33`; `web/src/kit/Notice.tsx:114`; `web/src/kit/Mark.tsx:43`; `web/src/kit/Mark.tsx:78`; `web/src/kit/Facts.tsx:12`; `web/src/kit/Facts.tsx:37`.

The union work is incomplete in two of Opus S6's cases and introduces another silent drop in Facts. These assignments all pass the project's strict TypeScript options:

```tsx
const empty: NoticeProps = {
  kind: "empty", lead: "All quiet", fix: "Try reloading",
};
const you: MarkProps = { kind: "you", name: "Sign off the plan" };
const picker: Fact = {
  label: "Owner", picker: "Ada", note: "Needs approval",
};
```

A mounted-kit browser probe renders only `All quiet`, `YOU`, and the Owner/Ada fact. None of the supplied fix, name or note appears:

- Notice combines `empty` and `problem` in one type case with `fix`, but only the problem branch renders it. The updated ledger explicitly promises a fix for an empty line, making this a broken supported state, not just an overly broad type.
- Named Mark still accepts `name` with `kind="you"`, then suppresses it. This was explicitly identified in Opus S6 and was not resolved by separating glyph and named forms.
- Fact puts `note` in the common fields, but its picker branch returns before rendering the note. The ledger also describes quiet words after a picker/value.

**Fix:** Render the content where it is supported, or exclude it from that variant and align the ledger with the resulting contract. Split the empty/problem cases if their capabilities differ; make the named YOU case exclude `name`; and either render a picker's note or forbid it in that case. Verify both valid forms and rejection of contradictory assignments, including spreads. No additional prop names are necessary.

### 3. nit — The ledger module's introductory comment contains literal newline escapes

**Location:** `web/tools/ledger.mjs:1`.

The introduction is one long comment containing literal PowerShell `` `n `` sequences between its intended lines. It is harmless at runtime but makes the new module's explanation harder to read.

**Fix:** Replace those sequences with actual LF newlines.

## Round-3 accounting

Every numbered Codex finding was checked:

| Finding | Result |
|---|---|
| C1, popup stacking | Fixed. The shared positioner has the popup stacking class. Chrome hit testing reaches every overflow option over Compact's sticky headers in Paper and Carbon; a pointer can select Waiting on others. Frame's account positioner uses the same class. |
| C2, stale overflow width | Fixed. The measurement key includes selection and marks. At 1200px and 1440px, choosing Waiting on others no longer clips the selected chip. Fit still bypasses measurement. |
| C3, Compare semantics | Fixed. Chrome exposes the comparison as a table, with two column headers, paired cells and rows, changed-line words and a named missing-line cell. |
| C4, dismissing the close question | Fixed. Both Keep editing and Escape return focus to the same Prompt textarea in the workflow overlay. |
| C5, Facts/Notice/Table content inspection | The production compositions now use the explicit picker, fix and more models. Facts no longer sniffs its content, and Head owns sticky positioning through Table's context. The new picker's note handling needs finding 2. |
| C6, unused Stepper model fields | Fixed. The kit model contains stages, live and closed; the domain retains the other fields for its own consumers. |
| C7, inaccurate inventory | The identified Avatar, Button size and Stepper.now explanations were corrected. |

The other round-3 changes were reviewed too. The new Button and Avatar exclusions, glyph/ask exclusion, Notice.more alignment exclusion, and Fact picker/value exclusion reject contradictory values in in-memory compiler probes. The remaining union holes are finding 2. Row's inert look variants and the unused width/give cases are gone. The description helper, decorative filter glyphs, Override's accessible replacement words, Composer padding, popup stacking and shared opener implementations are consistent with the fixes. Keyboard reordering retained focus; a popped invalid Prompt retained its help/error description and returned focus to its opener.

The changed response to Opus S9's **side Dialog** is acceptable as a documented structural section contract: the direct rendered roots are explicitly its sections, rather than arbitrary content being inspected for control types. The stable native modal is retained, and the existing peek still has three separately padded sections with the last rule omitted. I am not reopening that documented choice. Page and Lane's kit-owned wrappers are appropriate; Page's height regression is finding 1.

## Validation

- `npm run check` passes: TypeScript, ESLint, Stylelint and formatting.
- All **12 unit/tooling tests** pass, including the five new ledger tests.
- All **18 screenshot tests** pass against the refreshed baselines, using the existing test file with a temporary configuration pointing at port 5231. No snapshots were updated. These tests do not cover the library editors affected by finding 1.
- `node tools/kit.mjs --check --base 1e873bd` passes: **40/40 components, 7,522 lines** (3,353 TS, 3,689 CSS, 480 token lines), within the unchanged 7,628-line/8-prop checkpoint.
- A token-reference scan found no unused candidates after accounting for dynamically constructed column tokens.

Chrome probes and Paper/Carbon visual checks covered the main screens, workflow editor, agent and skill editors, conflict comparison, peek and kit controls. Compiler and isolated rendering probes changed no source files. Vite ran only on **5231**, was stopped with its child processes, and the port has no listener. The repository's tracked working tree remains clean.

Verdict: another round

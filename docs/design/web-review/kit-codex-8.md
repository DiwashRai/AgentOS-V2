# Web kit review — Codex, round 8

Restarted from current HEAD **`29fb1db`** on `web-restyle`. Reviewed the whole kit, its screen compositions, ledger and gate tooling against the brief, `kit-codex-7.md`, `kit-r7-fixes.md` and `kit-r8-fixes.md`. The current HEAD also includes round 9, so `kit-r9-fixes.md` and those changes were reviewed too. The previous review's Vite was stopped before starting this run. Source files were read only.

**0 must-fix, 0 should-fix, 1 nit.** The previous substantive finding is resolved. What remains is negligible and does not block the kit.

## Findings

### 1. nit — False settings content marks a Card expanded

**Location:** `web/src/kit/Card.tsx:83`; the permissive content type is at `web/src/kit/Card.tsx:32`.

Card's settings slot accepts ReactNode, including false from `open={selected && <Settings />}`, but its presence check excludes only undefined and null. An isolated browser probe at this HEAD renders `open={false}` as `button "Close Plan" [expanded]`, sets `data-open="true"`, and draws an empty settings body despite having no settings content.

The existing stage compositions use an element or undefined, so current screens avoid this case. The card remains operable; this is a small API/state consistency nit, without the editor-blocking effect of the former Dialog issue.

**Fix:** Treat boolean empty nodes as absent when computing the card's expansion, or exclude booleans from the settings-slot type. Use that same computed state for the body, opener wording and expanded attribute.

## Previous-finding accounting

**Round-7 Codex C1, boolean question makes the editor inert: fixed.** Round 7 rejected boolean question elements; the current contract goes further: `ask?: DialogAsk | undefined`, with required question words and an actions slot. Strict in-memory TypeScript probes reject boolean, JSX-element and null asks, accept DialogAsk and undefined, and reject a shape without its question. The absence checks consistently use undefined. The current screens and kit sheet obey that contract.

Dialog now owns its question's h2, note and action layout. Chrome exposes “Save your changes to NW-17's workflow?” with description “Closing now loses them.”, using valid labelled-by/described-by references and no fallback aria-label. Keep editing receives focus. The kit sheet's corresponding question and description also work and were visually inspected in Paper and Carbon. The former heading query and DOM mutation are gone.

The round-7 Mark change also holds: glyph names are required, string or false, and an omitted name fails strict TypeScript. Call sites explicitly choose their semantics; the state words live in the domain. The subsequent bookend correction removes Done, Abandoned and Inbox images from My queue while retaining its written state. Status Notice rejects lead, Strip describes its path in words, and Sortable's polite live region is outside its list; keyboard reordering preserves focus.

The round-8 overflow fix holds on `/compact?f=done`: Chrome exposes `combobox "5 more filters"` with the selected Done recently value. Choice requires its trigger name. The theme combobox is named Theme with value Paper, and selecting Carbon updates both the theme and its exposed value. Segmented observes both the track and ruler, covering changes in the chips' intrinsic widths. Run-line text and its state-name decision now come from one `whereOf` result.

Focus and closing checks passed against the current implementation:

- Done and Escape from a popped-out Prompt, in both clean and dirty workflow overlays, leave the parent open with no close question and restore focus to the Prompt expansion button.
- A held Escape asks once; a fresh Escape dismisses the question and restores Name.
- On the kit sheet, activating Close by keyboard or mouse and choosing Keep editing restores Close. Opening the sheet and pressing Escape twice restores the dialog itself.
- Full author identity remains available in ChangedCell; Chrome exposes Bea Quinn and the full-name tooltip.

The brief's owner decisions remain closed: side Dialog sections by position, the empty-lane dashed ring, and group roles for single controls/sidebar sections.

## Validation

- `npm run check` passes: TypeScript, ESLint, Stylelint and formatting.
- All **13 unit/tooling tests** pass.
- All **22 screenshot tests** pass against the committed Paper/Carbon baselines, through a temporary configuration pointing at port 5231. No baselines were updated.
- `node tools/kit.mjs --check --base ccc6f25` passes: **40/40 components, 7,607 lines** (3,435 TS, 3,690 CSS, 482 token lines), within the unchanged 7,628-line/8-prop checkpoint.
- Additional strict contract probes pass for the new DialogAsk and Mark forms. Token scanning found no unused design tokens after accounting for dynamically constructed references. Popped-out TextArea retains its invalid state and descriptions.

The wider source/API/CSS review found no further substantive issues. Diagnostic probes changed no source files. Vite ran only on **5231**, was stopped, and the port has no listener. The tracked working tree remains clean.

Verdict: done

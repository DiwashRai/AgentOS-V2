# Web kit review — Codex, round 5

Reviewed the whole kit, ledger, gate tooling and screen compositions at `13b95fc` on `web-restyle`, including `kit-r4-fixes.md` and every finding in `kit-codex-4.md`.

**0 must-fix, 0 should-fix, 2 nits.** The previous substantive findings are resolved. What remains is negligible.

## Findings

### 1. nit — A bare gate's accessible name omits its label

**Location:** `web/src/kit/Stepper.tsx:94`.

The new Knot uses the literal accessible name `Gate:` without interpolating `g.label`. On `/compact?open=NW-17`, Chrome's accessibility snapshot consequently shows `img "Gate:"` for the Plan gate.

Chrome still exposes `Plan sign-off` as the image's accessible **description**, from `title`, so the gate's identity remains available. This is a small naming correction rather than a loss of the underlying information.

**Fix:** Append `g.label` to the accessible name after the Gate prefix, retaining the existing distinction between bare and captioned gates.

### 2. nit — Unused project-colour helpers remain after keys became neutral

**Location:** `web/src/kit/identity.ts:22`; `web/src/kit/identity.ts:29`.

`projectPrefix` and `keyHue` have no consumers; the latter only calls the former. The module introduction still describes coloured project keys, while Badge draws keys in neutral ink. Avatar is the sole consumer of identity colouring and uses `hueOf` directly.

**Fix:** Remove the two unused helpers and update the introduction to describe the remaining face-colour behavior. Keep the existing face hashing and initials behavior.

## Round-4 accounting

| Codex finding | Result |
|---|---|
| C1, collapsed filling editors | Fixed. Instructions on `/library/agents/builder` and SKILL.md on `/library/skills/ticket` each measure **614.8px** high at 1440×900. The ticket's shared item editor also fills its overlay. The new skill-editor screenshot guards this layout. |
| C2, discarded variant content | Fixed. In-memory strict TypeScript probes reject `Notice` empty/fix and named YOU/name combinations, while accepting a named glyph and a picker's note. A mounted Facts probe confirms that the picker's note is actually rendered. The ledger agrees with the chosen contracts. |
| C3, corrupt ledger introduction | Fixed. The introduction is ordinary comment lines with real newlines. |

The other round-4 fixes also hold. Escape on the close question returns focus to the previously edited field in both workflow and item overlays. The workflow probe records one cancel event to open the question and **no close event** when Escape dismisses it; the native modal remains open. The owner picker inherits the fact row's type, the Theme icon has its own styled wrapper, and the undefined list mask was removed.

The shared hidden-text rule preserves Compare's accessible structure: Chrome exposes two column headers, 17 rows and the missing-line cell on the conflict fixture in both Paper and Carbon. The new vocabulary aggregation retains both Width and Length; probes using the actual walker accept either union order. The documented side Dialog section contract remains the previously accepted owner-checkpoint item; no new component-budget approval is needed for these findings.

## Validation

- `npm run check` passes: TypeScript, ESLint, Stylelint and formatting.
- All **13 unit/tooling tests** pass.
- All **22 screenshot tests** pass against the committed Paper/Carbon baselines, including the new skill and workflow editor states. A temporary configuration pointed the existing suite at port 5231; no baselines were updated.
- `node tools/kit.mjs --check --base fb8f3e4` passes: **40/40 components, 7,548 lines** (3,400 TS, 3,667 CSS, 481 token lines), within the unchanged 7,628-line/8-prop checkpoint.
- Token scans found no unused design tokens after accounting for dynamically constructed column names. Source searches confirmed the unused helper pair in finding 2.

Browser checks covered standalone and overlay editors, confirmation focus/events, compact gates, conflict accessibility, and picker notes, alongside the screenshot suite's main screens and kit sheet. Source/API/CSS review found no further substantive issues. Diagnostic probes changed no source files. Vite ran only on **5231**, was stopped with its child processes, and the port has no listener. The tracked working tree remains clean.

Verdict: done

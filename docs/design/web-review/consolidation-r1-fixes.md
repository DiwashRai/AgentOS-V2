# Consolidation, review round 1: what was done with each finding

Reviews: `consolidation-opus-1.md` (O) and `consolidation-codex-1.md` (C). All the fixes are in one commit after `f5c5943`. Each one was checked in Chrome (`r1-probe.mjs` in the session scratchpad), and `just check`, `just test` and `just gates` pass.

## Must-fix

- **C1, collapsing text areas: fixed.** `.areaWrap` takes the slot's width (`flex: 1 1 100%`, `width: 100%`). A filling area's wrapper has its own class, so the textarea's `field-sizing`/`resize` class no longer lands on the div (O N5). A short prompt is now 474px wide; it was 49.
- **C2 / O M1, the waiting chip lost who it waits on: fixed.**
  - `chipWords` moved to `compact/model.ts`. It reads "Bea · Plan sign-off", and falls back to the state's word when no name is given.
  - A Vitest file covers the three cases.
  - The chip's title keeps the step count (O N3).
- **C3 / O S4, Esc in the library search closed the overlay: fixed.** Search's Esc calls `preventDefault` and `stopPropagation` whether it clears the field or leaves it. Checked: the overlay stays open, and the URL keeps `?edit=workflow`.
- **O M2 / C5, a tile Meter pinned to the viewport: fixed.**
  - The default size is `row`, in normal flow.
  - The agent card's track is an explicit `size="edge"`, documented as needing an agent Card, which is its containing block.
  - The kit sheet's Meter is back in its section.
  - I didn't take the Card-owned `progress` slot, because it would make Card's ninth prop name across its cases, and the prop budget is the owner's to raise.

## Should-fix

- **O S1 / C4, Card's button covered its lines: fixed.** It now follows Row's pattern: one real button, visually hidden, with the focus ring round the card. The pointer click is delegated from the summary (jsx-a11y's presentation pattern), and skips clicks on the card's own controls and the end of a text selection. Checked: the title is under the pointer, the agent pill's tooltip shows, and a click on the title opens the peek.
- **O S2, the agent pill lost its look, and the cards grew: fixed.**
  - Chip's `after` is typed: `{ text }`, or `{ agent, face }`. For the second form Chip draws the agent glyph on its live disc and the face itself.
  - The top lines are wrapped in one growing Stack, so there's no extra gap.
  - The repo chip is filled again, with the repo glyph.
- **O S3, "Nothing in flight" lost its inset: fixed.** It is now a `Notice kind="empty"`.
- **O S5 / C7, two search implementations, and `/` missing in overlays: fixed.**
  - Field's `search` is the kit's one search box: glyph, text and `/` keycap.
  - Page's bar uses it inside a width slot.
  - `/` and the sidebar's Search both reach the top layer's search through `kit/search.ts`. Checked: `/` in the ticket's workflow overlay focuses "Search agents".
- **O S6 / C17, dead code: fixed.**
  - 45 unreferenced tokens are removed. The column widths stay, because `--col-*` is built in a template.
  - `Mark.text` is removed.
  - `edgeOf` and `Edge` are removed from `domain/board.ts`, and `kit.mjs`'s example is updated.
- **O S7 / C8, Chip and Card admitted contradictory props: fixed.**
  - Chip takes a glyph or a dot, never both, with the glyph typed as `IconName`.
  - Card is a union by look: `face`, `open` and `problem` exist only on stage, and `off` on stage and agent.
  - Select's `icon` outside the side look is still a nit, and left as it is.
- **O S8 / C11, hidden contracts: fixed.**
  - Chip's `:has([role=img])` is replaced by the typed `after` and `data-who`.
  - `--sortable-gutter` is replaced by a `gutter` prop that Lane passes.
  - Card's `.main > *` rule is gone.
  - Row's rule on the board's first cell `> :last-child` is gone: All teams lays out its team cell with Stacks.
- **O S9 / C18, the ledger's reasons: fixed.** These were rewritten: Card, Chip (no "default" dot, no "still Mark glyph", and `strong` removed), Mark.name, Stack.cols, Composer, Meter, Avatar.lg, Head.group, Field.search, Override and Lane.stages.
- **C6, form labels, help and errors weren't tied to their controls: fixed.**
  - FormRow's label is visible and names the group (`aria-labelledby`).
  - Its note and problem describe the controls in it, and its problem marks them invalid. That runs through an internal context that Field, TextArea, Toggle, NumberField and Select's trigger read.
  - Stage problems are typed `{ field: "prompt" | "gate", text }`, with no more guessing from the sentence. Checked: the Prompt textarea has `aria-invalid` and is described by its problem.
- **C9, the popup still had two implementations: fixed.** `kit/choice.tsx` is the one internal single-choice popup, and Select and Segmented's overflow both use it.
- **C10, Composer wasn't controlled: fixed.** It takes `value`, `onChange` and `onSend`; the screens hold the draft. W0 is static, so Send keeps the draft. Its wrapper is a `<label>` again (O N2).
- **C12, a pill variant only the sheet used: fixed.** `Chip.tone="strong"` is removed.
- **C13, loose types: fixed.**
  - Button is a click or a link, never both.
  - Dialog's `foot` belongs to the side look only and `ask` to the full look only.
  - Table's column is a fixed, hug, give or fill-with-`min` track, exactly one.
  - `kit.mjs` now reads intersections and merges a field declared differently across a union's cases, so it sees the column's fields again. That makes the gate stricter, not looser.
- **C14, Lane decided gate eligibility: fixed.** A stage's `noGate` is the screen's: the workflow model's `noGateAfter` decides it. Lane keeps only the loop geometry.

## Nits

- **Fixed:**
  - O N1: stale comments in Card's header and tokens.
  - O N4 and N6: Head's line note now sits in the fold, with the chevron at the inset; `cols={2}` is two columns at most, falling to one.
  - O N7 and N9: the chip glyph is back to its own size, and theme names are at weight 500.
  - O N10: an empty Thread draws nothing.
  - C16 and C19: Segmented's fit form no longer measures; Override's wording is neutral ("xhigh, replacing high").
- **Left as is:**
  - O N8: the card glyph's baseline sits about 2px off.
  - C15: AGENTS.md's move-up and move-down buttons stay as the owner's click alternative to dragging.

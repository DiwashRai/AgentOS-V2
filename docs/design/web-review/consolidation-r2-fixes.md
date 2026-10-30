# Consolidation, review round 2: what was done with each finding

Reviews: `consolidation-opus-2.md` (O) and `consolidation-codex-2.md` (C). Neither found a must-fix. This was the last round allowed, so these fixes were checked in Chrome (`r2-probe.mjs`) and by the gates, not re-reviewed.

## Should-fix

- **O S1, Tab showed only a card's corner: fixed.** The card's button is the summary's whole box again: `inset: 0`, unseen (`opacity: 0`), and out of the pointer's way (`pointer-events: none`). Focusing it brings the whole card into view. Checked at a 560px window: Review's card sits at 441 to 553.
- **O S2, a draft followed you to the next ticket: fixed.** Talk and the peek's reply are keyed by the ticket. Checked: NW-17's draft is gone on NW-19.
- **C1, the popped-out area lost its help and error: fixed.** FormRow's context now also carries its words. The popped area draws its own copies under it and is described by those, because the row's are inert under the modal. Checked: it is `aria-invalid` and described by both the help and the error.
- **C2, the walker dropped nested fields from later cases: fixed.** One recursive `mergeProp` is used at every level, top-level props included. It keeps the first vocabulary, every value and every nested field. Intersections are walked only when every part is a kit shape (O N6).
- **C3 / O N7, Segmented ignored its row's description: fixed.** Its group, in both the fit and measured forms, takes the row's description and validity. Checked: Role is described by its note.
- **C4, a column could name a whole track where a length goes: fixed.** A `Length` vocabulary (every Width except `fill` and `fit`) types the hug and give widths and the fill column's floor. It has its own reasons in the ledger, and the gate checks it.
- **C5 / O N3, Chip's trailing forms weren't exclusive: fixed.** It takes `{ text }`, or `{ agent, face? }`, or `{ face }`, each excluding the others' fields. A "who" with no one can't be written.
- **C6, Card's other looks accepted stage props through a spread: fixed.** The agent and ticket cases declare `face`, `open` and `problem` as `never`, and ticket also `off`.

## Nits

- **Fixed:**
  - O N1: the dead `title` on the card's button is gone.
  - O N2: Composer's label wraps only the text, with Send beside it.
  - O N4 / C7: the kit sheet's lane says the gate rule for Build.
  - O N5: `noGateAfter` is built on the same `span` as the problems.
  - O N9: FormRow's contract, Head's note and reason, and the edge Meter's containing block are now in the ledger.
  - O N10: the theme sheet's comment is fixed and the dead `--ring` removed.
  - C8: Avatar's md is now described as 18px, in the person's hue.
- **Left:**
  - O N8: one search per layer is now written in Field's reason.
  - O N10: the empty-lane Notice's dashed ring.
- **Line count:** the kit is 7,322 lines at this commit, within its 7,628 budget. The round-1 note's 7,212 was measured before the last round-1 edits; the correct figure there was 7,234.

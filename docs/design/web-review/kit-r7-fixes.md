# Kit review round 7: what was fixed

From `kit-opus-7.md` (0 must, 1 should, 7 nits) and `kit-codex-7.md` (0 must, 1 should).

## Should
- **Opus S1: a glyph said its state beside words that said it again, the third time this class came back.** The cause was the default, so it's gone. A glyph Mark's `name` is required, `string | false`: the state's word where the glyph is the only sign, `false` where the words beside it say the state. The words moved out of the kit to the domain (`STATE_WORD` in `domain/board.ts`). Every glyph call site now chooses:
  - `false`: My queue's four zone heads and agent cards, All teams' legend, and All teams' blocked, queued and your-move cards (their chip says the state).
  - A name: All teams' running and waiting cards (their chip names who), Compact's run line and title cell, and the kit sheet.
  - Decided by its words: a run line's glyph (`whereSaysState`: a gate stop or the state's word says it, a running stage's name doesn't) and a stage line's glyph (`endSaysState`: a verdict, "running" or "pending").
  - Probes: My queue's heads read "Your move 3", "Agents at work 6", "Ready to start 1", "Done recently 3". The agent cards have no state image. All teams' only state images are the 4 running and 2 waiting cards.
- **Codex 1: `ask={false}` left the editor inert behind an empty question.** `ask` is `ReactElement | null`, so a boolean can't be written, and the checks read `ask != null`. The current screens already pass an element or null.

## Nits
- **N1:** the Now glyph's "Running" stays; with the required name it is the explicit choice.
- **N2:** the question is named by its own heading (`aria-labelledby`, which takes precedence over the "Close …?" fallback label). Probe: "Save your changes to NW-17's workflow?". This lives in the `showAsk` helper, with `giveBack` beside it, which keeps Full's effect under the complexity gate.
- **N3:** Strip's name reads in words ("Plan (plan), then gate: Plan sign-off, then Implement (build) …").
- **N4:** the sidebar's Search is "Search (/)".
- **N5:** a status Notice takes no `lead` (`lead?: never`), and its dead `.status > b` rule is gone. The ledger's lead reason says what each form draws.
- **N6:** Sortable's live region is the list's sibling, not its child.
- **N7:** goes to the owner with N8 (a sidebar section's group named by its one button).

The round-6 behaviour was re-probed: Esc ×2 dismisses the question to Name, and a nested Esc leaves one dialog with nothing asked.

Still the owner's call: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and the group role for a single control (FormRow, a sidebar section).

Checks, test, gates and all 22 screenshots pass, with no visual change. Kit: 40/40 components, 7,573 of 7,628 lines.

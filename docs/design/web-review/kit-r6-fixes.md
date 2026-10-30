# Kit review round 6: what was fixed

From `kit-opus-6.md` (1 must, 1 should, 11 nits) and `kit-codex-6.md` (0 must, 2 should).

## Must
- **Opus M1 / Codex 1: a nested dialog's close closed, or asked to close, the dialog around it.** React hands a nested `<dialog>`'s `cancel` and `close` to the ancestor's handlers. Dialog now acts only on its own (`e.target === e.currentTarget`). Probe: Done and Esc in a popped-out Prompt, in a clean and a dirty workflow overlay. In all four cases the overlay stays open (1 dialog), nothing is asked, the URL keeps `edit=workflow`, and focus is back on "Edit Prompt in the whole window".

## Should
- **Codex 2: the changed-by cell.** It writes only the first name, so its face keeps its full name (no `beside`).
- **Opus S1: names said twice, five more places.**
  - A stage card's face is `beside`, since the card writes the agent's name.
  - A stage's last run glyph is `name={false}`, since its words start with the state. `LastRun.word` is gone.
  - The run detail's starter face is `beside`.
  - The Now line's glyph is named "Running".
  - An agent chip's glyph is named "agent", because the chip's words are the screen's. `ChipAfter.agent` is now `true`, not the unused name.
  - Probes: `img "Running"` then "Builder · run #42 · …"; the stage card reads "Plan Done Maker Planner · …" with no face name.

## Nits
- **N1:** a held Esc asks once (`!e.repeat`); repeats are still prevented. Probe: four keydowns, three of them repeats, leave the question asked.
- **N2:** while editing, the gate name is `aria-hidden` (the toggle says it); read-only it keeps its unseen "Gate: ". This is now the `GateName` helper, which keeps Joint under the complexity gate.
- **N3:** ledger words: IconName.normal, Avatar.size.sm, the your-move accent (MarkKind.you, the Stepper gate's waiting and you, Mark's CSS comment), Dialog.children for both looks. Page.title already said "a pair".
- **N4:** the Meter is named "2 of 5 steps done".
- **N5:** the full Dialog's close is "Close (Esc)".
- **N6:** a folding Head's button is inside its `h2` (the disclosure pattern; the `h2` is `display: contents` with the head's font). Probe: Compact's heads are level-2 headings. Intake's screenshots are unchanged.
- **N7, half:** each Facts `dl` is labelled by its head (Properties, Code, Workflow). The screen's visible words that repeat a term ("Opened", the Workflow row) are the design's, so they're left.
- **N8:** not changed, and put to the owner with round 4's N8. Whether a FormRow needs a `group` role for a single control, and so whether Segmented's group inside one is a group in a group.
- **N9:** Compact's high and low priority bars are named ("High priority"); normal stays decorative.
- **N10:** an empty `?peek=` is no peek. Probe: no dialog opens.
- **N11:** `HUES` and `Hue` are no longer exported.

Still the owner's call: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and N8.

Checks, test, gates and all 22 screenshots pass, with no visual change. Kit: 40/40 components, 7,574 of 7,628 lines.

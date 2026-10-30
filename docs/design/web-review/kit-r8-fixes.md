# Kit review round 8: what was fixed

From `kit-opus-8.md` (0 must, 2 should, 3 nits). Codex's round 8 stopped partway, when it hit its usage limit, so no `kit-codex-8.md` was written. Codex reviews these fixes as its round 8.

## Should
- **S1: the overflow chip had no name while the pressed filter was in it.** It is always named ("5 more filters"); a combobox's content is its value. `ChoiceProps.trigger.name` is required. Probe on `/compact?f=done`: `combobox "5 more filters"`.
- **S2: the question's name came from a DOM query for a heading.** The kit draws the question itself: `ask` is `DialogAsk { question; note?; actions } | null`. Full renders the question as an `h2` (the alertdialog's `aria-labelledby`), the note as a `p` (its `aria-describedby`), and the actions under them. The kit no longer queries or mutates the screen's markup, and no `aria-label` fallback is left. `SaveAsk` is now `saveAsk()`, returning words and three buttons, and the kit sheet passes the same shape. Probes: "Save your changes to NW-17's workflow?" / "Closing now loses them.", and the kit sheet's "Discard your changes?" / "Closing now loses them.". Focus is on Keep editing in both.

## Nits
- **N1:** on a bookend (Inbox, Done, Closed) a line's title glyph is `name={false}`, since the stage chip says the state. Probe: no Done, Abandoned or Inbox images on My queue.
- **N2:** one `whereOf(r, w)` returns `{ text, saysState }`, so the run line's words and its glyph's name can't disagree.
- **N3:** Full records focus only inside its view, so dismissing the question never sends focus to the close button that `showModal()` landed on. Probe: the kit sheet's Esc, Esc ends on the dialog.

The round-6 and round-7 behaviour was re-probed: Esc dismisses to Name, and a nested Esc leaves one dialog with nothing asked.

Still the owner's call: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and the group role for a single control.

Checks, test, gates and all 22 screenshots pass, with no visual change. Kit: 40/40 components, 7,602 of 7,628 lines.

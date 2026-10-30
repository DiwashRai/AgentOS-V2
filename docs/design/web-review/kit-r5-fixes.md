# Kit review round 5: what was fixed

From `kit-opus-5.md` (0 must, 4 should, 9 nits) and `kit-codex-5.md` (0 must, 0 should, 2 nits; "Verdict: done").

## Should
- **S1 / Codex 1: a bare gate named "Gate:".** The label is interpolated, a PowerShell edit had eaten it. Probe: `img "Gate: Plan sign-off"`.
- **S2: Esc and the close question, every way in.** The `<dialog>` owns Esc (`onKeyDown`): it prevents the keydown, so the browser's non-cancelable close request never happens, wherever focus is. It skips a keydown already prevented, which leaves a popup's or a nested dialog's Esc to them. The scrim's handler is gone. A re-show doesn't focus the dialog while it asks. Probes:
  - Esc ×3: asked, dismissed (focus on Name), asked again (focus in the question), with 0 `close` events.
  - A click on the scrim, then Esc: dismissed, focus on Name, 0 closes.
  - Esc in an open picker in the overlay: the listbox closes and no question is asked.
  - The peek still closes on Esc.
- **S3: names said twice.**
  - Compact's group heads pass `name={false}`; probe: "Needs you 2".
  - Avatar has a `beside` flag on its one-face form: the name is written beside it, so the face is `aria-hidden`. It is used in Select's options, Thread, the account sheet, the peek's owner, Intake's assignee, the agent list, item history, the changed-by cell and the library panel.
  - A row of faces hides each face, since the row names them together.
  - Probe: `option "Ada Park"`, and Thread's "Bea Quinn" once. Avatar goes to 6 props (the cap is 8).
- **S4: the ledger, from the CSS.** MarkKind's eight glyphs; Text display (24px); IconName tick and close; Stepper skipped; Badge sm; Meter row.

## Nits
- **N1:** the rewraps are reflowed as sentences. One-word tails were reworded, and tokens.css's long comments are fixed by hand, keeping the header's paragraphs.
- **N2:** `mergeProp` moved into `ledger.mjs`. The order test merges `Width` and `Length` in both orders through it.
- **N3:** `--ground: var(--page)` once on `:root`; `.surface` no longer sets a default.
- **N4:** Select's field look takes the invalid edge.
- **N5:** Lane's read-only gate name is preceded by unseen "Gate: ".
- **N6:** an Icon's `svg` is `aria-hidden` in both branches.
- **N7:** a named Mark other than YOU requires `name`, and so does the domain's `MarkModel`. Compact's `chipWords` loses its dead state-word fallback, and its test now covers "Your move" with no ask.
- **N8:** RowProps.children says that a cell past the columns isn't drawn.
- **N9:** the screenshot states' comment names both editors.
- **Codex 2:** `projectPrefix` and `keyHue` are deleted; identity.ts's header describes faces only.

Still the owner's call: Dialog's side sections by position (a component slot at 40/40), and the empty lane's dashed ring on All teams.

Checks, test, gates and all 22 screenshots pass, with no visual change. Kit: 40/40 components, 7,555 of 7,628 lines.

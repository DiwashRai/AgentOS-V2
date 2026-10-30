# Kit review round 9: what was fixed

From `kit-opus-9.md`: 0 must, 0 should, 4 nits, "Verdict: done". The four nits are folded in here.

- **N1:** Full records focus on the whole frame again and forgets it when focus moves to the dialog itself. That keeps round 8's N3 (focus that `showModal()` gives the close never sticks) and gives a close the person reached its focus back. Probes on the kit sheet:
  - The close by Tab and Enter, then Keep editing, ends on "Close (Esc)".
  - The close by mouse, then Keep editing, ends on "Close (Esc)".
  - Esc, Esc ends on the dialog.
  - The workflow overlay's Esc, Esc ends on Name.
- **N2:** the sidebar's theme row is named "Theme", and its visible label is `aria-hidden`. Probe: `combobox "Theme": Paper`.
- **N3:** Segmented also observes its ruler, so a change in the chips' own widths re-fits the bar.
- **N4:** no question is spelled one way, `ask?: DialogAsk | undefined`; both overlays and the kit sheet pass `undefined`.

Re-probed: a nested Esc leaves one dialog with nothing asked.

Checks, test, gates and all 22 screenshots pass, with no visual change. Kit: 40/40 components, 7,607 of 7,628 lines.

## Codex round 8 (Verdict: done)
- **Nit:** Card's `open` is `ReactElement | undefined`, so a card is open only with settings to show (`open={false}` can't be written). Checks, test, gates and screenshots pass.

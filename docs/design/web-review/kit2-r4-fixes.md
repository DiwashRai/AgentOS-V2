# Kit 2, round 4: what was fixed

From `kit2-codex-4.md` (2 should-fix) and `kit2-opus-4.md` (1 should-fix, 3 nits).

## Should-fix
- **Codex 1 and Opus nit 1, a toast raised from a mount effect was dropped:** the separate toast manager is gone. `Raising`, inside the provider, raises through Base UI's own context manager, which is ready before any effect under it runs.
- **Codex 2, an effect raising as the question opens skipped the queue:** the held flag is set in `Raising`'s layout effect, which runs before any passive effect under it. It is still read when a toast is raised, so a callback taken earlier still waits.
  - Probed at the seam with `k9-probe.mjs`: a full Dialog with the app's own React and kit.
    - A child's mount effect shows "Mount result".
    - An effect that fires as the question opens, and a callback taken before it, both wait. Nothing shows while the question is asked, even with the clock run 8 s.
    - Answering shows both, and both are in the AX tree.
- **Opus 1, a dialog's toasts outlived it:** Dialog keys its Toasts by its opening. A closed dialog's toasts, and any still waiting on its question, go with it.
  - Probe (`k10-probe.mjs`): "Copied NW-17" in NW-17's peek, then Esc and opening NW-14's peek, shows no toast.

## Nits
- **Opus 2, the tokens check skipped the colour blocks:** it compares blocks that share a selector, not only plain `:root`. A theme's own block, under its own selector, still overrides on purpose. There is a new test for the shared colour selector, and the check passes on tokens.css.
- **Opus 3, a picker's tip came back after Esc:** the shared choice popup (Select, Segmented's overflow) marks its button `data-tip-rest` as Menu's does. Tips looks for the rest on the focused element or an ancestor, so the Facts "Owner" tip around the picker stays quiet too.
  - Probe: on the ticket page, Esc out of Owner leaves no tip, and Tab then Shift+Tab brings it back.

Checks, 17 web tests, gates and 22 screenshots pass. Kit: 43/45 components, 8,249 of 9,000 lines.

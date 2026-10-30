# Kit 2, round 3: what was fixed

From `kit2-codex-3.md` (1 should-fix) and `kit2-opus-3.md` (1 should-fix, 2 nits).

## Should-fix
- **Codex 1 and Opus nit 1, a toast raised while a dialog asks is lost to screen readers:** each Toasts region now has its own manager, and `useToast` raises through it.
  - While a dialog asks, a raised toast waits in a queue. It is added (shown, announced, and started on its own time) once the question is answered. The flag is read when the toast is raised, so a copy that finishes later still waits.
  - The region stays inert while held, so Tab and F6 still can't leave the question.
  - Probed at the seam with `k7-probe.mjs`: a full Dialog asking, its child raising "Held result", rendered with the app's own React and kit. While asking, it is in neither the DOM nor the AX tree. With the clock run 8 s and the question answered, it shows in the dialog and the AX tree. 8 s later it is gone, on its own time. The frame's own toast still shows.
- **Opus 1, a menu closed by Tab kept the button's rest:** Menu sets `data-tip-rest` only on a close that gives focus back (`escape-key`, `item-press`). When Tips cancels an open (cut-only or resting), it also closes any tip still open elsewhere.
  - Probed with `k8-probe.mjs` on the ticket page and the peek: Tab out leaves no rest, Shift+Tab back shows the button's own tip, and Esc keeps it quiet.

## Nit
- **Opus 2, the duplicate-token rule only sees one block:** tokens.css keeps one plain `:root` block per part of the kit, each under its part's comment, so the blocks stay as they are. Instead the kit gate gained a `tokens` check: `web/tools/tokens.mjs` (`repeatedTokens`, pure, 3 tests) finds a token defined twice across the plain `:root` blocks. That adds a check; nothing is weakened. It passes on tokens.css today, and its test reproduces the `--h-check` clash.

Checks, test (16 web tests), gates and 22 screenshots pass. Kit: 43/45 components, 8,224 of 9,000 lines.

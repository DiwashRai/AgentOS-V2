# New kit pieces: done

The owner's request (2026-10-21) was Tooltip, Menu, Toast and Checkbox/Radio, built on Base UI where it can carry them, with the budget raised to 45 components and 9,000 lines. All of it is built and reviewed on branch `web-restyle` (local only, nothing pushed), commits `6e058ac..26943ed`.

Both reviewers' last verdicts are "done": Opus round 6 had 2 nits, and Codex round 6 had no findings. Each round's findings are in `kit2-{opus,codex}-N.md`, and their fixes in `kit2-rN-fixes.md`. Every fix was probed in Chrome.

## What's in the kit now
- **Tooltips:** every `title` a kit component takes is drawn as a Linear-style tooltip (Base UI's) on every screen, with no change to the screens. Screen readers still get the words. A tip that only repeats visible text opens only when that text is cut off with "…". One Esc closes a tooltip and whatever it sits over. After a menu or picker closes, its tooltip doesn't pop back up.
- **Menu:** a "…" menu of actions. The ticket page and the peek use it for Copy link, Copy key, Open in Jira and Open the pull request.
- **Toasts:** `useToast()` raises a short notice such as "Copied the link to NW-17".
  - Toasts sit at the bottom left of the main column. Inside a peek they dock above its reply box.
  - A toast raised while an editor asks "save changes?" waits until the question is answered.
  - A dialog's toasts close with the dialog.
- **Checkbox and Radio:** on the kit sheet only, for the admin's intake setting once Settings exists. Their ledger entries say so.
- **Budget:** 43 of 45 components, 8,252 of 9,000 lines. Tooltip and Toast take no slot, because screens never place them directly. Menu, Checkbox and Radio do.

## Found along the way and now guarded
- **A token defined twice:** the checkbox's size token reused the plan row's height token, and the plan rows collapsed. That made it into a screenshot baseline before a reviewer caught it. Two checks now prevent a repeat: stylelint rejects a token defined twice in one block, and the kit gate rejects one defined twice across blocks with the same selector (`web/tools/tokens.mjs`, with tests).

## Left as nits
- A toast raised from a component's layout effect, at the moment a dialog's question opens, shows at once instead of waiting. Nothing raises toasts that way.
- The sidebar's search and "not in this version yet" buttons repeat their name in their description, as the browser's own title did before.

## Still open for the owner
- **Section,** decision #1 from `kit-review-done.md`: the peek's sections are still styled by position. A Section component would fit in one of the two spare slots.
- **The improved gauntlet loop over all the screens** is next.

## Section (added after)
The owner asked for it (decision #1). It is in `d7fd10a` and `fdb81f1`. Its review (`section-brief.md`) ended 'done' from both reviewers in round 2: Codex had no findings, Opus 3 nits. The kit is at 44/45 components and 8,363/9,000 lines. The gauntlet prompt is `gauntlet2-prompt.md`.

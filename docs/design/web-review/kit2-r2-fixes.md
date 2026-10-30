# Kit 2, round 2: what was fixed

From `kit2-opus-2.md` (1 must-fix, 3 should-fix, 3 nits) and `kit2-codex-2.md` (1 should-fix, 1 nit). Each was probed in Chrome with `k6-probe.mjs`.

## Must-fix
- **Opus 1, the checkbox token overwrote the plan row's height.** The new token is renamed `--h-box`. Stylelint now runs `declaration-block-no-duplicate-custom-properties`, so a token defined twice in one block fails the check. That adds a check; nothing is weakened. A probe confirms the rule fires.
  - The ticket baselines were re-taken. They had recorded the broken plan.
  - Probe: the plan lines on `/t/NW-17` are 36px again.

## Should-fix
- **Opus 2, the peek's toast at narrow widths:** a side panel's region docks inside the panel, on a zero-height line between its sections and its foot (`Dialog .dock`, with `Toasts dock` and `.docked`).
  - Probe at 1000×800: the toast is at [380, 672, 648, 714], inside the panel [356, 4, 996, 796] and above the foot, which starts at y = 722.
- **Opus 3, a link out left the menu open:** both kinds of `LinkItem` take `closeOnClick`.
  - Probe: after "Open NW-17 in Jira", no menu is open and `aria-expanded` is false.
- **Opus 4, composed lines read twice:** Text compares its title with the words it draws (`wordsOf`, nested Text included, spaces collapsed). NameCell's default title is now its line's own words.
  - Probe: no `aria-description` equals its element's text on the four library lists or the workflow editor.
- **Codex 1, a held toast could expire unseen:** the region isn't unmounted while a dialog asks. It stays in view, running its time, and is `inert`, so Tab and F6 still can't leave the question.
  - Probe: while asking, the dialog's region is `inert`.

## Nits
- **Opus 5:** toast.tsx's header says where the toasts are. They swipe away to the left (`swipeDirection="left"`).
- **Opus 6, a tooltip on focus return after a menu (round 1's declined 7):** done the way Opus suggested. Menu marks its button `data-tip-rest` as the menu closes and clears it on blur or pointer leave; Tips cancels a focus-open while it's set.
  - Probe: after Esc closes the peek's menu, focus is on "…" with no tip, and Tab then Shift+Tab brings the tip back.
- **Opus 7 and Codex 2, empty groups:** each group is a non-empty tuple. An empty outer list is still writable, but draws no rule.

Checks, test, gates and all 22 screenshots pass. Kit: 43/45 components, 8,198 of 9,000 lines.

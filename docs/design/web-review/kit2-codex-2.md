# Codex review: kit additions, round 2

Reviewed `090db35..195911b`, including both round 1 reports and `kit2-r1-fixes.md`. Source references below are at `195911b`. No source edits, commits or stashes.

1. **should-fix** - `web/src/kit/toast.tsx:47` and `web/src/kit/toast.tsx:62`: holding the region does not hold a notification's lifetime. The provider remains mounted and `useToast()` immediately calls `toasts.add()`, so Base UI starts its default five-second timeout even while the viewport is absent. A notification raised during a confirmation question can therefore expire without ever being displayed or announced, contrary to the stated behavior that queued toasts show after the question is answered. Reproduced in an in-memory composition of the existing components: open a full Dialog, show its `ask`, invoke its child's `useToast()` callback, advance Playwright's injected clock by six seconds, and choose Keep editing. Both Notifications regions are empty after resuming; the queued toast never appeared. Defer queued notifications until the region can display them, starting their dismissal timeout then, or otherwise preserve their display lifetime while held.

2. **nit** - `web/src/kit/Menu.tsx:27`: the new groups type still permits empty groups, so it does not fully provide the separator guarantee claimed in `web/src/kit/ledger.json:1115`. `groups={[[], [{ label: "An action", run }], []]}` is accepted and renders a separator before the first action and another after the last. Confirmed in Chrome: the menu contains one action and two separators. Current callers supply nonempty groups, so this is an API edge case. Use a nonempty group type if the guarantee is intended, or qualify the ledger's claim.

The round 1 accessibility and focus fixes otherwise hold in Chrome:

- Checkbox and Radio names contain only their label; their notes remain descriptions. A Checkbox inside a FormRow has `aria-invalid` and the combined description "Own note Row note Choose a value". Clicking its note still toggles it.
- Clicking NW-14 opens the peek on the dialog itself; the first Tab reaches Open ticket. Menu focus return, tooltip/menu/peek Escape order, and the full dialog's confirmation focus and Escape behavior work.
- The held toast region no longer takes F6 focus away from the question. A toast restored before its timeout is still present. A peek's toast renders in its dialog at the new left position, clear of its composer; F6 reaches it.
- In-app menu navigation retains a window marker. A tooltip alone no longer applies the menu's held fill. Checked choices retain their accent edge on hover.
- Plain HTTP now produces the Couldn't copy toast without an exception. Sortable keyboard movement and drag handlers, Drag's handlers, Tip's explicit id preservation, and Chip's arrival ref were checked.

I accept the two declined nits: reopening a tooltip on popup focus return and the sidebar's repeated name fragments remain negligible. Internal Tip/Toasts and the exported useToast hook fit the current consumers; there is no demonstrated need for more Menu features.

Light and dark screenshots were visually inspected. `node tools/kit.mjs` passed: 43/45 components, 8,151/9,000 lines, at most eight props. Browser probes ran on port 5231; their harnesses were held in memory and screenshots were saved outside the repository.

Verdict: another round

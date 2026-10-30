# Kit 2, round 1: what was fixed

From `kit2-opus-1.md` (1 must-fix, 5 should-fix, 8 nits). Each fix was probed in Chrome with `k5-probe.mjs`.

## Must-fix
1. **A Dialog opens on itself in both looks** (`tabIndex=-1`, then `focus()` after `showModal()` unless it asks), so the browser never picks the toast region or the close button.
   - Probe: a peek opened by a click focuses `DIALOG "Peek at NW-14"`, and Tab goes on to "Open ticket".

## Should-fix
2. **An in-app menu link uses the router's `Link`** (`render`), by Button's own rule, now shared as `inApp`.
   - Probe: "Open ticket" lands on `/t/NW-17` with a window marker kept.
3. **The menu button's held look keys on `aria-expanded="true"`**, not on `data-popup-open`.
   - Probe: with the tooltip open and the menu closed, there's no held fill.
4. **A chip opens a tooltip only while cut when its title is its label:** `cut={(title ?? label) === label}`. The redundant titles were dropped in QueueView and TeamsView.
   - Probe: no `aria-description` equals its element's text on `/` or `/teams`.
5. **Checkbox and Radio are named by their words alone** (`aria-labelledby` on the words' span), with the note as the description.
   - Probe: `checkbox "Take in Platform backlog by itself"`, and `radio "Ask first"`.
6. **Toasts sit at the bottom left of the main column** (`--w-side` plus the gutter), clear of a peek's reply box, the Talk column and the sidebar's foot. A dialog's region sits in the same place.

## Nits
- **9:** a checked box or radio keeps its accent edge on hover (the hover rule is `:not([data-checked])`).
- **10:** Menu's dead `.sheet` min-width is removed.
- **11:** Menu takes `groups`, so a rule can't lead, trail or double, and no string sentinel is needed.
- **12, 13:** toast.tsx says a toast may report an action with no place of its own that didn't happen (a refused copy), and that a dialog's toasts go with it when it closes.
- **14:** Menu's label example now reads "More on NW-17".

## Not taken
- **7, the tooltip reopening on focus return after a menu closes:** declined for now. Telling focus that follows a popup's close from a person's own focus needs Base UI internals or a timing guess. Esc still closes both in one press.
- **8, Search's and the stubs' descriptions repeating their name:** this was the same with the native title. A split name and description would need a second Tip prop for three sidebar buttons, so it was left.

Checks, test, gates and all 22 screenshots pass. Kit: 43/45 components, 8,145 of 9,000 lines.

## From `kit2-codex-1.md` (4 should-fix)
1. **Checkbox and Radio names:** fixed above (Opus 5).
2. **Checkbox in a FormRow:** it takes the row's note and problem as well as its own note, and `aria-invalid` while there's a problem (`useDescribed`, as the other controls do).
3. **A full Dialog's toasts while it asks:** the region is held, unmounted while the question is up, so neither Tab nor F6 can leave the alertdialog. Queued toasts show once the question is answered.
4. **Copy on an insecure origin:** TicketMenu checks `window.isSecureContext`, the browser's boundary for `navigator.clipboard`, and says "Couldn't copy" with why.

Items 2 to 4 were checked by reading the code. The fixture screens don't put a checkbox in a FormRow, raise a toast in an asking dialog, or serve the app over plain HTTP. Checks, test, gates and 22 screenshots pass. Kit: 43/45, 8,151 of 9,000 lines.

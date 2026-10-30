# Kit 2 review, Opus round 1 (`090db35..6e058ac`)

How I checked: I read the whole diff and Base UI 1.8.0's `TooltipTrigger` and `useRenderElement`, and I ran the app on port 5221 with Playwright (Chrome) in both themes. The scripts covered the kit sheet, the queue, the peek, compact, teams, intake, the ticket page and the workflow editor. `node tools/kit.mjs` (43/45 components, 8,139/9,000 lines), `tsc` and `eslint` are all clean.

These hold up, checked in the browser:
- **Esc order:** a tooltip with a peek under it closes both in one Esc, whether it opened on hover or on focus. With a menu open in the peek, Esc 1 closes the menu, focus goes back to "…", and the peek stays open. Esc 2 closes the peek.
- **Tooltips:** they open on hover and on keyboard focus. In a dialog they render inside the `<dialog>`.
- **Nested triggers:** Chip's Remove inside the chip shows "Remove X" on both hover and focus (Base UI's nested-trigger handling works).
- **Facts:** focus on the owner picker shows "Owner", it closes when the Select opens, and it comes back on focus return.
- **Refs and handlers:** refs are merged (`useRenderElement` merges `getReactElementRef(render)`), so Chip's arrival ref holds. Drag still drags, and its tooltip closes on drag start. Sortable's grip moves with ↑ ↓ and keeps focus.
- **Toasts:** the region is `role=region aria-live=polite aria-label=Notifications`. F6 reaches it in the frame and in the peek. A toast raised in the peek renders inside the dialog, over it.
- **Menu:** arrows, typeahead, Enter, and focus return after Esc all work. The roles are `menu`, `menuitem` and `separator`.
- **Radio:** the arrow keys move and choose. Space toggles the checkbox.

## must-fix

1. **Opening the peek puts focus on the empty toast region.** The relevant lines are `web/src/kit/toast.tsx:44-50` and `web/src/kit/Dialog.tsx:139-143`.
   - **Failure:** on `/`, click the NW-14 row. `document.activeElement` is the `<div role="region" aria-label="Notifications" tabindex="-1">` (and it matches `:focus-visible`). Tab then goes to the composer ("Say something about NW-14"), past the whole head and body. A screen reader opens the peek on "Notifications, region".
   - **Cause:** Base UI's viewport is `tabindex=-1`, so it counts as a focusable area for `showModal()`'s focus steps. The side look leaves initial focus to the browser. Before this change, a peek opened by click focused the dialog itself, as a direct load of `/?peek=NW-17` still does.
   - **Also:** on a reopen the region sits between `.body` and `.foot` in DOM order (`DIV._body, DIV.<region>, DIV._foot`).
   - **Fix:** focus the side dialog explicitly, as the full look already does. Better still, also keep the region out of the dialog's focus order: mount it only while a toast is showing, or put it last after the foot.

## should-fix

2. **A menu link to a path in the app reloads the whole app.** The relevant lines are `web/src/kit/Menu.tsx:37-51`.
   - **Failure:** `Base.LinkItem` renders a plain `<a href>`, so `{ href: "/t/NW-17" }` does a full page load. On the kit sheet, "More, small" → "Open ticket" lands on `/t/NW-17`, but a `window` marker set beforehand is gone. The query cache and all state are lost.
   - Button's `Anchor` uses the router's `Link` for the same case.
   - **Fix:** `render={<Link to={href} />}` when the href starts with "/". Either way, share Button's in-app/out rule rather than restating it.

3. **The tooltip's `data-popup-open` makes the "…" button look held down while its menu is closed.** The relevant lines are `web/src/kit/Menu.module.css:3` and `web/src/kit/tip.tsx:95-102`.
   - **Failure:** Tooltip.Trigger sets `data-popup-open` on the element it renders whenever its tooltip is open. Menu's "held while open" style keys off the same attribute.
   - Measured: hovering until the tip shows gives the trigger `aria-expanded="false" … data-popup-open=""` and the `--pop-hover` fill.
   - After Esc closes the menu, focus returns, the tooltip reopens, and the button shows "held" with no menu open.
   - The same trap waits for any `[data-popup-open]` style under a Tip (Select's chevron flip, `Select.module.css:72`, the day a Select takes a title).
   - **Fix:** key the held look on `[aria-expanded="true"]`, or on Menu's own state through a `className` callback.

4. **A Chip whose `title` equals its label always opens a tooltip and repeats its words as its description.** The relevant line is `web/src/kit/Chip.tsx:125`.
   - **Cause:** `cut={title === undefined}` only treats a missing title as the chip's own words. Callers pass the label again: `features/queue/QueueView.tsx:188` (`title={stage}`), `:190` (`title={t.repo}`) and `features/teams/TeamsView.tsx:171` (`title={badge.text}`).
   - **Measured:** 12 elements on `/` and 12 on `/teams` have `aria-description` identical to their visible text. "Implement" is read as "Implement, Implement", and the tip opens even though nothing is cut.
   - **Fix:** `cut={(title ?? label) === label}`, and drop the redundant titles at the call sites.
   - `Text.tsx:39` has the same gap: `title === children` misses children that aren't a single string (2 cases on `/compact`, e.g. "Cy · Review the change"). Comparing against a string child only is fine, but the Chip case is the common one.

5. **The Checkbox's and Radio's names include their note, and the note is also their description, so it is said twice.** The relevant lines are `web/src/kit/Checkbox.tsx:23-43` and `web/src/kit/Radio.tsx:30-46`.
   - **Cause:** Base UI names the root by `aria-labelledby` the wrapping `<label>`, whose text holds the note too. `aria-describedby` then points at the note again.
   - **Measured (aria snapshot):** `checkbox "Take in Platform backlog by itself Its new issues skip Intake and go to the Inbox."` with the same note as its description. Each radio reads the same way, e.g. `radio "Ask first Issues wait on Intake until someone takes them in."`.
   - **Fix:** take the note out of the `<label>`, keeping one target by making the row the click area. Or label the root by the words' own span (`aria-labelledby` on a span holding only `label`) and keep the note as the description.

6. **A toast in the peek covers the peek's reply box.** The relevant lines are `web/src/kit/Toast.module.css:4-15`.
   - **Failure:** the region is fixed at the bottom right, which in the peek is exactly over the composer's right half and its send end. In the screenshot after "Copy key", the toast sits on "Say something about NW-17" for its full five seconds. The frame's toasts also cover the bottom-right of any page.
   - **Fix:** lift the region above a side dialog's foot, for example with an offset the Dialog provides. Or anchor toasts where they don't sit on a control: Linear places them bottom-left, clear of the right-hand peek.

## nit

7. **A tooltip reopens on every focus return.** It comes back after a menu or a Select closes, on the trigger (`tip.tsx:95`). Linear doesn't show the tip again after its menu closes. Ignoring the focus event that follows a popup's close would match it.
8. **Some tips repeat the element's name in its description.** The new `aria-description` path makes this visible (`Frame.tsx:63,184,189`):
   - "Search" is described as "Search (/)".
   - "New ticket" is described as "New ticket: Not in this version yet".
   - "Settings" is described as "Settings: Not in this version yet".
   - The old native title did the same, so this is not a regression. Still: `aria-keyshortcuts="/"` with the tip marked `said`, and a description holding only the stub note, would say each thing once.
9. **A checked checkbox or radio loses its accent edge on hover.** `.choice:hover :is(.check, .radio)` (0,3,0) outranks `:is(.check, .radio)[data-checked]` (0,2,0) (`Form.module.css:276,283`). Measured: the border goes from rgb(94,106,210) to rgb(102,102,111) in light and rgb(169,165,161) in dark. Scope the hover rule to `:not([data-checked])`.
10. **Menu restates the popover's width.** `Menu.module.css:6` `.sheet { min-width: var(--col-2xl) }` repeats `Popover.module.css`'s `.sheet` and is dead.
11. **Menu's items can be written in bad shapes.** `MenuProps.items` (`Menu.tsx:24`) allows a leading, trailing or doubled `"|"` and an empty list, and rows are keyed by label (`Menu.tsx:72`), so two equal labels collide. Typing it as groups (`readonly (readonly MenuItem[])[]`) makes all of that unwritable and drops the string sentinel.
12. **TicketMenu raises a problem in a toast.** "Couldn't copy" (`features/shared/TicketMenu.tsx:15`) contradicts toast.tsx's own rule, "never a problem a screen should say in place" (`toast.tsx:6-7`). Either allow failures in the comment, or say it another way.
13. **Each dialog's own toast provider has two edge cases.** They follow from `useToast` resolving to whichever provider is nearest:
    - A toast raised inside a dialog vanishes when the dialog closes, because it is inside the hidden `<dialog>`. Copy the key in the peek, then press Esc.
    - A toast the frame raises while a modal is open sits under the top layer, inert.

    Fine for now, but worth a line in `toast.tsx`. Separately, `useToast` outside any provider throws, while `Tip` falls back gracefully. Not reachable today.
14. **Menu's doc example doesn't match its use.** `Menu.tsx:21` says "More actions on NW-17", but its one use and the ledger say "More on NW-17".

## API questions from the brief

- **Tooltip internal:** right. The `title` the kit already takes plus `said` and `cut` is the whole surface, and making it public would invite tooltips on things the kit already names.
- **Toast:** effectively public through `useToast`, which is right. Keep `Toasts` internal.
- **Menu:** waiting on icons, disabled or blocked items and submenus is right. Nothing needs them yet, and a blocked item should follow Button's `blocked: why` (R11) when it comes, not a bare `disabled`.
- **Radio:** `value` can name an id that isn't among the options, as Select's can. Leave it.

## Look

- Tooltip, menu and toast match Linear's scale in both themes: meta-size type, the 6px-round sheet and the menu's row rhythm. The lit edge reads well in dark.
- The checkbox and radio are crisp at 14px, and their focus ring matches the other controls.
- No look issues beyond items 6 and 9.

Verdict: another round

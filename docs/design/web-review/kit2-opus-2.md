# Kit 2 review, Opus round 2 (`090db35..195911b`)

How I checked: I read the round 1 fixes (`6e058ac..195911b`) and looked again at the whole change, with Base UI 1.8.0's `MenuLinkItem` source beside it. I ran the app on port 5221 with Playwright (Chrome) on `/`, `/compact`, `/teams`, `/intake`, `/t/NW-17`, `/kit`, the four library lists and `/?peek=NW-17`, and stopped it afterwards. `tsc`, `eslint`, `stylelint` and `node tools/kit.mjs` (43/45, 8,151/9,000) are all clean.

Note: while I was reviewing, uncommitted edits showed up in the working tree (`Menu.tsx`, `toast.tsx`, `TicketMenu.tsx`: non-empty groups, and an inert region in place of an unmounted one). They aren't mine and I didn't review them. Everything below is at `195911b`.

## The round 1 fixes hold

- **1 (focus on open):** clicking the NW-14 row focuses `DIALOG "Peek at NW-14"`, and Tab goes on to "Open ticket". Opened from the keyboard, Esc gives focus back to the row's button.
- **2 (in-app menu link):** it is the router's `Link`, and `inApp` is shared with Button.
- **3 (held look):** with the tooltip open, the trigger has `data-popup-open` and `aria-expanded="false"`, and it doesn't show the held fill.
- **4 (Chip):** no chip's `aria-description` equals its label on `/` or `/teams`.
- **5 and Codex 1 (names):** the accessibility tree shows `radio "Ask first"` and `checkbox "Take in Platform backlog by itself"`, each with its note as the description. Space, a click on the note, and the arrow keys all work.
- **Codex 2 (Checkbox in a FormRow):** by reading, the ids join in the right order and `aria-invalid` is passed on.
- **Codex 3 (asking dialog):** while the question is up the region is gone, and F6 stays on "Keep editing". Once the question is answered the region is back.
- **Codex 4 (insecure origin):** by reading, `isSecureContext` is the right check at this boundary.
- **Nits 9, 10, 12, 13 and 14** are as described.
- **Declined 8** is fair: it matches what the native title did, and it isn't worth a second Tip prop.
- **Declined 7:** see nit 6 below. It's fine to leave, but the reason given isn't quite right.

## must-fix

1. **The new `--h-check` token overwrites the plan row's height, so the ticket page's plan collapses.** The lines are `web/src/kit/tokens.css:586` and `:602`.
   - **Cause:** `:root` already had `--h-check: 36px; /* a plan row */` at line 586. The change adds a second `--h-check: 14px; /* a checkbox's box */` at line 602, in the same `:root` block (lines 442 to 621). The later one wins.
   - **Who it hits:** `Checklist.module.css:69` and `:86` use `--h-check` for the large plan's `.line` and `.more`.
   - **Measured on `/t/NW-17`:** every plan line has `min-height: 14px` and is 19px tall, where before it was 36px. The rows are crammed together, and each row's hover fill and click target is about half the height it was.
   - **Baselines:** `ticket-light/dark-win32.png` were re-taken in `6e058ac`, so the screenshot suite now treats the broken plan as correct.
   - **Fix:** rename the new token (for example `--h-box`) in `tokens.css` and in `Form.module.css:257-258` and `:291-292`, then re-take the ticket screenshots. It's also worth turning on stylelint's `declaration-block-no-duplicate-custom-properties` (`web/stylelint.config.mjs`) so a clash like this can't pass silently. That adds a check rather than weakening one.

## should-fix

2. **On a window narrower than 1,176px, a toast in the peek covers the reply box again.** The lines are `web/src/kit/Toast.module.css:7` and `web/src/kit/Dialog.module.css:4`.
   - **Why:** the region sits at `left: var(--w-side) + var(--sp-9)`, so it spans x = 264 to 532. The peek is `min(640px, 100vw - 24px)` wide and pinned 4px from the right, so it starts at x = vw - 644. Below vw = 1176 the two overlap, across the peek's whole foot.
   - **Measured at 1000×800:** after "Copy key", the toast is at [264, 734, 532, 776] and the foot at [356, 722, 996, 796]. The toast sits on "Say something about NW-14", and its × lands on the composer's start.
   - **Who it hits:** a window snapped to half of a 1920 screen (960px) gets this every time.
   - **Fix:** a dialog's region keeps clear of its own box. Either:
     - the side look places its region inside the panel, above the foot, for example with a `data-look` on the region and a bottom offset the Dialog provides;
     - or the region's left is held at most at `100vw - var(--w-peek) - var(--w-menu) - gutter`.

3. **A menu link that opens a new tab leaves the menu open behind it.** The lines are `web/src/kit/Menu.tsx:41` and `:47`.
   - **Cause:** Base UI's `Menu.LinkItem` defaults to `closeOnClick = false` (`menu/link-item/MenuLinkItem.js`, in its props).
   - **Measured on `/kit`:** click "Open NW-17 in Jira", or press Enter on it. A new tab opens, and back in the app the menu is still open (`role=menu` present, trigger `aria-expanded="true"`). The ticket page's and the peek's "Open … in Jira" and "Open the pull request" do the same.
   - **Expected:** Linear closes its menu once an item is chosen, and so does every `run` item here.
   - **Fix:** `closeOnClick` on both `LinkItem`s. The in-app one only escapes this today because the page it leaves unmounts.

4. **Text still marks a tip as its own words only when its child is a single string, so composed lines repeat themselves and always show a tip.** The lines are `web/src/kit/Text.tsx:39`, with `web/src/features/library/list.tsx:182`.
   - This was the second half of round 1's item 4. It wasn't fixed, and it isn't listed under "Not taken".
   - **Cause:** `cut={title === children}` misses `list.tsx`'s `<Text truncate title={name or "name · after"}>`, whose children are the name's own Text, the mark and the after.
   - **Measured (description equal to the element's whole text):**
     - `/library/agents`: "Planner", "Builder", "Reviewer" and "Writer", each described as itself;
     - `/library/files`: "context/api-conventions.md", "context/architecture.md", "context/glossary.md", and "AGENTS.md 3 blocks";
     - `/library/skills`: 6 rows, e.g. "tests Run, read and write tests…";
     - `/library/workflows`: 2 rows;
     - `/library/workflows/standard`: 3 prompt lines.
   - **Effect:** each of these is read twice, and its tooltip opens on hover over words that aren't cut.
   - **Fix:** `list.tsx` drops its default title when it only repeats the line, leaving a title only where it says something the line doesn't. Or Text compares `title` with the plain words of its children, flattened from strings and nested elements, with the same separator the screen draws.

## nit

5. **toast.tsx's header says the region is still where it used to be.** `web/src/kit/toast.tsx:2` says "in a small sheet at the window's bottom right", but since round 1 it sits at the bottom left of the main column.
   - Also, a bottom-left toast still swipes away to the right, into the page (Base UI's default `swipeDirection`, `Toast.module.css:3-4`). Swiping left would match where it sits.
6. **Declined 7, the tooltip on focus return after a menu:** it's fine to leave as a nit, but it needs neither Base UI internals nor a timing guess.
   - Menu's `Base.Root onOpenChange(false)` can set a flag (or a `data-tip-rest` on the trigger), cleared on the trigger's `blur` or `pointerleave`.
   - `Tips`' `onOpenChange` already cancels on a data attribute (`tip.tsx:50`). It can cancel the same way while the flag is set, for the focus open only.
   - Measured: after Esc closes the peek's menu, "More on NW-14"'s tooltip is open again on the trigger.
7. **"No rule can lead, trail or double" isn't true yet.** The claim is in `ledger.json` (Menu's `groups`), against `Menu.tsx:26`.
   - At `195911b`, `groups={[[], [a]]}` draws a leading rule, `[[a], []]` a trailing one, and `[]` an empty menu.
   - A non-empty tuple (`readonly [MenuItem, ...MenuItem[]]`) makes these unwritable. The uncommitted edit in the working tree does that for the inner arrays. The outer list can still be empty.

## Look

- No change from round 1: the tooltip, menu, toast, checkbox and radio match Linear's scale in both themes.
- The one look regression is the plan rows (item 1).

Verdict: another round

# Kit 2 review, Opus round 3 (`090db35..212584d`)

## How I checked

- I read the round 2 fixes (`195911b..212584d`) and looked again at the whole change.
- I ran the app on port 5221 with Playwright (Chrome) on `/`, `/compact`, `/teams`, `/t/NW-17`, `/?peek=NW-17` (at 1440×900, 1000×800 and 360×700), `/kit`, the four library lists and `/library/workflows/standard`. I stopped it afterwards.
- `tsc`, `eslint`, `stylelint` and `node tools/kit.mjs` are all clean (43/45 components, 8,198/9,000 lines).

Note: partway through, an uncommitted edit to `web/src/kit/toast.tsx` showed up in the working tree. It holds raised toasts while the dialog asks and replaces `useToast` with a context. It isn't mine and I didn't review it. Everything below is at `212584d`, and line numbers are HEAD's.

## The round 2 fixes hold

- **Must-fix 1 (plan rows):**
  - The token is now `--h-box` (`tokens.css:602`, `Form.module.css:257-258` and `:291-292`), and `--h-check` is back to 36px.
  - On `/t/NW-17` the plan's `.line` is 36px tall with `min-height: 36px`.
  - The stylelint rule fires: a scratch file with `--a` defined twice in one `:root` gets "Duplicate custom property". See nit 3 for where it stops.
- **Should-fix 2 (peek toast):**
  - At 1000×800 the toast is at [380, 672, 648, 714], inside the panel [356, 4, 996, 796] and above the foot, which starts at y = 722.
  - At 360×700 it is at [52, 572, 320, 614], inside the panel [28, 4, 356, 696] and above the foot at y = 622.
  - F6 lands on the docked region. In the screenshot the toast sits at the panel's left edge over the last message, clear of the reply box.
- **Should-fix 3 (link closes the menu):** after "Open NW-17 in Jira" on `/kit`, a new tab opens. Back in the app there is no `role=menu`, and `aria-expanded` is false.
- **Should-fix 4 (composed lines):**
  - On `/library/agents`, `/library/files`, `/library/skills`, `/library/workflows`, `/library/workflows/standard`, `/`, `/teams` and `/compact`, no `aria-description` equals its element's own text.
  - `wordsOf` handles NameCell's ` ` separators (`\s` matches them), and a Chip mark adds no words, so the title still matches.
- **Codex 1 (held toast):** the region stays mounted and is `inert` while the dialog asks. See nit 2 for what that still loses.
- **Nits 5, 6 and 7, and Codex 2:**
  - The header and the swipe direction (`left`) now match where the toast sits.
  - `groups` is a list of non-empty tuples, so the ledger's "no rule can lead, trail or double" holds. An empty outer list draws an empty popup with no rule.
  - After Esc closes the menu, focus is on "…" with no tip. Tab then Shift+Tab brings the tip back.
- **Regression sweep:** I tabbed through 45 stops on each of `/`, `/compact`, `/teams`, `/t/NW-17`, `/library/workflows/standard` and `/kit`. No tooltip showed words that weren't the focused element's. Moving the pointer straight from a described trigger onto an un-cut `cut` trigger closes the first tip on all four lists I tried.

## should-fix

1. **When Tab closes the menu, `data-tip-rest` stays set. Coming back with Shift+Tab, "…" gets no tip, and the previous element's tooltip stays open over the wrong place.** The lines are `web/src/kit/Menu.tsx:70-84`, with `web/src/kit/tip.tsx:51-53`.
   - **Cause:** `onOpenChange` sets `rest` on every close. It is cleared only by the trigger's `blur` or `pointerleave`. On a Tab close, Base UI moves focus from the popup straight to the next tabbable, so the trigger never had focus and never blurs.
   - **Measured on `/t/NW-17`:**
     1. Focus "More on NW-17", press Enter, then Tab. The menu closes and focus lands on the Owner property, whose tip "Owner" opens. `data-tip-rest` is still `"true"`.
     2. Press Shift+Tab. Focus is back on "More on NW-17", but the tooltip still reads "Owner", anchored at (571, 216) by the Owner property and not by "…". It is still there 3 s later.
   - **The peek:** the same happens at `/?peek=NW-17`, where Tab out of the menu lands on "Close peek (Esc)".
   - **Why the old tip stays:** a focus move between two triggers of the one detached tooltip is a switch. Cancelling it in `Tips`' `onOpenChange` keeps the old trigger's tip open, so the cancel leaves a stale tip in place of no tip.
   - **Fix, two parts:**
     - Set `rest` only for closes that give focus back to the trigger. `onOpenChange`'s `details.reason` tells them apart: not on `focus-out`, the Tab close. Or set it in the trigger's `onFocus` while the menu has just closed.
     - Where `Tips` cancels an open on a trigger switch (the `data-tip-rest` and the `data-tip-cut` cases), close the tip that is open (`handle.close()`), so a cancel never leaves another element's words showing.

## nit

2. **A toast raised while the full dialog asks is drawn, but it is never announced.** The line is `web/src/kit/toast.tsx:57` (`inert={held}`).
   - **Cause:** an `inert` subtree is left out of the accessibility tree, the `aria-live="polite"` region included. A toast added under it isn't spoken, and its 5 s timer runs anyway, so a screen reader user still loses it as in Codex's round 2 item. Lifting `inert` later doesn't announce what is already there.
   - **Impact:** today nothing raises a toast inside a full dialog (`useToast` is used only by TicketMenu and the kit sheet), so this is latent.
   - **Status:** the uncommitted edit in the working tree appears to address it, by holding raised toasts until the question is answered. I haven't reviewed it.
3. **The duplicate-token rule only sees one block, and `tokens.css` has three plain `:root` blocks.** The lines are `web/stylelint.config.mjs:19`, with `web/src/kit/tokens.css:442`, `:636` and `:659`.
   - **What still passes:** a `--h-joint` or `--w-strip` defined again in the large block at 442 isn't caught. The later block wins silently, the same way the plan row was broken.
   - **The fix note is accurate:** it says "in one block", so this is only the limit of the guard.
   - **A cheap close:** fold the two small `:root` blocks (636, 659) into the main one, so every plain size token lives in one block the rule covers. The theme blocks redefine tokens on purpose and are rightly outside it.

## Look

- No change from rounds 1 and 2. The tooltip, menu, toast, checkbox and radio are at Linear's scale in both themes.
- The docked peek toast reads well: the menu's width, at the panel's left edge, rising from the foot's rule.
- The plan rows are back to 36px.

Verdict: another round

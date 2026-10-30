# Kit 2 review, Opus round 4 (`090db35..9da9cb3`)

## How I checked

- I read the round 3 fixes (`212584d..9da9cb3`) and looked again at the whole change.
- I ran the app on port 5221 with Playwright (Chrome) on `/t/NW-17`, `/?peek=NW-17` and `/` at 1440×900. I stopped it afterwards.
- `tsc --noEmit`, `eslint`, `stylelint`, `vitest` (16 tests) and `node tools/kit.mjs --check` are all clean. The kit is at 43/45 components and 8,224/9,000 lines.

Note: partway through, an uncommitted edit to `web/src/kit/toast.tsx` showed up in the working tree again. It moves the raiser into a `Raising` child that uses the provider's own `useToastManager`, with a layout effect. It isn't mine and I haven't reviewed it. Everything below is at `9da9cb3`, and the line numbers are HEAD's. The finding about the dialog's toasts outliving it (should-fix 1) holds for both versions.

## The round 3 fixes hold

- **Opus 1 (Tab close kept the rest):** this holds on `/t/NW-17` and on the peek.
  - Focus "…", press Enter, then Tab. Focus lands on Owner (on the peek, on "Close peek (Esc)"), and that element's own tip shows. `data-tip-rest` is unset.
  - Shift+Tab back gives "More on NW-17", with the tip anchored under "…".
  - Shift+Tab out of the open menu puts focus on "…" with its own tip, which is right because the focus arrived there by Tab.
  - Esc, or a choice made with the keyboard or the mouse, keeps the tip quiet.
  - Closing the menu by pressing "…" again, or by clicking outside, leaves no rest and shows no tip while the pointer stays.
- **Opus 1, second part (a cancel closes the old tip):** on `/`, hover "Search (/)" until its tip shows, then move onto a whole `cut` chip ("web"). No tip is left showing.
- **Codex 1 and Opus nit 2 (held toast):** I checked this by reading the code.
  - `raise` reads `holding.current` when it is called, so a copy that finishes after the question has appeared queues.
  - A toast raised from an answer's own handler queues too, because `held` is still true until the effect runs, and it flushes once `held` is false.
  - The region stays `inert`, so F6 can't leave the question.
  - The author's seam probe covers announcement and lifetime, and I didn't repeat it.
- **Opus nit 3 (tokens across blocks):** `repeatedTokens` passes on `tokens.css`, and its test reproduces the `--h-check` clash. `vite.config.ts` includes `tools/**/*.test.mjs`, so `just test` runs it. See nit 3 for where it stops.
- **Toasts, again:** on the ticket page and in the peek, "Copy link" and "Copy key" toast, and F6 lands on "Notifications" (`role=region`, `aria-live=polite`). Esc from "…" after a choice closes the peek in one press.

## should-fix

1. **A dialog's toasts outlive it. One raised in a peek shows again in the next peek, naming the other ticket.** The lines are `web/src/kit/Dialog.tsx:159` and `:185`, with `web/src/kit/toast.tsx:59` and `:82`.
   - **Cause:** the `<dialog>` element is always rendered. `Peek.tsx:163` passes `open={key !== null}`, so its `Toasts` stays mounted, with its manager and its toast list, while the dialog is closed. A closed `<dialog>` is `display: none`, and Base UI's timer keeps running under it. When the dialog opens again within the toast's time, the old toast is drawn again.
   - **Measured:**
     1. On `/?peek=NW-17`, choose "…" then "Copy key". "Copied NW-17" shows in the peek.
     2. Press Esc twice. The URL is `/`, the dialog has `open=false`, and the toast is still in it at 0×0.
     3. Focus "Peek at NW-14" and press Enter. The dialog "Peek at NW-14" opens with "Copied NW-17" at 268×42 over its foot.
   - **The same root cause hits the round 3 queue:** a toast raised while the full dialog asks is flushed once `held` goes false. When the answer is "Discard" (which closes the overlay), the flush goes into the closed dialog, and the toast is shown the next time an editor opens, out of its context.
   - **Contradicts:** `toast.tsx:6`, "goes with it when it closes".
   - **Fix:** give each opening of a dialog its own region. Either mount the dialog's `Toasts` (and `Tips`) only while `open`, or key them on the opening (`key={String(open)}`). Or close every toast when `open` goes false. The side look's dock `div` can stay drawn while closed.

## nit

2. **A toast raised in a descendant's mount effect, before its provider has subscribed, is dropped.** The lines are `web/src/kit/toast.tsx:59` and `:82`.
   - **Cause:** with `toastManager={manager}`, Base UI's `ToastProvider` subscribes in a passive effect (`ToastProvider.js:39`). `createToastManager().add` only emits to its listeners, and a descendant's effects run before its ancestor's.
   - **Effect:** a component that mounts with its region and says something in a `useEffect` raises into nothing. So does any raise during the app's first commit.
   - **Impact:** no caller does this today (TicketMenu and the kit sheet raise on a click), so it is latent.
   - **The same order applies to `holding.current = held` at `:71`:** a descendant's effect that runs in the commit where `held` turns true still sees `false`.
   - **Status:** the uncommitted `Raising` edit (the provider's own `useToastManager`, and a layout effect) appears to address both. I haven't reviewed it.
3. **The `tokens` check keys on the exact selector `:root`, so the three `:root:not([data-theme]), [data-theme]` blocks aren't covered.** The lines are `web/tools/tokens.mjs:14`, with `web/src/kit/tokens.css:377`, `:627` and `:650`.
   - **What still passes:** a `--lane-line` or `--phase-plan` defined again in the large derived block at 377 isn't caught. The later block wins silently, which is the plan-row failure in the derived tokens.
   - **The fix note is accurate:** it says "plain `:root` blocks", so this is only the limit of the guard.
   - **A cheap close:** group by the normalised selector instead of skipping all but `:root`. I ran that over `tokens.css` today: no selector defines a token twice, so it would pass as it stands. The per-theme blocks each have their own selector, so their intended redefinitions are untouched.
4. **The "no tip on focus return" rule is Menu's alone. A Select's trigger still shows its tip again after Esc.** The lines are `web/src/kit/choice.tsx:41-52`, with `web/src/kit/Facts.tsx:71`.
   - **Measured on `/t/NW-17`:**
     1. Tab to Owner, and the tip "Owner" shows.
     2. Press Enter. The listbox opens and the tip closes.
     3. Press Esc. Focus is back on Owner, and the tip "Owner" opens again.
   - **Why it matters:** round 1's nit 7 named both menus and Selects. The round 2 fix gave `data-tip-rest` to Menu only, so the two popups in the kit now behave differently on the same key.
   - **Fix:** Choice's `Base.Root` can set the same flag on an `escape-key` or `item-press` close. Or the flag can move into a small shared helper that both use.

## Look

- No change from rounds 1 to 3. The tooltip, menu, toast, checkbox and radio are at Linear's scale. The docked peek toast sits over the foot at the panel's left edge.

Verdict: another round

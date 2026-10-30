# Kit review, round 8 (Opus)

Scope: the whole kit at `ccc6f25` (`web/src/kit`, `web/tools/kit.mjs`, `ledger.mjs`, and the screens as they use the kit). It also checks that the round-7 fixes (`ccc6f25`, `kit-r7-fixes.md`) hold.

How I checked:
- I read the round-7 diff, every kit file it touched, and again Button, Chip, Card, Head, Row, Choice, Segmented, Frame, Page, Stepper, Facts, FormRow, described, NumberField, TextArea, Lane and Strip. I also read the screens that the fix touched: QueueView, TeamsView, TicketLine, compact/model, RunsTab, copy, WorkflowOverlay, itemOverlay and KitSheet.
- Automated checks:
  - `npm run check` passes.
  - Vitest passes 13 of 13.
  - `node tools/kit.mjs --check` passes at 40/40 components and 7,573 of 7,628 lines.
- Screenshots: all 22 tests pass against the baselines. I used a scratch config pointed at port 5221, with its output in my scratchpad, and updated no snapshots.
- I ran Vite on 5221 and probed it with Playwright in Chrome. I took aria snapshots of `/`, `/compact`, `/compact?f=done`, `/teams`, `/t/NW-17` (Overview and Runs), `/intake` and `/library/workflows`. I read Chrome's own AX tree (CDP) for the comboboxes and the close question. I asked the close question on the kit sheet's overlay and on the dirty workflow overlay, and followed where focus went.
- Vite is stopped, nothing listens on 5221, and the tree is clean.

## The round-7 fixes

- **S1, the required glyph name: holds.**
  - My queue's heads read "Your move 3", "Agents at work 6", "Ready to start 1" and "Done recently 3". The agent cards have no state image.
  - On All teams, only the running and waiting cards have a state image, and the legend reads its words once.
  - Runs: the running run reads `img "Running"` "Implement, round 2 of 3". The gated run reads "Stopped at Plan sign-off" with no image. Stage lines name only a done stage with no end words.
  - A glyph Mark with no `name` is now a type error. The class can't come back by default.
- **Codex 1: holds.** `ask` is `ReactElement | null`, so `ask={asking && …}` doesn't type.
- **N2: holds on the real screens.** The dirty workflow overlay reads `alertdialog "Save your changes to NW-17's workflow?"`. It does not hold on the kit sheet; see S2.
- **N3: holds.** Strip reads "Plan (plan), then gate: Plan sign-off, then Implement (build) … Implement to Review loops up to 3 rounds".
- **N4, N5 and N6: hold.** N4 is "Search (/)". N5 is `lead?: never` on a status, with the dead rule gone. N6's live region is the list's sibling. `.unseen` is absolutely positioned, so it adds no gap in a flex parent. No Sortable is a direct child of a side Dialog, where it would count as a section.
- **N1:** the explicit "Running" is the required choice now. Fine.
- **N7:** with the owner. Not reopened.

Counts: **0 must-fix, 2 should-fix, 3 nit.**

---

## should-fix

### S1. Segmented's overflow chip has no name when the pressed filter is inside it

- **Where:** `kit/Segmented.tsx:138`, `...(current ? {} : { name: … })`, which `kit/choice.tsx:51` passes as `aria-label`.
- **Failure:** while the pressed filter is in the overflow, the trigger is a combobox with no accessible name. Chrome's AX tree reads `combobox ""`, value "Done recently 3", on `/compact?f=done`. My queue's "All done tickets" link goes to that page. `?f=waiting` gives `combobox ""` with "Waiting on others 2", and at 900px wide `?f=running` gives "Running 4". A combobox's name never comes from its content, so the body that "says it" (the comment on `ChoiceProps.trigger.name`) only gives the value. A screen reader says "combobox, Done recently 3", with no hint that this is the filter's overflow. This fails WCAG 4.1.2.
- **Fix:** always name it, for example `name: `${String(items.length)} more filters``. The value already says which filter is pressed, so the reader hears `combobox "3 more filters", Done recently 3`. Drop the conditional. `trigger.name`'s doc then says the trigger always has a name, and `name` can become required in `ChoiceProps` (Select's triggers already pass one).

### S2. The close question is named by a DOM query for an h1–h3, so a question without one asks two questions again

- **Where:** `kit/Dialog.tsx:41-50` (`showAsk` runs `querySelector("h1, h2, h3")` on the screen's children) and `features/sheet/KitSheet.tsx:366`.
- **Failure:**
  - The kit sheet's question draws its heading as `<Text variant="heading">`, which is a span. The probe reads `alertdialog "Close A full-window editor?"` over a sheet that says "Discard your changes?". That is round 7's N2 again, in the kit's own showcase.
  - The ledger's `Dialog.ask` reason says the question is "named by its own heading". The type can't promise that.
  - The kit reaches into feature-supplied children by tag. That is the same smell as kit CSS that styles children by position.
  - It mutates the feature's heading (`head.id ||= id`).
  - Its tag list (h1–h3) doesn't match `Text.as` (h1, h2).
  - The line under the heading ("Closing now loses them.") is never the alertdialog's description.
- **Fix:** have the kit draw the question's structure, so its name can't go missing. Make `ask` `{ question: string; note?: string; actions: ReactNode } | null`. Full then renders the heading and the note with `useId` ids, puts `aria-labelledby` and `aria-describedby` on the alertdialog, and puts the actions under them. `showAsk` drops to the focus line, and the `aria-label` fallback goes. SaveAsk becomes the words and three buttons, and the kit sheet can't get it wrong. If that is judged too much, the minimum is `as="h2"` on the kit sheet's heading, and a ledger reason that says a question must draw an h1 or h2.

---

## nit

- **N1. Done and Inbox rows still say their state twice.**
  - Where: `features/compact/TicketLine.tsx:55-60` names the glyph `STATE_WORD[kind]`, and the stage chip at `:87` says the stage.
  - Failure: for the bookend stages, the stage's word is the state's word:
    - My queue and Compact: `img "Done"` … "PR #187 merged **Done**"
    - `img "Abandoned"` … "Superseded by NW-17 Closed"
    - `img "Inbox"` … "Nobody on it yet **Inbox**"

    The same chip repeats the glyph on screen too: a green tick, then a "Done" chip with a green dot.
  - Fix: draw no stage chip when the ticket sits on a bookend (Inbox, Done, Closed), since the glyph already says it. Or name the glyph `false` in those rows. A one-line condition in `lineEnd` or `TitleCell`.

- **N2. `whereSaysState` re-derives `whereText`'s branches.**
  - Where: `features/ticket/RunsTab.tsx:123-138`.
  - Failure: the two functions must agree on the same three cases (a running stage, a gate, a reason), and today they do. Change one and the glyph's name silently doubles or drops.
  - Fix: one `whereOf(r, w)` that returns `{ text, saysState }`.

- **N3. After the close question, focus can land on a control the person never chose.**
  - Where: `kit/Dialog.tsx:89-91` records every focus in the frame as `was`. That includes the one `showModal()` gives the close button before `Dialog`'s effect moves focus to the dialog itself.
  - Failure: on the kit sheet, open the overlay, then press Esc and Esc again. Focus ends on "Close (Esc)", though the person was on the dialog.
  - Fix: reset `was` when the dialog itself takes focus. Or record only focus inside `.view`, which falls back to the dialog as the comment says.

Still the owner's call, as before: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and the group role for a single control (FormRow, a sidebar section). The ticket page's two h1s stay on the W1+ list from W0's review.

What remains:
- Round 7's fixes hold. The required glyph name ends the doubled-name class at its cause, and the probes confirm it on every screen it touched.
- S1 is a real unnamed control on a page My queue links to, and the fix is one line.
- S2 is round 7's N2 fix being only as good as each screen's markup. The kit sheet shows it failing. A structured `ask` closes it for good.
- The nits are small.
- Checks, gates and screenshots are green, and the kit is otherwise in good shape.

Verdict: another round

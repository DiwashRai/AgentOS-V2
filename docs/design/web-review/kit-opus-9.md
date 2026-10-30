# Kit review, round 9 (Opus)

Scope: the whole kit at `2eed3c1` (`web/src/kit`, `web/tools/kit.mjs`, and the screens as they use the kit). It also checks that the round-8 fixes (`2eed3c1`, `kit-r8-fixes.md`) hold.

How I checked:
- I read the round-8 diff and every file it touched: Dialog (tsx and css), Segmented, choice, index, the ledger, TicketLine, RunsTab, copy, WorkflowOverlay, itemOverlay and KitSheet. I read the rest of the kit again: Button, Chip, Card, Row, Select, Frame, Page, Lane, Sortable, Stepper, Notice, Head, Mark, Text, Field, FormRow, described, TextArea, NumberField, Toggle, Table, Tabs, opener, Compare, Composer and Checklist. I also read `domain/board.ts` and `compact/model.ts` (for N1's bookends).
- Automated checks:
  - `npm run check` passes.
  - Vitest passes 13 of 13.
  - `node tools/kit.mjs --check` passes at 40/40 components and 7,602 of 7,628 lines.
- Screenshots: I used a scratch config on port 5221, with its output in my scratchpad, and updated no snapshots.
  - On the first, cold run, `compact-expanded (light)` failed once.
  - Three repeats of that test passed, and so did a second full run of all 22.
  - I couldn't reproduce it, so I don't count it as a finding. It is worth watching in CI.
- I ran Vite on 5221 and probed it with Playwright in Chrome. I read Chrome's AX tree (CDP) for every combobox and for the alertdialog. I walked four focus paths through the kit sheet's close question and one through the dirty workflow overlay. I took screenshots of the question in both themes. I measured Segmented's fit with the fonts held back and with the chips widened.
- Vite is stopped, nothing listens on 5221, and the tree is clean.

## The round-8 fixes

- **S1, the overflow chip's name: holds.**
  - `/compact?f=done` reads `combobox "5 more filters"`, value "Done recently 3". `?f=waiting` reads the same name, with the value "Waiting on others 2".
  - `trigger.name` is required, so no trigger can be left unnamed.
- **S2, the question drawn by the kit: holds.**
  - The kit sheet reads `alertdialog "Discard your changes?"`, with the description "Closing now loses them.". The dirty workflow overlay reads `alertdialog "Save your changes to NW-17's workflow?"`, with the same description.
  - Focus is on Keep editing in both, and Esc dismisses back to the gate toggle the person was on.
  - The kit no longer queries or mutates the screen's markup.
  - The ledger's reason matches the code.
  - The sheet looks right in both themes: the heading, the muted note, and the buttons at the end.
- **N1: holds.** `/compact?f=done` has no state images left (only the owners' faces). A done row reads "PR #229 merged Done", once.
- **N2: holds.** `whereOf` returns `{ text, saysState }`, and the Row's label and the glyph both read from it.
- **N3: holds for what it fixed.** Esc then Esc now ends on the dialog, not on the close button. But it changed where focus goes when the person really was on the close button. See N1 below.

Counts: **0 must-fix, 0 should-fix, 4 nit.**

---

## nit

- **N1. After the question, focus never goes back to the close button, even when the person used it.**
  - Where: `kit/Dialog.tsx:83-90`. Round 8 moved `onFocus` from the frame to `.view`, so the close button is never recorded.
  - Failure, probed on the kit sheet:
    - Open the overlay, Tab to "Close (Esc)", Enter, then Keep editing. Focus ends on the dialog, not on the close button.
    - Click the close button with the mouse, then Keep editing. Again it ends on the dialog.
    - Tab to the view's Save, Shift+Tab back to the close button, Enter, then Keep editing. Focus ends on Save, a control the person had left. One more Enter then saves.
    - Before round 8, the first two cases went back to the close button.
    - The guidance for a dialog is to return focus to the control that opened it, and here the close button opened the question.
  - Fix: record focus on the frame again, and forget it when focus moves from the frame to the dialog itself. For example, `onBlur={(e) => { if (e.relatedTarget === e.currentTarget.closest("dialog")) was.current = null; }}` on the frame. `showModal()` lands on the close button and `d.focus()` then moves focus straight to the dialog, so that focus is still dropped (round 8's N3). A person who reached the close button keeps it.

- **N2. The sidebar's theme picker says its choice twice.**
  - Where: `kit/Select.tsx:103` names the side trigger `${label}: ${current}`, and its body (`:63-64`) draws both words.
  - Failure: Chrome reads `combobox "Theme: Paper"`, value "Theme Paper". This is on every screen.
    - A combobox's content is its value, as round 8's own comment on `ChoiceProps.trigger` says. So the name shouldn't repeat it.
    - The owner chip gets this right: `combobox "Owner"`, value "Ada Park".
  - Fix: name the side trigger `label` ("Theme"), and mark the body's label span `aria-hidden`. The control then reads `combobox "Theme"`, value "Paper".

- **N3. Segmented re-fits only when its track resizes, not when its chips do.**
  - Where: `kit/Segmented.tsx:107-109` observes only the track.
  - Failure: at 1440px on `/compact`, I widened the chips with `letter-spacing` while the bar's free room stayed 486px. The row kept its five chips, and their right edge ran to 1159px, past the track's 1005px. "+3" was clipped out of view (the track hides overflow) until a window resize re-fit it.
    - A font swap does reflow the whole bar. With the woff2 files held back and then let through, the track resized and the fit came out the same as a fresh load at 1440, 1300, 1200 and 1000px. So I found no case on today's screens.
    - The gap is latent: any change to a chip's width that the `key` doesn't cover and the track doesn't feel would hit it.
  - Fix: also `watch.observe(r)` on the ruler. Its width is the chips' natural widths, so any change to them re-fits.

- **N4. `ask` has two spellings of nothing, and the two screens use one each.**
  - Where: `kit/Dialog.tsx:35` (`ask?: DialogAsk | null`). `WorkflowOverlay.tsx:137` passes `null`, and `itemOverlay.tsx:254` passes `undefined`.
  - Failure: round 7 added `| null` so that a boolean couldn't be passed. Now that `ask` is an object, `asking && …` can't type either way, so `null` buys nothing over leaving it out.
  - Fix: `ask?: DialogAsk`, with both screens passing `undefined`. Then drop `| null` from `Full`'s prop and from the doc ("Or nothing (null)"). Or keep `| null`, but make it the one spelling and pass `null` from itemOverlay too.

Still the owner's call, as before: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and the group role for a single control. The ticket page's two h1s stay on the W1+ list. Select's `icon` outside the side look stays deferred, as in round 1.

What remains:
- Round 8's fixes hold. The question is the kit's to draw now, so it can't go unnamed. That was the last class-level gap I had open.
- Probed on the real screens, every combobox, glyph and question has a name, and none is said twice except the theme row (N2).
- The four nits are small. Each one is a line or two, and none blocks using the kit. N1 and N2 are worth folding into the next change, and they don't need a round of their own.
- Checks, gates and screenshots are green, apart from one cold-start flake I couldn't reproduce.

Verdict: done

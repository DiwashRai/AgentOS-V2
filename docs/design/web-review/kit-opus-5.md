# Kit review, round 5 (Opus)

Scope: the whole kit at `13b95fc` (`web/src/kit`, `web/tools/kit.mjs`, `ledger.mjs` and its tests, and the screens as they use the kit). It also checks that the round-4 fixes (`13b95fc`, `kit-r4-fixes.md`) hold.

How I checked:
- I read the round-4 diff, every kit TSX file, the kit CSS, `tokens.css`, the ledger, `kit.mjs`, `ledger.mjs` and its tests.
- `npm run check` passes. Vitest passes 13 of 13. `node tools/kit.mjs --check` passes at 40/40 components and 7,548 lines.
- All 22 screenshot tests pass against the baselines. I used a scratch config pointed at port 5221 with its output in my scratchpad. No snapshots were updated.
- My token scan found no unused token and no `var()` that names nothing. The only misses are Base UI's `--anchor-width` and names inside comments.
- I ran Vite on 5221 and probed it with Playwright in Chrome. I took aria snapshots, measured computed styles, and logged focus, `cancel` (with `cancelable`) and `close` across key sequences on NW-17's workflow overlay.
- Vite is stopped and the tree is clean.

## The round-4 fixes

Most hold. The exceptions are listed below.

- **M1, the measure: holds.** SKILL.md and the Planner's Instructions are 615px tall. The two new screenshot states pass.
- **S1, Esc on the question: holds for the case it names.**
  - Esc, then Esc from Keep editing, leaves 0 `close` events, and focus is back on Name.
  - The same failure is still reachable in two other ways (S2 below).
- **S2, the picker's type: holds.** All seven facts are 15px, `--tk-ink`, weight 400 and 32px tall.
- **S3, the Theme glyph: holds.** The Theme and Settings glyphs share `--side-icon`.
- **S4, `--list-fade`: holds.** No undefined token remains.
- **S5, the unions: hold.** Notice `empty`, Mark `you` and a picker's note are typed and drawn as the notes say. TeamsView narrows.
- **S6, the ledger: holds for the entries named.** Other entries still contradict the code (S4 below).
- **Nits:** N1 to N7, N10 and N12's header hold. N8 is still the owner's call.
  - N9: the gate holds, but its test doesn't test what its name claims (N2 below).
  - N11: Lane, Composer and the invalid edge hold. The Stepper fix is broken (S1 below).
  - N12's rewraps broke sentences mid-phrase (N1 below).
- **Codex 1 to 3: hold.**

Counts: **0 must-fix, 4 should-fix, 9 nit.**

---

## should-fix

### S1. A bare Stepper gate is named "Gate:", with the gate's name left out
`web/src/kit/Stepper.tsx:94`: `aria-label={`Gate: `}`. The template literal interpolates nothing.

**Failure:** This is the round-4 fix for N11. On /compact?open=NW-17, the expanded row's stepper has one bare knot. Chrome exposes it as `img "Gate:"` (aria snapshot: `listitem: - img "Gate:" - text: Plan`). The knot is the gate's only sign there, so assistive tech is told a gate exists but not which one. `title={g.label}` gives sighted users a tooltip, and nothing names it to anyone else. No test or screenshot can catch this.

**Fix:** `aria-label={`Gate: ${g.label}`}`, and drop the `title` or keep it as the tooltip only. A Vitest render or an aria check on the expanded row would guard it.

### S2. The close question can still lose focus to the dialog, and the dialog closes and re-opens
`web/src/kit/Dialog.tsx:84-95` (Esc is handled on the scrim only) and `:118-127` (a re-show calls `d.focus()`).

**Failure:** Measured on /t/NW-17?tab=workflow&edit=workflow, after opening Plan and typing in Name:
1. **Esc, Esc, Esc.** Esc 1 opens the question (cancelable). Esc 2 dismisses it, and focus goes back to Name. Esc 3, to close again, raises a `cancel` with **cancelable=false**, because Chrome won't let a repeated Esc be held without a user activation in between.
   - The browser closes the `<dialog>` (`close` fires). `onClose` asks the question, and the effect calls `showModal()` again.
   - The full look's `rise` animation replays.
   - Dialog's effect runs after Full's, so `d.focus()` takes focus off Keep editing. Focus ends on the **DIALOG** while the alertdialog is shown.
   - Enter or Space then does nothing to the question.
2. **A click on the question's padding or on the scrim** moves focus to the DIALOG (it has `tabIndex=-1`), outside the question. Esc from there skips the scrim's handler and goes to the dialog's `cancel`.

This is the round-4 S1 failure (focus on the dialog, `rise` replayed), reached by asking again or by a click.

**Fix:** Let the dialog own Esc for the full look, not only the scrim. Put `onKeyDown` on the `<dialog>`: on Escape, `preventDefault()` and call `onClose()`. A keydown that is prevented never becomes a close request, so the non-cancelable path is never taken from the keyboard, wherever focus is.
- The scrim's handler can then go.
- Field's search already stops propagation, so it is unaffected.
- Also, don't `d.focus()` on a re-show: only on the first open, or not at all while `ask` is shown.
- Re-check Esc ×3 and click-scrim-then-Esc. You should see 0 `close` events and focus on Keep editing.

### S3. Names are still said twice in two more patterns
Round 3's S2 fixed the chips and the counters. The same doubling remains in these places:
- **Compact's group heads** (`features/compact/CompactView.tsx:332`, `icon={<Mark kind={g.mark} glyph />}`). The glyph's default name repeats the head's name. Measured: `button "Needs you Needs you 2"`, "Blocked Blocked 2", "Running Running 4", "Queued Queued 2", "Inbox Inbox 3". Pass `name={false}` there. On My queue, the glyph's word differs from the name ("Running Agents at work"), so it can stay.
- **A face beside its written name.** Avatar always has role `img` with the person's name, and the components that write the name beside it don't hide the face:
  - The owner picker's options are named **"Ada Park Ada Park"**, "Bea Quinn Bea Quinn" and so on (`Select.tsx:42-51`, `Label`). That is the option's accessible name, which is what a screen reader announces as you arrow through.
  - The peek's Owner fact reads `img "Ada Park"` then "Ada Park".
  - Every Thread message reads `img "Bea Quinn"` then "Bea Quinn" (`Thread.tsx:33-38`).

**Fix:**
- In Select's `Label` and in Thread, wrap the face in an `aria-hidden` span (both components write the name themselves).
- For the Facts value, the screen passes a face and a name. Either Facts hides the face's name, or Avatar takes a decorative form for "the name is written beside it". The latter is the cleaner rule, but it costs a prop.

### S4. More ledger words contradict the code
- **MarkKind** (`ledger.json:1146-1153` against `Mark.module.css`):
  - `run` says "the breathing live dot". It is an orange ring with a progress pie and a breathing halo (`:45-60`).
  - `wait` says "a blue ring". It is a grey ring three quarters filled; the CSS comment says "indigo means you" (`:76-81`).
  - `abandoned` says "a crimson cross". It is a grey disc with a cross; only the name is crimson (`:139-142`).
- **Text.variant.display** (`:982`) says 28px. `--fs-ticket` is 24px (`Text.module.css:6`, `tokens.css:581`).
- **IconName**:
  - `tick` (`:1186`) says "a plan and the stepper's last stage", but the Stepper draws `tick-sm` (`Stepper.tsx:117`).
  - `close` (`:1172`) says "Leave the ticket page". It is the peek's close, the full Dialog's close and a Chip's remove.
- **Stepper skipped** (`:826`) says "a dashed hairline". It is a 2px dashed bar "as thick as the others" (`Stepper.module.css:73-80`).
- **Badge.size.sm** (`:86`) says "Compact's foot and an agent card's key". All teams' card keys use it too (`TeamsView.tsx:156`).
- **Meter.size.row** (`:530`) says "48px: the ticket's Now line". On the Now line the Stepper sets `--w-meter` to `--w-tk-meter` (120px).

The ledger is the gate's record of why each piece exists, and round 4's S6 asked for it to match the code. The MarkKind entries describe the old glyphs.

**Fix:** Rewrite these reasons from the CSS.

---

## nit

- **N1. The round-4 rewraps break sentences mid-phrase.** Each long line was cut at column 100 and the rest left as it was:
  - `Page.tsx:24-26`: "a link / back, / then its key".
  - `Segmented.tsx:192-194`: "the group is / described / by the row's note".
  - `Select.tsx:2-4`: "(face, / name, / chevron)".
  - `Table.tsx:22-24`: "a title / over / its chips".
  - Lone `*  */` closing lines: `Card.tsx:19-20`, `Facts.tsx:23-24, 37-38`, `Stepper.tsx:70-72`, `choice.tsx:25-26`.
  - Short tails: `Card.tsx:78-79` ("says. */"), `Mark.tsx:36-37` ("it. */"), `Table.tsx:14-16, 45-46` ("cluster).", "it).").
  - `tokens.css:555, 609` are still over 100 columns.

  Fix: reflow each comment as a paragraph.

- **N2. The gate's "whatever their order" test doesn't exercise the order.**
  - Where: `ledger.test.mjs:48-57`.
  - Failure: it feeds `ledgerProblems` a shape that is already merged (`vocabs: ["Length", "Width"]`). The order bug lived in `kit.mjs`'s `mergeProp`, which no test covers. A regression to "first vocabulary wins" there would pass.
  - Fix: move `mergeProp` into `ledger.mjs` (it is pure) and test it with both case orders, or rename the test.

- **N3. `--ground`: the default is dead, and outside a Surface there is none.**
  - `Surface.module.css:3` sets `--ground: var(--page)`, but `level` is always `recess` or `sheet`, which override it.
  - A scrolling Table that isn't in a Surface would give its sticky head `background: linear-gradient(...), var(--ground)` with `--ground` undefined. The whole declaration would then be invalid and the head transparent. Today both scrolling tables sit on recess Surfaces.
  - Fix: define `--ground: var(--page)` once on `:root` in `tokens.css`, and drop it from `.surface`.

- **N4. The invalid edge stops at `.box`.**
  - Select's `field` look (`Select.module.css:23-43`) re-declares the box's edge, fill and hover. It gets `aria-invalid` from a FormRow (through Choice's `useDescribed`) but no red edge. Its comment says it is "Form.module.css's .box and .field", which it copies rather than uses.
  - Fix: add the field look to the invalid rule, or compose `.box`.

- **N5. Lane's read-only gate no longer says it is a gate.**
  - Where: `Lane.tsx:93, 139`.
  - Failure: with the diamond hidden, a reader hears only "Plan sign-off" between two stages.
  - Fix: put an `unseen` "Gate: " before the name.

- **N6. A labelled Icon exposes its svg as a second image.**
  - Where: `Icon.tsx:266-270`.
  - Failure: the Checklist's tick reads as `img "Done"` with a nested `img` inside (aria snapshot).
  - Fix: `aria-hidden="true"` on the svg in both branches.

- **N7. A named Mark with neither `name` nor `ask` draws a glyph nobody can read.**
  - Where: `Mark.tsx:41-50, 88-96`.
  - Failure: `<Mark kind="run" />` type-checks and renders an `aria-hidden` glyph with no words. No screen does this today.
  - Fix: require `name` in the named, non-YOU case, so the glyph form is the only nameless one.

- **N8. Row silently drops cells beyond its columns.**
  - Where: `Row.tsx:38`, `cells.slice(0, columns.length)`.
  - Failure: a screen that passes one cell too many loses it with no sign. This is the same class as S5's dropped content. It can't be typed, but a dev-time `console.error` or a comment in `RowProps.children` would say so.

- **N9. The new screenshot states' comment** (`e2e/screens.spec.ts:15`) calls both "an item editor". `workflow-editor` is the workflow editor.

Still as before: N8 of round 4 (Dialog's side sections by position) waits for the owner's call on a slot. So does the empty lane's dashed ring on All teams.

What remains is small, but not negligible:
- S1 is an accessibility bug the last round introduced, a one-character fix.
- S2 is the round-4 focus failure, reached by another key sequence.
- S3 is the double-name class on two more patterns, one of them every option in the owner picker.
- S4 is the ledger describing glyphs that no longer exist.

Verdict: another round

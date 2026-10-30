# Kit review, round 4 (Opus)

Scope: the whole kit at `fb8f3e4` (`web/src/kit`, `web/tools/kit.mjs` and `ledger.mjs`, and the screens as they use the kit). It also checks that the round-3 fixes (`f05653f`, `ed55a8b`, `kit-r3-fixes.md`) hold.

How I checked:
- I read every kit file, the ledger, `kit.mjs`, `ledger.mjs` and its tests, and the round-3 diff.
- `npm run check` (tsc, ESLint, Stylelint, Prettier) passes. Vitest passes 12 of 12. `node tools/kit.mjs --check` passes at 40/40 components and 7,522 lines.
- I wrote scripts to find tokens that are never used, and `var()`s that name no token.
- I ran Vite on port 5221 and probed it with Playwright in Chrome: aria snapshots, computed styles, focus after key sequences, and dialog `cancel`/`close` events. I took screenshots in Paper and Carbon.
- Screens probed: My queue, Compact, Intake, All teams, NW-17, the peek, the Standard workflow editor and its overlay on NW-17, the skill and agent item editors, and /kit.
- Vite is stopped and the tree is clean.

## The round-3 fixes

Most hold. The exceptions are listed below.

- **S1, focus room: holds.** A focused filter chip has 4px of track on every side. "All done tickets" sits 4px inside Head's summary.
- **S2, double names: holds.** The chips read "Needs you 2", and the counters "3 your move".
- **S3, Override: holds.** It reads "xhigh, replacing high".
- **S4, Row `look`: holds.** Two dead leftovers remain (N1).
- **S5, Button `blocked`: holds.**
- **S6, unions: partly.**
  - Avatar and Mark's glyph form hold.
  - Notice's `empty` still takes a `fix` it never draws (S5 below).
  - Mark's `kind="you"` still takes a `name` it drops (N4).
- **S7, vocabulary plus literal: holds.**
  - The check's result depends on the order of the union's cases (N9).
  - The new file's header is corrupt (N12).
- **S8, Facts: the glyphs hold** (`--ink-3`, measured). The owner picker lost the row's type (S2 below).
- **S9, positional CSS: partly.**
  - Lane and Notice hold.
  - Page's new `measure` wrapper broke every item editor (M1).
  - On the declined Dialog part, see N8.
- **S10, dead code: holds.**
- **Nits:** N1, N2, N4, N6, N7, N8, N9 and N11 hold. So does N3, with a residue (N10). N5 holds in the code, but the ledger still says "tooltip" (S6). N10 is partly fixed (N3 below). N12 changed: the reason is sound, and a Drag with no click is now a plain draggable card.
- **Codex must-fix, z-index: holds.** Both positioners carry `.layer`.
- **Codex 3, Compare as a table: holds.**
- **Codex 4, focus after the close question: partly.**
  - Dismissing with Keep editing returns focus to the field that had it (measured).
  - Dismissing with Esc, the natural way, does not (S1 below).
- **Codex 5 and 6: hold.** The sticky head's ground is an assumption (N5).
- **Codex 7, words: partly.** The Stepper's comment is fixed, but its ledger entry still says "no card" (S6).

Counts: **1 must-fix, 6 should-fix, 12 nit.**

---

## must-fix

### M1. Page's `measure` wrapper broke `TextArea fill`: every item editor's body is a fixed 3-line box
- `web/src/kit/Page.tsx:111-113` puts a split body's children in `.measure`.
- `web/src/kit/Page.module.css:160-164`: `.measure` is a plain block (width and max-width only).
- `web/src/kit/Form.module.css:96-101, 112-116`: `TextArea fill` relies on its column being a flex column.

**Failure:**
- Before round 3, `.split > .body` was a flex column and its children were flex items. The item editor's `<Stack grow>` (`ItemEditor.tsx:154`, `content.tsx:188, 202`) took the column's height, and the filled TextArea took the rest.
- Now the children sit in a block. `flex: 1` and `height: 100%` resolve to nothing, so the area falls to its `min-height`.
- Measured at 1440×900: on /library/skills/ticket and /library/agents/planner, the SKILL.md and Instructions areas are **80px tall**. Giving `.measure` `display: flex; flex-direction: column; flex: 1; min-height: 0` makes them **615px**, as before.
- `.fill` also sets `field-sizing: fixed; resize: none`. The area can't grow or be dragged larger, so a long SKILL.md or agent prompt is edited through a 3-line slot.
- This hits the Skills, Agents and Files editors, and a ticket's context items in the full-window overlay (the same ItemEditor).
- No screenshot baseline covers an item editor, so `fb8f3e4` didn't catch it.

**Fix:**
- Make `.measure` carry the body's layout: `display: flex; flex-direction: column; flex: 1; min-height: 0` (or `flex: 1 0 auto`, so a short body doesn't stretch), next to its `max-width` and `margin-inline`.
- Add a screenshot of one item editor (for example /library/skills/ticket) so the fill is guarded.

---

## should-fix

### S1. Dismissing the close question with Esc lets the browser close the dialog, and focus lands on the dialog
`web/src/kit/Dialog.tsx:59-67` (the round-3 restore) and `:106-117` (the re-show).

**Failure:** Measured on NW-17's workflow overlay: open a stage, type in Name, press Esc (the question opens, focus on Keep editing), then press Esc again.
- The second `cancel` is **not cancelable**. Chrome makes a repeat Esc with no user activation in between non-cancelable.
- So the browser closes the `<dialog>` (`close` fires). The kit's `onClose` path toggles the question off. Dialog's effect then calls `showModal()` again and `d.focus()`.
- Full's own effect ran first and focused Name. Dialog's effect, as the parent, runs after it and moves focus to the DIALOG.
- Result: focus is on the dialog itself, not where the person was, and the full look replays its `rise` animation.
- Esc is the natural way to dismiss a question, so the Codex-4 fix holds only for a click on Keep editing.

**Fix:** Let the question own Esc, so the dialog's cancel never fires while it is shown. Put an `onKeyDown` on `.scrim`/`.ask`: on Escape, `preventDefault()` and `stopPropagation()`, then call `onClose()` (the screen's toggle). Field's search already uses this "never also closes the overlay" pattern. Re-check Esc, Esc on the workflow and item overlays: focus should be back on Name, with no second `close` event.

### S2. The owner picker no longer takes its properties row's type
- `web/src/kit/Facts.module.css:53-64`: `.value` sets `--fs-tk`, `--tk-ink` and weight 400. `:72-76`: `.picker` sets none of them.
- `web/src/kit/Select.module.css:1-3, 14-18`: the chip trigger inherits "the row's size, weight and ink".

**Failure:** Measured on NW-17, the Owner fact is **13px in `--ink-2`** (rgb 63,63,70). Type, Priority, Opened, Repo, Base branch and Workflow are all **15px in `--tk-ink`**. Before round 3 the shared `dd` gave the picker the row's type. Now "Ada Park" on the ticket page is visibly smaller and greyer than its neighbours, while the peek draws it at 15px (as a `value`).

**Fix:** Give `.picker` the value's type (`color: var(--tk-ink); font-size: var(--fs-tk); font-weight: 400`), or put those on `.fact > dd` for both forms.

### S3. Select's sidebar row styles a bare `svg` that Icon never renders, so the Theme glyph is in the wrong ink
`web/src/kit/Select.module.css:104-108` (`.side > svg`). Icon renders `<span class=icon><svg>` (`Icon.tsx:266`).

**Failure:** This is the same mistake round 3 fixed in Facts (`dd > svg`). The rule never matches. At the sidebar's foot, the Theme glyph is in `--side-ink` (measured at 0.17 lightness in Paper). Settings' glyph, one row up, is in `--side-icon` (0.34). On hover the Theme glyph follows the text, while the Settings glyph doesn't. The size is right only because the glyph's box happens to be 16.

**Fix:** Target the Icon: wrap it in a kit span with its own class (as Facts' `.glyph` does), or use `.side > span:first-child svg`. Better still, use a class. Sweep for other `> svg` child selectors after an Icon; the rest use descendant selectors and match.

### S4. `--list-fade` is not a token: the scrolling list's mask and its "fade" padding refer to nothing
`web/src/kit/Table.module.css:44-47` (`mask-image: var(--list-fade)`). No file defines `--list-fade`; it has been missing since the spike (`33b9660`).

**Failure:**
- The computed `mask-image` on Compact's and the library's lists is `none` (measured).
- The comment promises "room at the end, as tall as the fade the rows scroll out under". There is no fade, so the 32px bottom padding is explained by something that doesn't exist.
- This is an undefined token in the one file that is meant to hold every value. My token scan found no other undefined name, and no token that is never used.

**Fix:** Either define it in `tokens.css` (for example `linear-gradient(#000 calc(100% - var(--sp-10)), transparent)`) and check it in both themes, or delete the mask and reword the padding's comment.

### S5. Notice's `empty` still accepts a `fix` it never draws
`web/src/kit/Notice.tsx:48-57`: `empty` and `problem` share one case with `fix?: NoticeFix`. The `empty` branch (`:113-118`) draws no fix. `ledger.json:565` says the fix is "a problem's **or an empty line's** way out".

**Failure:** `<Notice kind="empty" fix="Add a query">` type-checks and drops the fix silently. That is the bad state S6 asked the union to remove, and the ledger documents the dropped case as real.

**Fix:** Split the case: `{ kind: "problem"; align?: "item"; fix?: NoticeFix }` and `{ kind: "empty"; align?: "item"; fix?: never }`. Correct the ledger's `fix` reason to say "a problem's". Or draw the fix on an empty line too, if that is wanted.

### S6. The ledger's words contradict the code in four places
- **Width's sizes** (`ledger.json:1118-1124`) against `tokens.css:520-528` and the columns that use them:
  - `xs` says "40px: a priority or a count". The token is 44px, and it is used for ages, a run number and a version.
  - `sm` says "84px: a key, an age". The token is 76px.
  - `2xl` says "a stage glyph and its label". It is used for fill columns' floors and My queue's button cap.
  - `3xl` says "a band's lead column". Its one use is the chips' hug cap on Compact's and My queue's lines. The token's own comment says "My queue's ask", which is wrong as well.
- **Stepper.now** (`:852`): "set off by space alone (no card)". `Stepper.module.css:181-187` draws a run card with an edge, a fill and padding whenever `now` is given. The code comment was corrected in round 3, the ledger was not.
- **Toggle.label** (`:1068`): "Its accessible name and tooltip". N5 removed the tooltip.
- **Notice.fix** (`:565`): see S5.

The ledger is the gate's record of why each piece exists, and the brief asks for it to be accurate.

**Fix:**
- Rewrite the four Width reasons from the tokens and their real uses, and fix the token comments at `tokens.css:520, 523, 528`.
- Say "on one run card" for Stepper.now.
- Drop "and tooltip" from Toggle.label.

---

## nit

- **N1. Row keeps dead pieces of the removed `look`.**
  - Where: `Row.module.css:141-144`, `.row.band:has(.hit:focus-visible) { outline: none }`.
  - Failure: this matches only Row's own button, and a band never has an action. Card's `.hit` is a different hashed class, so the comment ("the ring goes round the focused card") describes nothing this rule does.
  - Also, `:129-133` still says "A flat band is the board's column head", and its line breaks mid-sentence.
  - Fix: delete the rule, and reword the comment as `columns`.

- **N2. The visually hidden rule is written four times:** `Compare.module.css:83`, `Override.module.css:25`, `Drag.module.css:129` (`.said`) and `Facts.module.css:42` (`dt`). Fix: one rule (a `base.css` class, or `composes:` from one module).

- **N3. N10's spreads remain in the Editor.** `Editor.tsx:347-348` still writes `{...(context ? { context } : {})}` and `{...(middle ? { middle } : {})}`, though Page's `context` and `middle` accept `undefined` now. Fix: pass them directly.

- **N4. Mark's named form takes a `name` that `kind="you"` drops** (`Mark.tsx:40-48, 78`). This is the rest of S6. No screen does it today, since `markOf` gives `you` no name. Fix: a `you` case with `name?: never`, or say in the doc that `you` ignores it.

- **N5. The sticky group head assumes `--recess` under it** (`Head.module.css:141`). A scrolling Table on a `sheet` Surface would draw its heads on the wrong ground. Both scrolling tables sit on `recess` today, so nothing shows. Fix: have the Surface set a `--ground` variable that the head composites over, or give the band an opaque token.

- **N6. Raw values beside the new tokens.** `Meter.module.css:28` has `animation: sweep 1.7s`, the one raw duration in kit CSS. `Drag.module.css:52, 117` use `z-index: 1`, now that `--z-*` exists. Fix: `--dur-sweep`, and a `--z-*` token, or say why a local 1 is fine.

- **N7. The identity hues' names describe other colours, and one token is a no-op.**
  - Where: `tokens.css:387-393`.
  - Failure: `--id-plum` is blue (#2563eb), `--id-gold` is teal (#0f766e) and `--id-olive` is slate. `--id-gold-on` equals `--id-on` (both white), so `Avatar.module.css:69` overrides nothing.
  - Fix: drop `--id-gold-on` and its override. Rename the hues if the names are meant to describe them (`identity.ts` and the classes follow).

- **N8. Dialog's side sections by position: the decline holds, but only against the fix proposed.**
  - Wrapping `children` in sections would remount the peek, as the round-3 notes say.
  - A kit-owned section wrapper used inside the peek's `Body` would not remount anything. It would remove `.body > *` (`Dialog.module.css:47-54`).
  - It costs a component slot, and the budget is at 40/40. The contract is documented, so this can wait for the owner's call on a slot.

- **N9. The kit gate's vocabulary check depends on the order of the union's cases.**
  - Where: `kit.mjs:98` keeps `a.vocab ?? b.vocab`. Table's `width` merges to `Width` only because the `Width` case comes first.
  - Failure: if `{ width: Length; hug: true }` were written first, the vocabulary would be `Length`. `fill` would then count as an "extra" literal and fail the gate without a reason in the ledger. A second, different vocabulary on one prop would never be checked at all.
  - Fix: keep a set of vocabularies per merged prop, and treat a value as extra only when no vocabulary in the set has it. Add a test case with the cases reversed.

- **N10. FormRow's context can still say words with no id to point at** (`described.ts:13-18`). `describe` then quietly returns nothing, and Segmented passes `{}` to clear it. Fix: `Description = { id: string; note?: string; problem?: string } | null`, with `null` for "no row".

- **N11. Small accessibility gaps the kit composes itself:**
  - Lane's read-only gate is said twice: `role=img` "Gate: Plan sign-off" (`Lane.tsx:93`) and its visible name (`:139`).
  - A bare Stepper gate is only a `title` on a span (`Stepper.tsx:100`), so it is invisible to assistive tech when compact or when there are more than two gates.
  - The Composer's `:focus-within` ring (`Composer.module.css:29-33`) draws round the box while Send shows its own ring, two rings at once. Use `:has(textarea:focus-visible)`.
  - `aria-invalid` is set on every control in a FormRow with a problem, but no kit CSS reads it, so an invalid field looks like a valid one.

- **N12. Words and form:**
  - `web/tools/ledger.mjs:1` is the whole five-line header pasted as one 472-column line with literal `` `n `` where the newlines should be. It also runs straight into the code with no blank line.
  - `ledger.json:499`: Mark.name's "a tab's count". Tabs draw no Mark; it is Segmented's chips.
  - `:432`: Head.count's "count pill". It is a bare count (`Badge.module.css:20`).
  - `:824`: Stepper's "current: the long segment". Every column is equal now.
  - Comment lines over 100 columns: `Card.tsx:76`, `Mark.tsx:36, 42`, `Notice.tsx:35`, `Table.tsx:15, 43`, `Segmented.tsx:192`.

Still left as the round-2 notes left it: the empty lane's dashed ring on All teams.

What remains is not negligible.
- M1 is a functional regression on four editors, introduced by the last round.
- S1 to S3 are a focus loss and two visual misses on shipped screens.
- S4 and S6 are the token file and the ledger saying things the code doesn't.
- S5 is a bad state the last round meant to remove.

Each is small to fix. M1 also wants a screenshot so it can't come back unseen.

Verdict: another round

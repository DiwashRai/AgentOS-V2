# Kit review round 3: what was fixed

From `kit-opus-3.md` (0 must, 10 should, 12 nits) and `kit-codex-3.md` (1 must, 4 should, 2 nits).

## Codex
- **Must: popups under sticky heads.** `--z-sticky` and `--z-pop` tokens; Popover's `.layer` on every positioner (Choice, Frame's sheet). Probe: z-index 10.
- **3: Compare's structure.** `role=table`, a `row` per line pair (`display: contents`), `columnheader` per side, `cell` per line; a changed line says "changed:" and a gap says "no line" to assistive tech. Probe: 1 table, 2 heads, 17 rows.
- **4: the close question's dismissal.** Dialog remembers the last focus in its view and restores it (else the dialog) when the ask goes. Probe: focus back on the same control.
- **5: Facts and Table's sticky heads.** Facts has three exclusive forms: `value` with an optional muted `icon`, or a `picker`. No `:has()` content sniffing. Table no longer styles `[data-head=group]`: it provides `Scrolling`, and Head makes itself sticky.
- **6: StepperModel** is now `{ stages, live, closed }`. Label and round stay in the domain model.
- **7 / Opus N2: words.** Avatar's reason; Button.size "three heights"; Stepper.now.

## Opus
- **S1:** Segmented's and Head's summary keep `--focus-room` round their content, so focus rings aren't clipped.
- **S2:** `Mark name={false}` for a glyph whose words are already beside it (counters, tabs, overflow).
- **S3:** Override's replaced value is said by hidden words, not an `aria-label` that hid the value.
- **S4:** Row `look` removed (screens computed it and nothing drew it); `kind="columns"` for a board's column head.
- **S5:** Button `blocked` is a third form beside `onClick` and `href`.
- **S6:** unions for Mark (glyph or named), Notice (status, empty or problem, more; `fix` and `more` slots, so screens no longer style the kit's children), Avatar (one face, faces, or a slot).
- **S7:** the kit gate wants a reason for a literal a union adds beside a vocabulary. The ledger rules moved to `web/tools/ledger.mjs`, with 5 tests in `ledger.test.mjs` (Vitest includes `tools/**/*.test.mjs`).
- **S8:** Facts, as Codex 5 above.
- **S9:** Page's body has its own `measure` element; Lane wraps a stage's content in `.card`. **Dialog was reverted:** wrapping each child in a `section` merged the peek into one section, because the peek's sections come from one component (`Loaded` -> `Body`, which owns the queries). Moving the Dialog inside it would remount the modal on open and close, and lose the focus return. So a side Dialog's sections are still each top element its children draw, now a documented contract in its `children` doc and CSS comment.
- **S10:** removed Table's `give` track and the Width values `fit`, `line` and `dot`.

## Nits
- **N1:** Composer's padding is now on the text's label, so a click there focuses the text. Send has its own room.
- **N3:** one `describe()` rule in `described.ts`; FormRow and TextArea both use it. The context carries the id and words, not the built attributes.
- **N4:** Segmented's overflow chip doesn't repeat the row's description.
- **N5:** Toggle drops a `title` that was the same as its name.
- **N6:** the search keycap is `aria-hidden`, and the input has `aria-keyshortcuts="/"`.
- **N7:** comments fixed in Popover, Meter, Text and Card, and Lane.edit's reason.
- **N8:** Length's ledger entry is `of: "Width"`, so its reasons come from Width.
- **N9:** focus offsets are `--focus-out`, `--focus-tight` and `--focus-in`.
- **N10:** FormRow's note and problem, Head's count and note, and Page's context and middle accept `undefined`. The spreads in StageFields and Intake are gone.
- **N11:** one `opener.tsx` (`Opener` and `openOnClick`) for Row and Card. Row's button now covers the row, as Card's does.
- **N12, changed:** Drag is a `button` only while it has an `onClick`. The library panel has no click until a stage is chosen, so `onClick` stays optional.

## Also
- The screenshot baselines dated from the W0 spike (`ed1775b`): every restyle commit since differed. They were refreshed in their own commit after checking each screen.

Kit: 40/40 components, 7,530 of 7,628 lines.

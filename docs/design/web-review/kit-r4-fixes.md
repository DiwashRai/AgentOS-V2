# Kit review round 4: what was fixed

From `kit-opus-4.md` (1 must, 6 should, 12 nits) and `kit-codex-4.md` (0 must, 2 should, 1 nit).

## Must
- **Opus M1 / Codex 1: Page's measure collapsed the item editors.** `.measure` carries the body's column (`flex: 1 0 auto`, a flex column). Probe: SKILL.md and Instructions are 615px tall, not 80. New screenshot states guard it: `skill-editor` and `workflow-editor`, in both themes.

## Should
- **S1: Esc on the close question.** The question owns Esc. A key handler on its scrim (role `presentation`, because the alertdialog can't take one under jsx-a11y) prevents the default, stops propagation and answers the question. Probe: Esc then Esc on the workflow overlay leaves 0 `close` events, and focus returns to Name.
- **S2: the owner picker's type.** Both forms of a fact take the row's type on `dd`. Probe: the picker is 15px in `--tk-ink`, the same as Bug.
- **S3: the Theme glyph.** Select wraps the side row's Icon in `.glyph`. Probe: it is in `--side-icon`. No other `> svg` rule follows an Icon.
- **S4: `--list-fade`.** The mask was never drawn, so it is deleted rather than adding a new look, and the padding's comment is reworded.
- **S5 / Codex 2: content the rendering drops.**
  - Notice: `empty` is its own case, with `fix?: never`.
  - Mark: YOU is its own case, with `name?: never`. The domain's `MarkModel` is the same union, and All teams narrows it.
  - Facts: a picker's `note` is drawn after it.
- **S6: the ledger's words.**
  - Width xs, sm, 2xl and 3xl, and their token comments.
  - Stepper.now ("on one run card").
  - Toggle.label (no tooltip).
  - Notice.fix ("a problem's").
  - Also: Mark.name, Head.count, Stepper's current segment and Facts.items.

## Nits
- **N1:** Row's dead band focus rule is removed, and the band comment is about `columns`.
- **N2:** one `unseen.module.css`, used by Compare, Override, Sortable and Facts' `dt`.
- **N3:** the Editor passes Page's `context` and `middle` directly.
- **N4:** see S5.
- **N5:** a Surface sets `--ground` (page, recess or card), and the sticky head paints over it.
- **N6:** `--dur-sweep` for the Meter, and `--z-raise` for Drag's tag and drop line.
- **N7:** the identity hues are renamed for their colours (violet, blue, rose, teal, slate), and the no-op `--id-gold-on` is gone. Only the names changed; the hashing is the same.
- **N8:** left for the owner. A kit section wrapper inside the peek's Body would end the positional rule, but it costs a component slot at 40/40.
- **N9 / the gate:** a merged prop keeps every vocabulary its union's cases give (`vocabs`). A value counts as extra only when none of them has it. A new test covers both case orders and a missing vocabulary (6 tests).
- **N10:** `Description` is `{ id } & Words` or `null`; Segmented clears it with `null`.
- **N11:**
  - Lane's read-only diamond is `aria-hidden`, since its name is written beside it.
  - A bare Stepper knot is `role=img` with a label; it is hidden where its caption shows.
  - Composer's ring is `:has(textarea:focus-visible)`.
  - An invalid form box's edge is `--blocked`.
- **N12 / Codex 3:** `ledger.mjs`'s header is real lines. Comment lines over 100 columns are rewrapped, apart from one JSX comment in Frame and one code line in Strip.

## Screenshots
- Intended changes: the owner picker on the ticket (15px), and the invalid Prompt's red edge on the kit sheet.
- Compact's light baseline changed by text anti-aliasing on its Queued head only. The ground is the same `#f9f9fa` (probed).
- New: `skill-editor` and `workflow-editor`.

Kit: 40/40 components, 7,548 of 7,628 lines.

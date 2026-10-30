# Kit review, round 3 (Opus)

Scope: the whole kit at `1e873bd` (`web/src/kit`, `web/tools/kit.mjs`, and the screens as they use it), plus a check that the round-2 fixes hold.

How I checked:
- I read every kit file, the ledger, `kit.mjs` and the round-2 diff.
- `npm run check` (tsc, ESLint, Stylelint, Prettier) passes, Vitest passes 7 of 7, and `node tools/kit.mjs --check` passes at 40/40 and 7,322 lines.
- I ran `kit.mjs --list` to see what the walker actually reads.
- I ran Vite on port 5252 and probed it in Chrome with Playwright, using the accessibility tree from CDP. Vite is stopped and the tree is clean.
- Screens probed: My queue, Compact, Intake, All teams, NW-17, the Standard workflow editor and /kit, in Paper and Carbon.

## The round-2 fixes

They hold, with three exceptions, each listed below.

- **O S1, card focus: holds.** `.hit` is `inset: 0`, `opacity: 0` and `pointer-events: none`.
- **O S2, drafts: holds.** Talk and the peek's Reply are keyed by the ticket.
- **C1, popped text area: holds.** Chrome reports the popped Prompt textbox as `invalid=true`, described by the help and the problem.
- **C2, walker merge: holds**, nested fields and intersections included. A new hole is next to it, in how a vocabulary meets literal values (S7).
- **C3, Segmented description: holds.** The group carries the row's description. Nit N4 covers the double reading.
- **C4, `Length`: holds.** But the `give` case it types has no caller (S10), and the vocabulary copies Width's reasons (N8).
- **C5 and C6, exclusive props: hold.** Chip's trailing forms and Card's looks exclude each other's fields, through spreads too.
- **N2, Composer markup: holds**, but a click on the box's padding no longer focuses the text (N1).
- **N4, N5, N10: hold.** Sheet `noGate`, `insideLoop` on `span`, and Select's CSS.
- **N9 and C8, the ledger's words: partly.** Meter's CSS comment still names the card as the Meter's containing block, and Avatar's reason and API comment still say rows draw neutral faces (N2, N7).

Counts: **0 must-fix, 10 should-fix, 12 nit.**

---

## should-fix

### S1. The focus ring is clipped on Segmented's chips and on Head's summary links
- `web/src/kit/Segmented.module.css:6-14`: `.track { overflow: hidden }`.
- `web/src/kit/Head.module.css:84-92`: `.summary { overflow: hidden }`.

**Failure:** The global ring is a 2px outline drawn 2px outside the element (`base.css:37-40`). An `overflow: hidden` ancestor cuts it off.
- **Compact's filter:** Tab to "Needs you". The track is exactly the chip's height (26px), so the ring loses its top and bottom and shows as two blue brackets.
- **The form's Maker | Check:** only a sliver of ring shows at Maker's right edge. The `fit` track keeps `overflow: hidden` too.
- **Head's summary:** Tab to "All done tickets" on My queue. The right side of the ring is cut flat, because the link sits at the summary's far edge.

In each case the keyboard user can't tell where focus is.

**Fix:**
- Segmented: give `.track` room for the ring with `padding-block: calc(var(--line-2) * 2)`. Or put the clipping on an inner element and keep it off the box that holds the focusable chips. The measured path already measures, so the overflow chip still keeps the row from clipping.
- Head: drop `overflow: hidden` from `.summary` and let its text cut with `min-width: 0` and `text-overflow` on its own spans. Or pad it by the ring's reach.
- Re-check Tab on Compact, Maker | Check and My queue.

### S2. A labelled Mark glyph next to its own words doubles the name
- `web/src/kit/Mark.tsx:49`: `Glyph label={name ?? WORD[kind]}`: a glyph mark is always `role="img"` with a name.
- It is used beside words at `web/src/kit/Segmented.tsx:73` (Body), `:148` (the overflow's rows) and `web/src/kit/Page.tsx:54` (counters).

**Failure:** Chrome names Compact's filter chips "Needs you Needs you 2", "Blocked Blocked 2" and "Running Running 4". The overflow's options are named the same way. My queue's counters read "Needs you, 3 your move". The kit composes this itself: the screens can't avoid it.

**Fix:** Let the glyph be decorative when words beside it say the state, as `Icon` already is with no `label`. One way is a glyph mark that takes no name, drawn `aria-hidden`; the glyph used alone keeps `WORD[kind]`. Use that form in Segmented's Body and rows and in Page's counters.

### S3. Override's words are lost to assistive tech
`web/src/kit/Override.tsx:16`: `aria-label` on a plain `<span>`, with `<s aria-hidden>` holding the replaced value.

**Failure:** ARIA forbids naming a generic element, and Chrome's tree ignores the label. On /kit an override reads as just "xhigh". The "replacing high" that the component exists to say is gone, because the struck value is hidden and the label is ignored.

**Fix:** Keep the visible words and add the rest as visually hidden text. For example, `<b>{value}</b><s aria-hidden>{own}</s>` plus a hidden `<span>, replacing {own}</span>`. Or give the wrapper `role="img"`. Drop the `aria-label`.

### S4. `Row.look` is a variant the kit doesn't draw, which three screens compute
- `web/src/kit/Row.tsx:18-19` and `:127` (`s[look]`).
- `web/src/kit/Row.module.css` has no `.raised` or `.you` rule. `.flat` exists only under `.band` (`:153-177`).
- A rack ignores `look` outright (`Row.tsx:126-127`).
- `ledger.json:649-656`.

**Failure:**
- CompactView (`CompactView.tsx:148`), QueueView (`QueueView.tsx:75`) and RunsTab (`RunsTab.tsx:282`) each work out `flat`, `you` or `raised` per row, and a line, item or rack row draws the same whichever they pick.
- The kit sheet's `<Row look="you">` and `<Row look="flat">` (`KitSheet.tsx:539, 546`) show nothing different.
- The doc comment promises "you: raised, a list row with a faint you wash", and no wash exists.
- The ledger's `flat` says "a queued agent's card, on a fainter hairline", but that card is a Card now.

This is the kind of dead variant the consolidation set out to remove, kept alive by its callers.

**Fix:** Remove `look` from Row. A board's column head is the one real use, so make it its own kind, for example `kind: "band" | "bandHead"`, or `head?: true` on a band. Delete the three screens' computations and the ledger values.

### S5. Button accepts `blocked` together with `onClick` or `href`, and drops them silently
`web/src/kit/Button.tsx:10-27` (`blocked` sits in `Common`, beside `Does`) and `:77-94`.

**Failure:** `<Button blocked="Nothing to undo" onClick={undo}>Undo</Button>` type-checks. The blocked branch renders without the click or the link. Round 2 made exactly this kind of union exclusive in Card, Chip, Dialog and Column. The Editor already works round it by hand (`Editor.tsx:261-269`, `{...(x ? { onClick } : { blocked })}`), which shows the shape the type should have.

**Fix:** Make `blocked` a third case of `Does`: `| { blocked: string; onClick?: never; href?: never }`, with `blocked?: never` in the other two cases.

### S6. Notice, Mark and Avatar still take props that their form ignores, and a screen already passes them
- **Notice** (`web/src/kit/Notice.tsx:5-22`):
  - `error` is read only by `status`, and `fix` only by `problem`.
  - `align="item"` is drawn only for `empty` and `problem`, and `align="end"` only for `status` (`Notice.module.css:25-28, 127-151`).
  - Intake passes `<Notice kind="more" align="item">` (`IntakeView.tsx:221`) and `<Notice kind="status" align="item">` (`:273, :277`). Neither combination has a rule, so the screen asks for an alignment it doesn't get.
- **Mark** (`web/src/kit/Mark.tsx:19-34, 56-70`): the glyph form ignores `ask`. The named form ignores `progress` and `still`. `name` is dropped for `kind="you"`.
- **Avatar** (`web/src/kit/Avatar.tsx:5-17, 36-49`): `people` ignores `name`, `seed` and `dashed`, and `dashed` is ignored when there is a `name`.

**Failure:** Bad states can be written, against the core idea and against what round 2 did for Card and Chip. This "optional soup" was deferred to "W1+" in the W0 review (`w0-r1-fixes.md` item 31). The owner wants the kit right before it is used for real, and Notice now has live misuse.

**Fix:** Discriminated unions by form, with `never` exclusions as Card and Dialog have:
- **Notice:** `{ kind: "status"; error?: boolean; align?: "item" | "end" }`, `{ kind: "problem"; fix?: ReactNode; align?: "item" }`, `{ kind: "empty"; align?: "item" }` and `{ kind: "more"; align?: "item" }`. Either draw `item` for `more` and `status`, or don't offer it.
- **Mark:** `{ glyph: true; progress?; still? }` or `{ glyph?: false; name?; ask? }`.
- **Avatar:** `{ people }`, `{ name; seed? }` or `{ dashed?: true }`.

### S7. `kit.mjs`: a literal value merged with a vocabulary is never checked against the ledger
`web/tools/kit.mjs:90-100` (`mergeProp` keeps the first `vocab` and unions `values`) and `:253-256` (`propProblems` returns once it sees a `vocab`, before it looks at `values`).

**Failure:** `--list` shows that `Table.columns.width` merges to `{ vocab: "Width", values: ["fill"] }`. The value is harmless today, since `fill` is in Width. But if a case typed `width: "fill" | "half"` sat beside the `width: Width` case, `half` would pass the gate with no reason. The order doesn't matter: `a.vocab ?? b.vocab` keeps whichever vocabulary there is. This is the ledger gate's own promise, that every variant has a reason, and the round-2 merge opened the gap.

**Fix:** In `propProblems`, when a prop has a vocabulary, still check each value that isn't in that vocabulary's literals. `readKit` already collects those as `vocab[name]`, so pass them in. Add a gate test case: a union where one case is a vocabulary and another adds a literal, which must fail without a reason.

### S8. Facts: the "muted icon" rule matches nothing, and the value is styled by its structure
`web/src/kit/Facts.module.css:63-66` (`.fact > dd > svg`) and `:68-73` (`dd:has(> button:only-child)`). `web/src/features/ticket/properties.tsx:28-100` passes `<><Icon/>words</>` as `value`.

**Failure:**
- `Icon` renders `<span class=icon><svg>` (`Icon.tsx:266`), so `dd > svg` never matches. On NW-17 the clock, repo, branch and workflow glyphs are in the full ink, `rgb(15, 15, 18)`, the same as their words. The ledger and the CSS comment both say "each a muted icon and its words". Only Type and Priority look muted, because they read `--type-glyph` and `--priority-on`.
- The `:has(> button:only-child)` rule is a hidden contract on what the screen puts in a fact.

**Fix:** Give `Fact` an `icon?: IconName` and draw it in a kit span coloured `--ink-3`. The value is then its words, or the owner picker. Replace the `:has` rule with an explicit form, for example `Fact.value` as `{ picker: ReactNode }`, or a Select `look` that brings its own padding. Delete the dead rule.

### S9. Kit CSS still styles feature-supplied children by position
- `web/src/kit/Dialog.module.css:46-53`: `.body > *` and `.body > :last-child`. Each child the peek passes becomes a padded, ruled section.
- `web/src/kit/Page.module.css:160-169`: `.split > .body > *`. Each child of a split Page is held to `--w-ticket` and centred.
- `web/src/kit/Notice.module.css:97-99, 113-115`: `.fix :is(a, button)` and `.more > button:first-child` style the screen's Button.
- `web/src/kit/Lane.module.css:23-25`: `.block > :not(.band)` sets `position: relative` on the screen's card.

**Failure:** The brief names this pattern. The layout depends on how a screen happens to nest its JSX:
- A fragment, a wrapper or a `null` changes which element becomes a section, gets the measure or loses its rule.
- A different control in a Notice's fix or `more` loses its alignment.

Round 1 removed Row's last-child rule for this reason. These remain.

**Fix:** Let the kit own the wrappers:
- Dialog takes `sections: readonly ReactNode[]` and wraps each one.
- Page wraps its body's content in one kit measure element, rather than styling `> *`.
- Notice's `more` and `fix` take the action as a prop (`action: { label; run }`) and draw the button themselves.
- Lane wraps `st.content` in its own span.

### S10. Dead code: a column case, three widths and a class lookup that nothing uses
- **`give`:** `web/src/kit/Table.tsx:21-28, 49` has a whole `Track` case and a branch of `track()`, and no screen or sheet writes `give: true`.
- **Three Width values:** `web/src/kit/vars.ts:31-44` has `fit`, `line` and `dot` (with their `WIDTH` entries). Width's only reader is a Table column, and no column uses them. The ledger gives each a use it doesn't have (`ledger.json:1116-1119`, and Length's `line` and `dot` at `:1132-1134`).
- **Head's tone class:** `web/src/kit/Head.tsx:79` has `s[tone]`, but `Head.module.css` has no `.neutral`, `.you` or `.done`. The tone goes to Badge only.

**Fix:**
- Delete the `give` case.
- Delete `fit`, `line` and `dot`, with their tokens if those go unused, and their ledger reasons. Re-add one when a column needs it.
- Drop `s[tone]`.

---

## nit

- **N1. The Composer's padding no longer focuses the text, and its comments say it does.**
  - Where: `web/src/kit/Composer.module.css:10, 16-23`, `Composer.tsx:21`.
  - Failure: the label now fills only the box's content area. The 12px left padding and the 6px top and bottom are the `div`'s. A click 5px inside the left edge leaves focus on `<body>`, measured on NW-17. Round 1 had verified that the whole box focused the text.
  - Fix: move the padding from `.compose` to `.text`, and hang Send in the box, or give Send its own margin.

- **N2. Avatar's reasons still say rows draw neutral faces.**
  - Where: `ledger.json:42` ("a neutral disc with initials in rows, heads, pills and pickers … on their identity hue in the conversation") and `web/src/kit/Avatar.tsx:34` ("a neutral disc in rows").
  - Failure: both contradict `md`, which is the person's hue (`Avatar.module.css:26-31`, and `ledger.json:54` as fixed). This is C8's third pass.
  - Fix: say what's true: neutral in pills (`sm`) and on teams (`mid`), the person's hue elsewhere.

- **N3. FormRow's description rule is written twice, and its context can disagree with itself.**
  - Where: `described.ts:12-16` carries both `attrs` and the words they were built from. `TextArea.tsx:41-53` rebuilds the same `describedby` and `invalid` logic for its copies that `FormRow.tsx:25-29` builds.
  - Fix: carry `{ id, note?, problem? }` in the context, with one `describe(id, note, problem)` that both call. The popped area calls it with its own id.

- **N4. A measured Segmented in a FormRow is described twice.**
  - Where: `Segmented.tsx:216` puts the row's description on the group, and the overflow trigger reads it again through `Choice` (`choice.tsx:52`).
  - Fix: let only one of them carry it. The group is enough.

- **N5. `title` equal to the accessible name is read again as the description.**
  - Where: `Toggle.tsx:20-22`, icon-only `Button` (`Button.tsx:98`), `Drag.tsx:29-30`.
  - Failure: Chrome gives "Resume session" the description "Resume session", and "Edit Prompt in the whole window" the same.
  - Fix: drop `title` where the label is on screen (Toggle in a FormRow). Elsewhere accept it, or say something more in the title.

- **N6. The search box's "/" keycap is read as stray text** after the searchbox (`Field.tsx:74`). Fix: mark it `aria-hidden`, and put `aria-keyshortcuts="/"` on the input.

- **N7. Words that say less, or other, than the code:**
  - `ledger.json:121`: Button.size says "V1's four heights", but there are three.
  - `ledger.json:483`: Lane.edit still states the loop rule, which is now the screen's (`noGate`, a field of `stages`).
  - `Popover.module.css:1`: "Menu, Select and Segmented's overflow draw it". Menu is gone, and Frame's account sheet draws it.
  - `Meter.module.css:44`: "an agent Card is its containing block". Round 2 corrected this to the summary in the ledger and in Card.tsx, but not here.
  - `Text.tsx:21`: `as` says "code for JQL and paths", but `code` is a variant, not an element.
  - `Card.tsx:11`: a 120-column comment line among 100-column ones.

- **N8. `Length` copies Width's ten reasons word for word** (`ledger.json:1129-1143`). The two lists will drift. Fix: have `kit.mjs` take a narrowed vocabulary's reasons from the one it narrows, so the ledger holds only Length's own `why`. Or type `min` and the hug width as Width, and reject `fill` and `fit` in `track()` by its type.

- **N9. Focus-ring offsets vary.** The base is a 2px offset (`base.css:39`). Chip's remove and Lane's gate use 0 (`Chip.module.css:125`, `Lane.module.css:141`). Form boxes, Select's field and Page's crumb use 1px (`Form.module.css:20`, `Select.module.css:42`, `Page.module.css:65`). List rows use -2px. Each may be deliberate, but nothing says why. Fix: two named offsets, outside and inset, as tokens.

- **N10. Optional props reject `undefined`, so screens spread.** `{...(x ? { note: x } : {})}` appears about 15 times: for example `StageFields.tsx:114, 140`, `IntakeView.tsx:163-164` and `QueueView.tsx:96-102`. Fix: where "not given" and `undefined` mean the same thing, type the kit's optional props as `?: T | undefined`. That is FormRow's note and problem, Head's count and note, and Page's context and middle.

- **N11. Card and Row each carry their own `Hit` and an identical `openOnClick`, and the two have already drifted.**
  - Where: `Card.tsx:61-80` and `Row.tsx:55-74`. Row's button is still the 1px clipped one (`Row.module.css:31-40`); Card's is the full box.
  - Fix: one internal module holding the pointer rule (which targets count as the card's or row's own controls) and the button. Give Row the inset box too.

- **N12. `Drag` without `onClick` is a focusable `role="button"` that does nothing** (`Drag.tsx:15, 24-36`). Fix: make `onClick` required, since the ledger calls it the alternative to dragging.

Left as the round-2 notes left it: the empty lane's dashed ring on All teams.

What remains is not negligible. The ten should-fixes are each small, but S1, S2 and S3 are keyboard and assistive-tech defects on shipped screens, and S4 to S7 let bad states be written or slip past the gate.

Verdict: another round

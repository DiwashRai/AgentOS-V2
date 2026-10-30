# project-teams: gaps

Reference: `linear-bar/13-docs-02-projects.png`, crop `[96, 96, 2784, 1799]`. The crop runs from the
window's top-left corner to the image's right and bottom edges. The window runs on past both
edges. Its content doesn't: Linear's update card ends at about x 855 and its teams popover at 859,
both inside the crop's 870 CSS width. So the twin renders at the crop's own size, with no `view`
or `at`.

Scale is 3.20. Menu-row cap heights are 30.4 ref px: "E" of EPD 30.39 and 30.43, "M" of
Marketing 30.40, "F" of Feature Requests 30.32, "D" of Data Solutions 30.72. 30.4 / 9.5 = 3.20.
Two pitches confirm it: the menu rows are 102 ref px apart (32 CSS) and the property rows 127.5
ref px apart (40 CSS). The earlier 3.23 overstated the cap.

Theme is Carbon (`dark`): its #171615 page is the nearest ground to Linear's #121212 (Midnight is
#08090b). All sizes below are CSS px at 3.20. Linear's colours were read from the reference and
ours from twin.png.

## What couldn't be drawn at all (content)

- **Two pickers open at once.** Linear has a lead-team submenu open beside the teams picker, at x
  317 to 508 and y 169 to 339. It holds "Change lead team…", the "Project teams" label, Data
  Solutions DS ✓ highlighted, EPD EPD, and Marketing MAR. The kit's pickers are Base UI
  comboboxes, and opening one closes the other, so the twin shows only the larger one (Change
  teams). Nothing is drawn in the submenu's place. What follows from that:
  - **What Linear hides under it is drawn.** Two glyph tops show over the submenu's top edge: a
    round peak at x 327.5 and a flat ~7px top at x 397 to 404. They match Linear's default
    project row, so the row has **Lead** (`Avatar size="sm" dashed` + "Lead", the empty face
    our screens use for Unassigned) and **Target date** (`icon: "clock"` + "Target date").
    Linear's date glyph is probably a calendar (flat top); the kit has no calendar Icon, so it's
    the clock our screens use for dates ("Opened"). These chips put the teams chip at x 558
    (Linear's pill: 509). Our chips are wider than Linear's (see Facts below), so it can't get
    nearer. Its picker then sits at x 558 to 863, against Linear's 508 to 859. The right edges
    nearly meet. The popover keeps its start alignment because it fits inside the crop: Base UI
    flips it unless x + 304 + 5 (its default collision padding) ≤ 870. At 3.23 (862 wide) it
    didn't fit, and it flipped to end-align at x 410, over the card's text.
  - **The initiative's name shows in full.** Linear cuts "Forge Communication Stra" at the
    submenu's edge. Ours shows "Forge Communication Strategy", with the tail ("tegy") inferred.
    In the submenu's area, ours shows those two chips, the end of the name, and bare page.
  - **The update card reads "Write first project update" in full.** Linear's teams popover cuts it
    after "upd". Ours starts 50px further right, past the text's end (x 533).
- **Select (the teams chip, closed): one name only.** Linear's chip names every chosen team ("Data
  Solutions, EPD, MAR"). Ours names the current option alone ("Data Solutions"): Select's trigger
  draws `options.find(value).label`, and an option's label is also its row's name. Used instead:
  value `DS`, so the chip reads "Data Solutions". Ours is 154px wide with its chevron, against
  Linear's ~197. Our chip starts 50px later and is ~43px shorter, so the "…" lands 11px right of
  Linear's (dots at x 731 vs 719).
- **Select (open): single choice, no checkboxes.** Linear's list is a multi-select. A 16px rounded
  checkbox leads each row. EPD and Marketing are checked in the accent (~#5a68cd) with a white
  tick. The lead, Data Solutions, is checked in a disabled grey (~#616264). Unchosen rows keep
  the empty column. Ours has no checkbox column, and only the current option is marked, by a tick
  at the row's far end in `--you-text`. Choice (internal) has no `multiple` and no leading
  control slot. Putting a Checkbox in `Option.aside` would nest a labelled form control inside an
  option, so that wasn't done.
- **Select (open): no groups or section labels.** Linear splits the list under "Your teams" (12px,
  #afafb1, its own 28px line) between Marketing and Engineering Development & Delivery. Ours is
  one flat list, so the label is dropped. Every row from Engineering on sits one row (32px) higher
  than Linear's, and the sheet ends at y 498 instead of 531. `Popover.module.css` has a `.head`
  (the account sheet's section label), but neither Select nor Choice can place one between
  options.
- **Select (open): nothing at the row's end but the tick.** Linear's lead row ends on a "▸"
  submenu caret. Ours puts the tick there, because DS is the current value.
- **Select (open): no shortcut hint in the filter.** Linear's filter ends with "P then T": two
  keycaps (~22px boxes on a hairline) with a muted "then" between them. Choice's input has no
  trailing slot. `Badge kind="kbd"` exists but can't be placed there. Dropped.
- **Select (open): the aside is plain text.** Linear's "Lead" after Data Solutions is a boxed tag
  (a hairline box ~24px tall, r ~4, muted words). `Option.detail` is plain muted text. Used: detail
  "Lead" (and each other team's key as its detail).
- **Tooltip.** Linear shows a hover tooltip ("Data Solutions", a small light box under the row's
  name). The camera parks the pointer, so there's no hover. Dropped.
- **Team icons.** Linear gives each team its own coloured glyph, ~16px with no disc: a blue
  database (Data Solutions), a gold emoji face (EPD, Marketing), a blue robot (Engineering…), a
  blue gift (Ent), a green storefront (Feature Requests), a gold contact card (Growth/Startup) and
  a gold folder (Operations). The kit has no team icon. Used: `face: true`, so an Avatar draws
  initials on a hue disc: 20px in the picker sheet, 18px on the chip. Each option's id is picked so
  the hue is the nearest of the five `--id-*` to the icon's colour (blue → blue, green → teal).
  There's no gold or yellow, so the gold teams are drawn rose.
- **Initiative glyph.** Linear's is an orange open ring with an up-pointing arrowhead in its gap.
  The kit has none. Used: Facts' muted `icon: "loop"`, in grey.
- **Label colour.** Linear's "Wave 1" dot is the label's own blue (#0b89f8). Chip's `dot` takes only
  state hues (neutral, live, you, blocked, done). Used: `dot="you"`, the indigo #5e6ad2.

## Where a kit piece draws differently and no composition avoids it

- **Facts (the property rows):**
  - Label column: Linear's value glyphs start at x 128, 90px after its labels' edge (38). Ours
    start at 152: `--w-fact-label` 104px plus an 8px gap, then the value chip's 8px padding. Every
    row's value is 24px right of Linear's.
  - Chip width: Linear's chips are bare, at about 12px (caps 8.9 against the menus' 9.5), with
    ~17px from one chip's words to the next chip's glyph. Ours are 14px (`--fs-tk`) words, 8px of
    padding on each side and a 10px gap (`--sp-5`), so about 27px between words and glyph. From
    Backlog's glyph to the teams chip, Linear's four chips span 381px and ours 406. That 25px,
    plus the label column's 24, is why our teams chip starts at 558, not 509.
  - Type and ink: Linear's labels are about 12px #aaaaaa and its values about 12px #ffffff. Ours
    are 14px (`--fs-4`, `--tk-label` #7d7a77) and 14px (`--tk-ink` #d7d5d2). Our labels are
    dimmer than Linear's, and our values bigger and greyer.
  - Pitch: Linear's rows are 40px apart. A Facts row is 30px (`--h-fact`). Used: `Stack gap={5}`
    between the rows, giving 40px. Every row's caps sit 1.4px above Linear's, the same offset as
    the description below.
  - A bordered pill as a value: Linear's "Wave 1" pill brings its own padding, so its edge sits
    7.5px left of the values' glyphs (x 120.6 vs 128). A Facts value pads its content by 8px, so
    the Chip went in the `picker` slot (no padding, no hover), which places it 8px left of our
    glyphs as Linear does.
- **Avatar dashed (Lead).** Our dashed ring is 16px (`size="sm"`; md is 18) in `--face-dashed`.
  Linear's lead glyph is hidden, apart from a ~14px round top.
- **Mark (Backlog's status).** Linear: a ~13px ring of round dots in the status's own colour
  (orange). Ours: `Mark kind="queued"`, a 14px dashed ring in `--ink-3` grey. Mark has no
  per-status colour and no dotted form. Next to Lead's dashed ring, the two read alike in ours.
- **Icon "normal" (No priority).** Linear's three dashes span ~14px in a mid grey. Ours span ~9px of
  a 12px box in `--priority-none`, smaller and fainter.
- **Field look="title" (the name).** Linear: ~24px (cap 17.7), 600, white. Ours: 28px
  (`--fs-ticket`, cap 19.9), 600, in a 41px box. Its baseline sits 1.6px above Linear's, and the
  name runs 306px against Linear's 251. The summary under it sits 2.7px lower than Linear's, even
  with no gap between the two fields.
- **Field look="lead" (placeholders "Add a short summary…", "Add description…").** Same size as
  Linear's (caps 10.6 vs 10.9, so ~15px), but Linear's are a dim #636363 / #666666. Ours are
  `--ink-3` #a9a5a1, much brighter. Placeholders and labels swap brightness: Linear's labels are
  brighter than its placeholders, and ours are the other way round.
- **Text tone="3" (Resources' "Add document or link…", Customers' "Add customer request").**
  Linear's are #666666 with the "+" in the same grey. Ours are #a9a5a1, the dimmest Text tone, so
  these empty-state prompts read like values.
- **Button (the project icon tile).** Linear: a 36px tile filled #37383a with no edge, radius ~8,
  and a light-grey cube glyph ~20px across. Ours: `Button icon="skills"`, 34px (`--h-control`),
  `--ctl` #292827 with a hairline and a lit-top shadow, radius 6, and a 16px cube glyph (~13px of
  ink). Neither the tile's size nor the glyph's size can change.
- **Select trigger (the teams chip, open).** Linear: a fully round pill, ~27px tall, filled
  #232325 (about 17 levels over its page), with no chevron. Ours: a 28px chip at radius 6
  (`--r-2`), filled `--chip-on` #2a2928 (about 19 over ours), ending on a chevron.
- **Popover surface.** Linear: #212123, about 15 levels over its #121212 page, with a light top
  hairline. Its highlighted row is #323136. Ours (Carbon): `--pop` #312f2e, about 26 over our
  #171615 page, with the highlighted row (`--pop-hover`) at #403d3c. The whole sheet is a clear
  step lighter than Linear's.
- **Popover filter.** Linear's filter line is 36px with its words at 13px. Ours is 40px
  (`--h-pop-find`). The row pitch matches (32px in both).
- **Popover width and insets.** Linear's sheet is 351px wide: checkbox at 14px, icon at 44px, names
  at ~62px from its edge. Ours hugs to 304px: face at 13px, names at 41px. With no checkbox
  column and no "P then T" hint, nothing widens it.
- **Popover asides (team keys).** Linear's keys are #6d6d6f. Ours (`--pop-aside`) are #878481. The
  filter's placeholder goes the other way: Linear's is #b2b2b4, brighter than its keys, while ours
  is the same `--pop-aside` #878481.
- **Chip tone="edge" ("Wave 1").** Linear's pill is 24px tall, with 13px words, an ~8px dot and a
  hairline. Ours is 20px (`--h-list-chip`), with 12px words (`--fs-2`) and a 7px dot.
- **Surface level="sheet" (the "Write first project update" card).** Linear: a hairline with no
  fill (it's the page's #121212), 64.7px tall, starting at x 20.3, 16px left of the content's edge
  (it bleeds into the gutter). Ours: `--tk-card` #1c1b1a fill plus a hairline, radius 10, pad 14,
  63.4px tall, starting on the content's edge (x 32). The kit has no way to bleed a block into
  the gutter. Its text's glyph lands 1.3px right of Linear's.
- **Menu ("…").** Linear's "…" is bare grey dots. The kit's Menu always draws its trigger as the
  default filled button (`--ctl` with a hairline and shadow). Used instead: `Button variant="quiet"
  size="sm" icon="more"`, bare at rest, so its menu isn't wired up.
- **Page and Surface (the frame).** Linear's page has no top bar in this view. Page always draws its
  58px bar with a title, so the twin lays out on a bare `Surface level="list" pad={10}`. That
  puts the content's edge at 32px against Linear's 36.6 (tile) / 37.8 (labels): Pad's largest
  step is 32 (`--sp-10`), and the next step down is 24. The page ground is Carbon's #171615
  against Linear's #121212.
- **Stack gaps.** Linear's "Description" caps sit 47px under the card. The gap that puts ours
  level with the rows above (1.4px high, like them) is 46px, past the largest step (`--sp-10`,
  32px). Used: an empty Stack as a spacer inside a `gap={7}` Stack, after the outer `gap={10}`.

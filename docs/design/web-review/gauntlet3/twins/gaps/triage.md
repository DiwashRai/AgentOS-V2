# triage: kit gaps

Reference: `08-docs-09-triage.png`, crop [1015, 305, 1505, 1290] at 3.627 reference px per CSS px
(row-title cap height 34.5 px = 9.5 CSS px; checked against the "Intercom" and "ENG-619" lines,
both 34.4 to 34.5 px). The crop ends just under the fourth row's rule: Linear's fifth row ("Assets
are blurry" / kenneth / 3d ago) is faded almost to the ground by the marketing page, so neither
cut shows it, and the twin doesn't draw it. Theme: Carbon (dark). Linear's ground is a cool
neutral of about (31, 31, 34); Carbon's page is #171615 (23, 22, 21), the nearest of the six but
darker and warmer. All sizes below are CSS px; inks are the brightest 2% of a glyph's pixels.

Composition: `Frame` (its sidebar outside the crop: view 643 x 500, at 228, 0), with `Page`
(title "Triage", the star in `middle`, avatar, filter and display in `action`) over an edge `Table`
with one fill column and four `Row kind="item"` rows. Each row holds a `Stack` of two lines, as
the ticket's Context tab draws its item rows: the title as `Text weight={500} tone="1"` (13 px
medium, Linear's size and weight) with `Badge kind="key"`, then an `Avatar size="sm"` face beside
a `Text tone="3"` name (as a run's "who started it" line does), and the `Age` in `Text tone="3"`.

## Things the kit can't draw

- **Page title's icon**: Linear puts the team's icon before the title, an indigo rocket on an
  18.5 px dark rounded tile at x 25, with the title at x 50. Ours: `Page` has no slot before the
  title (`title` is a string, and `context`/`middle` come after it). I left the tile out, so our
  title starts at the gutter (x 24) where Linear's tile is. The kit also has no rocket glyph and no
  team-icon tile (the Frame's Space tile is the closest thing, and it is internal).
- **Star (favourite)**: Linear has a 13 px outline star, dim (ink about 105 on the 31 ground),
  9.5 px after the title. The kit has no star glyph. I used
  `Button variant="quiet" size="xs" icon="gate"`, a 12 px diamond outline. A quiet square draws its
  glyph in ink-2 (#bdbab6, 189), nearly twice Linear's star, and the glyph lands 20 px after the
  title: `Page`'s 16 px gap plus the 20 px square's 4 px inset.
- **Head avatar**: Linear has a 17.6 px colour photo with a green presence dot at its bottom
  right. Ours is `Avatar` md, an 18 px initials disc. The name is invented ("Ada Park", seed "1",
  the kit sheet's sample, which comes out slate, the most muted of the five hues and the nearest to
  the photo's mid-tone). Avatar has no photo and no presence/status dot.
- **Filter button**: Linear's is icon-only, 35 x 25, with a 1 px dashed outline and no fill
  (the empty "no filters yet" state). Its glyph is a funnel of three centred lines, each shorter
  than the one above, dim (about 114). Ours is `Button size="sm" icon="compact" title="Filter"`,
  a 28 x 28 square with the controls' fill, a solid edge and the lit-top shadow. Its glyph is
  "compact" (four equal lines, which reads as a hamburger menu) in the square's ink-2 (189). The
  kit has no filter glyph. It also has no empty/dashed variant except `blocked`, which means
  "can't do this now"; I didn't use `blocked` for its look.
- **Display options button**: Linear's is 54 x 25, filled barely over the ground ((33, 34, 38) on
  (31, 30, 35)), with a faint edge, a sliders glyph and a chevron, both dim (about 94). Ours is
  `Button size="sm" icon="compact"` with a chevron (`<Text tone="3"><Icon name="chevron"
  label="Display options" /></Text>`) as its child, 54 x 28, glyphs in ink-3 (169). The kit has no
  sliders glyph, and Button has no form for an icon-plus-chevron trigger with no words: `title` on a
  Button with children is only a description, and its icon is aria-hidden. The chevron's `label`
  is what names the button ("Display options" in the accessibility tree), which is a workaround,
  not a kit form.
- **Source logos**: Linear shows Intercom's logo (a 15 px grey rounded square, about 102 to 117)
  and Sentry's logo (a dim purple line mark, about (74, 63, 97)) in the face slot of the second
  line. The kit has no logo or integration mark. I used `Avatar size="sm"` initials discs ("IN",
  "SE"): 16 px neutral grey, so Intercom's reads right, but Sentry's purple is lost (`sm` has no
  hue, and `md` is 18 px and a saturated hue far brighter than Linear's dim mark).
- **People's faces**: Linear uses 16 px photos, greyscale here (cristina about 95, sarah about
  134 on average). Ours are `Avatar size="sm"`, 16 px neutral discs ((68, 67, 65) in Carbon) with
  ink-1 initials "CR", "SA". Same size and same grey register; no photo.

## Places a kit component draws differently and no composition avoids it

- **Page top bar, no rule under it**: Linear rules the head off from the list with a 1 px line
  at y 58, brighter than its row rules (about 49 against 42 on the 31 ground). Our top bar has no
  rule, and an edge Table with `head={false}` starts flush under it. The only ways to get a rule
  there draw something Linear doesn't: the Table's column head (a 32 px grey band with labels), or
  `Page side` (its split rules the body off, but adds a column and moves the bar's buttons over it).
- **Page title size**: Linear's view title is 15 px medium (cap 11 px). `Page`'s title is fixed
  at 20 px semibold (`--fs-6`, 600). Only the crumb form draws a 14 px/500 step, and that form
  adds "Engineering ›" before it.
- **Page top bar spacing**: the action cluster is spaced 8 px apart (`--sp-4`). Linear spaces it
  15 px (avatar to filter) and 10 px (filter to display), and keeps a 14.7 px right inset where
  ours keeps the 24 px gutter (Linear's display button ends at x 400, ours at 391). The bar's
  height, 58 px, matches Linear's exactly.
- **Button heights**: Linear's head buttons are 25 px tall. The kit has 34 (md), 28 (sm) and
  24 (xs, 12 px text; its square is 20 x 20). I used sm (28) as the nearest that keeps the filter
  and display buttons the same height. An icon-only square can't be wider than it is tall
  (Linear's filter is 35 x 25).
- **Control fill**: Linear's display button is filled only about 3 levels over its ground. The
  kit's `--ctl` in Carbon is (41, 40, 39) on the (23, 22, 21) page, 18 levels over, with a lit top
  and a drop shadow, so both head buttons stand out as solid blocks where Linear's recede.
- **Row item, vertical rhythm**: Linear's triage row is 74.15 px with the rule full width. Its
  title cap top sits 17.1 px under the rule above (baseline about 26.6), the source line's
  baseline 59.0 px under it, and the row ends 15 px under that. `Row kind="item"` has fixed 14 px
  top and bottom padding, and the title line is 20 px tall because `Badge kind="key"` is
  `--h-chip` (20) tall. With a Stack gap of 8 the row is 73.4 px (14 + 20 + 8 + 17.55 + 14): the
  title cap top lands 19.8 px under the rule (baseline 29.4), the source baseline 55.3, so the two
  lines sit 26 px apart where Linear's are 32. The source line already sits at the padding's floor,
  so it can't come lower without growing the row; Linear's spacing would make it about 80 px. The
  rows drift 0.8 px per row against Linear's (rules at 131.3, 204.4, 278.3, 351.4 against 132.2,
  206.2, 280.4, 354.5); the next gap step (10) would drift 1.4 px per row the other way. The
  `triage` kind is no better: 52 px tight, 6 px padding, and its rule is inset between the
  gutters, not full width as Linear's is.
- **Row rule contrast**: Linear's row rules are about 10 levels over its ground (42 on 32). The
  kit's `--list-rule` in Carbon is about 23 over the page (45 on 22), twice the contrast, so our
  list reads more ruled.
- **Row insets**: an edge Table puts row content at 24 px both sides. Linear's is 22.3 px on the
  left and 23 px on the right.
- **Title width**: at the same 13 px medium, Geist runs narrower than Linear's Inter: "Website
  mobile menu needs improvements" is 260 px against Linear's 270. The Sentry title still fits whole.
- **Key ink**: Linear's key (ENG-619) is a dim grey (about 102), clearly under the source
  name (about 135). `Badge kind="key"` draws ink-3 (#a9a5a1, about 169), the same ink as the
  meta line and much brighter than Linear's.
- **Meta and age ink**: Linear's source name is about 135 and its age about 95: the age recedes
  as far as the key does. Ours are both `Text tone="3"` (ink-3, about 169), so the second
  line reads brighter than Linear's and the age doesn't step back. The kit's text inks have no
  step under ink-3 (`--tk-label`, ink-3 at 70% over the page, exists but no Text tone reaches it).
- **Age alignment**: Linear's age sits about 2.5 px above the source name's baseline. Ours shares
  the name's baseline, as `Stack align="center"` lays the line out.

## Not kit (for the judge)

- Linear's window fades out under the marketing page's gradient at its right side, and its fifth
  row is all but gone; the crop stops above that row. Ours is drawn at full strength.
- The crop stops at Linear's split (x 2520). The empty detail pane to its right is faded and
  isn't drawn.

# display: gaps

Twin of `14-docs-08-display-options.png` (Linear's Display button with its options popover open).
Crop `[0, 140, 2624, 2108]`, scale 3.95 (cap height 37.5 ref px on "List options", "Display
properties", the pills, the select's "Priority" and the button's "Display"; x-height 28 ref px gives
3.94), theme `dark` (Carbon: page #171615 vs Linear's #101012; Midnight #08090b is further off).
Linear's window runs off the shot's left edge, so the twin is a whole view in the frame at
`view [1200, 534]`, cut at `at [536, 0]`: the sidebar and the view's title fall outside the crop.
CSS px below are the reference's pixels / 3.95, measured from the crop's top-left.

## What the kit could not draw

- **Popover (no component)**: Linear opens a popover of settings (any content) 5px under the Display
  button, its right edge flush with the button's, 308px wide, overlapping the bar's hairline / the
  kit's only popovers are Menu (action rows behind a "…" button), Select and Segmented's overflow
  (a filter field then option rows); none takes a panel of controls, and none can be shown open
  without its own trigger / used a `Surface level="sheet" pad={7}` laid out in the Page body, in the
  third column of a `Stack cols={3}` (the only way to get a ~308px width; it lands at x 331.4 to
  640, Linear's 331.6 to 640), so it sits in flow under the 58px bar: its top is at y 58 (Linear
  37), 12px under the button (Linear 5px).
- **Surface sheet (as a popover's sheet)**: Linear's popover is a lifted layer: fill #1c1d1f on the
  #101012 page (+12 RGB), a lit 1px hairline (~#3c3c3e) with a dark outer ring and a soft drop /
  the sheet is a near-flat card: #1c1b1a on #171615 (+5), a faint `--tk-card-edge` ring, no shadow;
  the kit's popover tokens (`--pop`, `--pop-edge`, `--shadow-pop`) are reachable only through
  Menu/Select/Choice / used the sheet as is.
- **Rule between a panel's groups (no component)**: Linear parts the popover's three groups (view
  and ordering; sub-issues; list options) with full-bleed 1px hairlines at y 229.7 and 281.3, 13px
  of room on each side / the kit has no divider a screen can place (Menu's separator, the
  popover's find rule and a peek Section's rule are internal; Section's rule only draws inside a
  side Dialog) / parted the groups by room alone (`Stack gap={10}`, 32px), so the rows sit where
  Linear's do (within 3px) but the groups read as one column.
- **List / Board choice**: Linear draws two equal tiles 132 x 48, glyph (16px) over the word, the
  chosen one filled (#27282c) on a lit hairline, the other on a hairline with no fill (word and
  glyph muted, #a7a8aa) / Segmented is the kit's single choice, but its chips hug their words and
  take no glyph (only a ticket kind's Mark); Button sets the glyph beside the word, 34px tall, and
  has no pressed state or edge-only variant / used two Buttons in `Stack grow` cells (`default`
  with `compact` for List, `quiet` with `teams` for Board, 8px apart as Linear's): equal widths,
  34px tall, glyph inline, Board with no edge and its word in ink-2 (#bdbab6, brighter than
  Linear's muted #a7a8aa).
- **Select as a settings field**: Linear's Grouping and Ordering pickers are filled boxes 25.6px
  tall (#292c33 on a hairline, 6px round), the value white (#fcffff) at the box's left, a small
  chevron at its far right, fixed widths (Status 125px to the panel's edge, Priority 93px beside
  the sort button), both boxes starting on one column / Select's `chip` look is a borderless 28px
  chip hugging its value (value, 8px, chevron) in the inherited ink (ink-2, #bdbab6, in a form as
  in StageFields' FormRows), so each sits right-aligned at the row's end and the two values don't
  share a column; `FormRow` would put them on one column but takes a string label (no glyph) in a
  128px column and leaves their ends ragged / used `Select` (chip) in a `Stack justify="between"`
  row, keeping the glyphs.
- **Toggle chips, many on (Display properties)**: Linear's twelve property pills are toggles, any
  number on: on = filled #2a2d34 on a #33363d hairline, 25.6px tall, ~9.6px padding, 13px text at
  a lighter weight; off = the bare word, muted (#adaeb0) / Segmented is single-choice (one pressed),
  Chip is a read-only 20px tag at 12px / used `Button size="sm"`, `default` for on and `quiet` for
  off ("Links"): 28px tall (rows 32px apart, Linear 29.6; the gap is Linear's 4px), 10px padding,
  weight 500 (stroke ~6.9 ref px vs Linear's ~5.8, so ours read bolder), the off word in ink-2
  (#bdbab6, brighter than Linear's muted). Our pills are wider than Linear's, so at the panel's
  ~16px padding (Linear 16.7) the second row needs 276.4px of a 276px line and "Created" wraps onto
  the third; at `pad={7}` (14px) they wrap as Linear's (4 / 4 / 3 / 1), and every row's words start
  2.5px left of Linear's (346.7 vs 349.6).
- **Glyphs**: Linear's sliders (Display), three thick rounded bars (Grouping), up-and-down arrows
  (Ordering), an up arrow over shortening lines (sort direction), four bars (List), a grid of filled
  rounded blocks (Board) / the kit has no sliders, sort, swap, sort-direction or board glyph / used
  `compact` (four thin lines) for Display, Grouping and List; `loop` (two arrows round a circle,
  the only two-arrow glyph) for Ordering; `up` (a 10px chevron, the button's own ink) for the sort
  direction, since `improvement`, the only up arrow, is a ticket type's mark and draws its type
  square inside the button; `teams` (four outlined squares) for Board.
- **Glyph boxes differ (Grouping / Ordering)**: Linear's two row glyphs share one width, so the
  words start on one column / `compact` is drawn on a 16px box and `loop` on 14px, so with one gap
  "Ordering" started 2px left of "Grouping" / gave Ordering's glyph a 10px gap and Grouping's 8px.

## Where a kit component draws it differently, whatever the composition

- **Page top bar**: Linear's view bar is 40px with a 1px hairline under it across the window, the
  Display button centred at y 19.7 / `--h-top` is 58px with no rule under it, so the button sits at
  y 29 and nothing marks the bar's foot (only Page's `side` column look draws a rule, with a rail).
- **Button (Display, a Page action)**: Linear's is 81.7 x 25.3, a bluish fill (#25282f) with a lit
  top edge, its sliders glyph muted, word white / our screens' Page actions are `md`: 92 x 34 on
  `--ctl` (#292827, neutral), 12px padding, the same muted glyph; its right edge lands on Linear's
  (x 640) but it is 9px taller and 10px wider.
- **Button (square, sort direction)**: Linear's is 25.6 square, a filled box (#292c33) with its
  glyph white / `sm` square is 28px and draws its glyph in ink-2.
- **Toggle**: Linear's track is 22.8 x 15.2 with a knob nearly its height / ours is 28 x 16
  (`--w-switch`, `--h-switch`), longer; the on colour (#5e6ad2) and the white knob match.
- **Text weight**: Linear sets every label in the panel at one weight (stroke ~6.0 ref px), "List
  options" only brighter / Text has 400 (5.6) and 500 (6.9), nothing between; used 400 throughout
  and `tone="1"` for "List options" (500 read clearly heavier than Linear's). The muted labels match
  closely: tone 3 #a9a5a1 against Linear's #abacae.
- **Control fills' hue**: Linear's controls (button, selects, pills, chosen tile) carry a cool blue
  cast (#25282f, #292c33, #2a2d34) over a neutral popover / Carbon's `--ctl` is a warm neutral
  (#292827), so every control reads a shade warmer and flatter.

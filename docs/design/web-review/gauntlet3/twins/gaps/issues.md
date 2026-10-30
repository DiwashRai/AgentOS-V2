# issues: gaps

Reference: `06-docs-07-select-issues.png`, crop [255, 266, 2625, 1311], scale 3.53 (13px cap height
33.4 to 34 px on "Inbox", "Identify" and "Dropdown"; the 44px row pitch gives 3.54). Theme: midnight
(the nearest ground). Measures below are CSS px. Where Linear's are given, they come from the
reference ÷ 3.53.

Each entry reads: component: what Linear does / what ours does / what was used instead.

## Things the kit had no piece for

- **Frame, the workspace logo**: a white rounded tile holding Vast.craft's round black brand mark / the Space's tile is the accent with the name's initial / the tile with "V".
- **Frame, the team row**: "Engineering" is led by the team's own icon, a white gear on a filled purple rounded tile (about 18px), and followed by a small fold caret (▾) right after the name / a NavItem takes one grey line `IconName`, and no caret after an item's label (only a section title has one) / the `settings` gear as a plain line icon, no caret.
- **Frame, a nested item**: Triage sits indented under Engineering (its icon at about 31px from the sidebar's edge, against 17px for the others) / every item has the same inset / Triage drawn level with the other items.
- **Frame, item counts**: Inbox's "1" and Triage's "39" each sit in a filled rounded box (about 16 to 22px wide, 18px tall, a grey a step lighter than the ground) / a bare 12px muted number at the item's end / the bare count.
- **Frame, sidebar glyphs**: Initiatives (an arc with a solid up-arrow inside), Views (stacked layers), Triage (a circle with ↔ inside) / no such glyphs / `theme` (a circle half filled), `compact` (four lines) and `loop` (two arrows round a circle).
- **Page, the view's name**: "Engineering" at 13px/500 led by the team's purple gear tile, the same row as the tabs / the title is an `h1` at 20px/600 and takes no glyph / the title "Engineering" at 20px. The only way round it is an empty title with the name in `middle`, which leaves an empty heading, so it wasn't used.
- **Segmented, the tab glyphs**: each view tab is led by a 14px glyph: All issues (stacked pages), Active (two overlapping squares), Backlog (a dashed circle), Recent (a bug) / a segment takes only a `MarkKind` glyph at the small 10px size / Backlog got `mark: "queued"` (the dotted ring), and the others have no glyph.
- **Segmented, the separator**: a vertical hairline parts Backlog from Recent / there's no separator between segments / nothing.
- **A filter bar**: Linear has a 39px bar under the header: a filter glyph (three lines narrowing) and "Filter" at 12px, the header ruled off above it by a hairline / no toolbar piece / a quiet small Button (`icon="compact"`, four equal lines, 13px, 28px tall) in a row Stack, with an empty Stack and gap 12 as a spacer so its glyph sits over the list's first column. No hairline under the page's top bar.
- **Icon, medium priority**: two of three bars lit / only `high` (three lit), `low` (one lit) and `normal` (dashes) / `high`.
- **Mark, In Review**: a green ring round a three-quarter green pie / green comes only as done's filled disc with a tick, and the pie forms are run (orange) and wait (grey) / `done`, in the rows and on the group head.
- **Chip, the project glyphs**: a coloured glyph leads each project pill: a green "€" for Currency S…, a salmon phone for Frontend / a lead glyph is a grey `IconName`, so the only coloured lead is a state dot / `dot="done"` (green) and `dot="blocked"` (red-pink).
- **Checkbox without words**: the row's checkbox is a bare 14px box / a Checkbox needs its `label` and draws it, with an 8px gap / `label=""`. The box's 2px top margin, kept for a label's first line, also sets it about 1px low in the row.

## Places where a kit piece draws differently and no composition avoids it

- **Frame, the planes**: the sidebar is the window's darkest ground (9,9,9) and the list sits on a raised panel (16,16,18) with a 1px lit edge (37,37,39) and a rounded top-left corner, inset under the title bar / the main column is flush and the sidebar is the lighter plane (midnight side (15,16,19), page (8,9,11)), ruled off by a hairline / no choice. Every dark theme puts the sidebar a step over the page, the reverse of Linear's.
- **Frame, the sidebar's width**: 239px / `--w-side` is 228px, so the list starts 11px further left.
- **Frame, the head's tools**: search and compose sit at the head's right end (search at about 175px, compose at about 211px). Compose is a 28px rounded square filled a step lighter / the push to the end comes from the face's `margin-right: auto`, so with `me={null}` (Linear shows no face) search and compose sit right after the switcher (about 136 and 168px). Compose is a round hairline ring.
- **Frame, the vertical rhythm**: the head's centre to Inbox's is 39px, the last view to a section label's centre is 43px, and the label to its first item is 28px / 49px, 49px and 26px. Items are 29px apart in both. So our sections sit lower: by the foot of the crop Triage is 16px lower, and the current team view (Linear shows its filled pill's top edge at the crop's foot) falls out of the crop.
- **Page, the top bar**: 40px tall, ruled off by a hairline / `--h-top` is 58px with no rule. With the header rows aligned (`at` y = 9), everything under the bar sits about 9px lower than it would.
- **Segmented, the chips**: every tab is a 24px chip on a hairline (about (40,40,44) on the panel) with radius 6, unpressed ones unfilled, the pressed one filled / 28px chips, bare words with no edge but on the pressed one (filled, on `--chip-on-edge`), radius 8.
- **Head, the group band's tint**: In Review's band is the status hue washed into the panel ((23,27,28), a green cast) and 39px tall / one neutral `--list-band` for every group ((20,20,24) on midnight), `--h-group` 36px.
- **Head, the glyph's column**: the group's glyph sits over the rows' priority column (about 33px in from the panel), because Linear hangs the row checkbox in the gutter / the glyph sits on the rows' first cell, which here is the checkbox column. So it lines up with the checkboxes, 30px left of the priority bars it lines up with in Linear's.
- **Row, the selection checkbox**: Linear's checkbox sits in the row's left gutter (about 8px in), outside the columns, so priority, key, glyph and title are at the same x with or without it / a Row's cells can only sit on the columns, so the checkbox takes a 20px column plus a 10px gap and unselected rows carry an empty first cell. The row content starts 30px further right than the group glyph.
- **Row, height**: 44px rows / `kind="line"` is fixed at `--h-line` 36px (`item` is 44px and up but adds a hairline and 14px padding, which Linear's rows don't have). So the six rows end about 43px above the crop's foot, with bare page under them, where Linear's sixth row runs off the bottom.
- **Row, the selected wash**: an indigo wash (27,29,52) and an indigo checkbox (94,108,209) / `--list-open` is the theme's own accent: midnight's royal blue gives (12,22,42) and a #2563eb box. The hue follows the theme, not Linear's indigo.
- **Row, a fill column's "rest"**: for a row with fewer cells, the last cell ends up in the last column only (`grid-column-end: -1` with an auto start spans one track), not across the rest as Row's doc says. A title in a row without a project needs an empty fourth cell and a `hug` project column.
- **Icon, priority size**: the bars are drawn in about a 13px-wide box, and "no priority" is three 3px dashes / a 12px box with bars about 9px wide, and smaller, dimmer dashes.
- **Badge key, the baseline**: the key's caps sit level with the title's / Badge's `line-height: 1` box puts "ENG-139" about 1px lower than the title Text beside it.
- **Chip in a row, size**: the pill is 26.5px tall, its hairline (45,44,50), with about 12px of padding before a 14px glyph / `--h-list-chip` is 20px, with 6 to 8px padding and a 7px dot.
- **Row end, ENG-139's pill**: Linear's ENG-139 has a pill starting about 2px before the crop's right edge (a sliver of its border shows) / with hugging, right-aligned pills, ours would need a chip under 8px wide to land there / left out.

## Content notes

- ENG-786's title is written as Linear shows it, "Integrate internationalization (i18n) supp…", with the ellipsis in the text. Our row has room for more, and the rest of the title isn't known.
- The project pills read "Currency S" and "Frontend", as far as the crop shows them. The current team view under Triage is named "Issues" (Linear's label is cut off), and it falls below our crop.
- "Recent" is the last tab's visible word. Linear's runs on past the crop (one more letter's stem shows). Ours is narrower and ends inside the crop.

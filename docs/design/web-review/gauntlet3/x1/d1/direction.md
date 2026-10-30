# Flat: the direction on a page

Flat and quiet. No shadows, almost no lines. Surfaces are told apart by room and by small steps
of tone. One accent, and only for what you can act on or what is selected. Type carries the
hierarchy, through its size, weight and ink, so nothing needs a box round it to be read.

## Principles

1. **Two planes.** The *ground* runs under everything and holds the sidebar. The *sheet* (the main
   column) is set into it with an 8px inset (`--inset`) and a 12px corner, with no edge and no
   shadow. A view lies flat on the sheet. The sidebar's head sits level with the sheet's top bar,
   because the sidebar carries the same inset at its top.
2. **Tone, not lines.** Anything that is an *object* is a tile of tone on the sheet (`--tone-2`):
   an agent at work, a board card, the run card, a workflow stage. It takes one step more
   (`--tone-3`) under the pointer. A *zone* is a lighter step (`--tone-1`): the strip at a scrolling
   list's foot. A *rail* beside the body (Talk, the workflow editor's Library) is a full-height
   column of `--tone-2` with no rule. Things that lay over any surface are see-through fills
   (`--fill-1/2/3`): a hover, a control at rest, a pressed chip, the open row.
3. **A line only where it is a picture.** The stepper's bars, meters, the lane's axis and a loop's
   bracket keep their lines. So does a popover, the one layer that floats, with a single hairline
   (`--edge`). There are no rules between rows, under heads, under the top bar or across the tabs.
   The two dashed outlines left (a blocked button, a switched-off stage) mean "nothing here now".
   A selected stage is ringed in the accent.
4. **Room does the grouping.** Groups part by `--group-gap` (20px) above a 15px semibold heading,
   never by a band. List rows are unruled. Their hover or open wash is a rounded patch that
   reaches 10px past the words (`--list-bleed`), so text never sits on a patch's edge.
5. **One accent, restrained.** `--you` (indigo on Paper, Mist and Carbon, royal blue on Midnight,
   teal on Harbour, orchid on Plum) is used for: the primary button (Approve), your move's glyph,
   count and counter, the current view's glyph in the sidebar, the current tab's bar, checks,
   switches, gates waiting on you, and focus. The open row is *not* coloured: it and its expansion
   form one neutral panel (`--list-open: var(--fill-2)`). The state hues (orange running, red
   blocked, green done) appear in glyphs, meters and dots. Their words stay in ink.

## Palette (tokens.css)

- Paper (light): white sheet (`--page`), ground `ink 4.5%` over white. Inks are `#111113`,
  `#3f3f46` and `#66666f`. Tones step by `2.5% / 4.2% / 6.5%` of ink, and fills by
  `3.5% / 5.5% / 9%`.
- Carbon (dark): a warm graphite sheet `#1c1b1a` over a ground 34% black under it. Tones step by
  `3.5% / 5.5% / 8.5%` of the theme's wash, and fills by `4.5% / 7% / 11%`. Midnight, Harbour and
  Plum set their own sheet, wash and accent on the same ladder. Mist sets a cool ground and
  slate inks.
- A new colour is always a `color-mix` of the steps, never a raw neutral.

## Type

Geist at 400, 500 and 600 only. Five levels of the hierarchy:

- View title: 24px/600, tracking -0.02em. It is the bar's one anchor. The context and counters
  after it drop 4px onto its baseline.
- Group or section heading: 15px/600 in ink-1. Its count follows in ink-3 (the accent only for
  your move), and its note follows in 12px ink-3.
- Row title: 13px/500 in ink-1. A settled row (done or closed) recedes to ink-2. A tile's or
  card's title is 14px.
- Body: 14px with a line height of 1.55.
- Meta, keys, column labels: 12 to 13px in ink-3. Column labels sit quietly over the rows with
  no band.

The ticket's title is 28px/600 and its lead is 15px in ink-2.

## Surfaces and controls

- Buttons are fills, never edges. The default is `--ctl` (fill-2), with a step firmer on hover.
  The primary is the accent's one solid fill with white on it. A quiet button has no fill until
  hover. A blocked button is a dashed outline in muted ink.
- Fields and the search box are wells of fill-2 with no edge. Focus draws the accent ring. On a
  tone rail, the composer is a well of the sheet's own colour (`--well`): white on Paper, the
  darker sheet on the dark themes.
- Chips are flat fills (pills inside rows and cards), with muted words led by a state dot.
- Popovers use the sheet's colour on the light themes (a step lighter on the dark ones), with one
  hairline, no shadow, and one lit row.
- Dialogs: the peek is a sheet at the right edge over a scrim (the dimming is the lift). The
  full editor is the sheet itself, lifted over the window on the scrim.

## Density

Rows are 36px (a line) or 52px (a triage row). Gutters are 32px. Tiles have 10-16px of
padding (a board card is tight, an agent's tile roomy) and gaps of 10-12px. The rhythm stays dense inside a group and generous between groups.

## The moves on the screens

- **Frame**: the ground, with the sheet inset and rounded. The current view is lit to the
  sheet's own tone, and its glyph takes the accent. New ticket in the sidebar is a round fill.
- **My queue**: no bands. Four zones part by room under 15px heads. The agents are tiles of tone
  in a three-up grid, each with its meter at the foot. Your move's buttons are a tonal Request
  changes beside a solid Approve. Done rows recede to ink-2.
- **Compact**: the same heads, now with folds. The open row and its expansion form one neutral
  panel. The key hints and totals sit in a tone strip at the sheet's foot, and rows fade out
  above it.
- **Intake**: each query's run is headed by its key, name and count, with no band and no row
  hairlines. The face column carries the fold chevron, the empty ring and the problem dot.
- **All teams**: no lanes and no column rules. Each repo is a heading, and under it the stage
  columns hold tiles of tone straight on the sheet. An empty stage is bare sheet. The legend
  sits in the foot strip.
- **Ticket**: the run card is a tile of tone with its now-row a step deeper. The tabs have no
  rule. Talk is a full-height rail of tone, with the composer as a white well at its foot.
- **Library and editors**: column labels over unruled rows and a foot strip. Documents have no
  rules between their parts. Stage cards are tiles on the lane's axis, and the Library rail is
  a tone column.
- **Overlays and controls**: one-hairline popovers with no shadow. The peek and the full editor
  are sheets over a scrim.

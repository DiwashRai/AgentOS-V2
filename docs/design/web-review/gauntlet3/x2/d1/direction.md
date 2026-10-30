# Flat: the direction on a page

Flat and quiet. There are no shadows and almost no lines. Surfaces are told apart by room and by
small steps of tone. One accent is used, and only for what you can act on or what is selected. Type
carries the hierarchy through its size, weight and ink, so nothing needs a box round it to be read.

## Principles

1. **Two planes.** The *ground* runs under everything and holds the sidebar. The *sheet* (the main
   column) is set into it with an 8px inset (`--inset`) and a 12px corner, with no edge and no
   shadow. A view lies flat on the sheet. The sidebar's head sits level with the sheet's top bar.
2. **Tone, not lines.** An *object* is a tile of tone on the sheet (`--tone-2`): an agent at work,
   a board card, the run card, a workflow stage, a panel (`Surface level="sheet"`). It takes one
   step more (`--tone-3`) under the pointer. A *zone* is a lighter step (`--tone-1`): the strip at
   a scrolling list's foot. A *rail* beside the body (Talk, the workflow editor's Library) is a
   full-height column of `--tone-2` with no rule. Anything that lays over a surface is a
   see-through fill (`--fill-1/2/3`): a hover, a control at rest, a pressed chip, the open row.
3. **A line only where it is a picture.** The stepper's bars, meters, the lane's axis and a loop's
   bracket keep their lines. A popover, the one layer that floats, has a single hairline (`--edge`,
   ink 15% on light and 16% of the wash on dark, firm enough to hold its edge on a white sheet) and
   no shadow. There are no rules between rows, under heads, under the top bar, across the tabs or
   between a document's blocks. The dashed outlines left (a blocked button, a switched-off stage)
   mean "nothing here now".
4. **Room does the grouping.** Groups part by `--group-gap` (20px) above a 15px semibold heading,
   never by a band. List rows have no rules. A row's hover or open wash is a rounded patch that
   reaches 10px past the words (`--list-bleed`). Selected rows that follow one another join into a
   single patch.
5. **Dense where it is a board.** A grouped list that scrolls in its own surface (Compact) runs a
   step tighter: 32px lines, 28px heads, 12px above each head (`--*-dense`). The whole board, every
   group from Needs you to Done recently, then stands above its foot strip. The fade at the list's
   end is only 10px, so nothing reads as hidden under the foot.
6. **One accent, restrained.** `--you` is indigo on Paper, Mist and Carbon, royal blue on Midnight,
   teal on Harbour and orchid on Plum. It marks the primary button (Approve, Save), your move's
   glyph, count and counter, the current view's glyph, the current tab's bar, checks, switches,
   gates waiting on you, and focus. A *blocked* primary keeps its place as the primary: a soft wash
   of the accent (`--you-soft`, 13%) with its words in `--you-text`, so a not-yet-lit Save still
   outweighs a dashed Discard. The open row is not coloured: it and its expansion form one neutral
   panel. The state hues (orange running, red blocked, green done) appear in glyphs, meters and
   dots, and their words stay in ink.

## Palette (tokens.css)

- **Paper** (light): a white sheet (`--page`) on a ground of ink 4.5% over white. The inks are
  `#111113`, `#3f3f46` and `#66666f`. Tones step by `2.5% / 4.2% / 6.5%` of ink and fills by
  `3.5% / 5.5% / 9%`.
- **Carbon** (dark): a warm graphite sheet `#1c1b1a` on a ground 34% black under it. Tones step by
  `3.5% / 5.5% / 8.5%` of the theme's wash and fills by `4.5% / 7% / 11%`. Midnight, Harbour and
  Plum set their own sheet, wash and accent on the same ladder. Mist sets a cool ground and slate
  inks.
- A new colour is always a `color-mix` of these steps, never a raw neutral.

## Type

Geist at weights 400, 500 and 600 only.

- View title: 24px/600 with tracking of -0.02em. It is the bar's one anchor. The context, counters
  and filter chips after it drop 4px onto its baseline.
- Group or section heading: 15px/600 in ink-1. Its count follows in ink-3 (the accent only for
  your move), and its note in 12px ink-3. An AGENTS.md block's name and an editor's section use the
  same heading.
- Row title: 13px/500 in ink-1. A settled row recedes to ink-2. A tile's or card's title is 14px.
- Body: 14px with a line height of 1.55 to 1.6.
- Meta, keys and column labels: 12 to 13px in ink-3, with no band.
- The ticket's title is 28px/600, and its lead is 15px in ink-2.

## Surfaces and controls

- Buttons are fills, never edges. The default is `--ctl` (fill-2), a step firmer on hover. The
  primary is the accent's one solid fill with white on it. A quiet button has no fill until hover.
  A blocked button is a dashed outline in muted ink. A blocked primary is the accent's soft wash.
- Fields and the search box are wells of fill-2 with no edge. The bar's search is 240px
  (`--w-search`), which leaves the filter chips room to show every state up to Running. Focus draws
  the accent ring. On a tone rail the composer is a well of the sheet's colour (`--well`).
- Chips are flat fills with muted words led by a state dot.
- Popovers take the sheet's colour on the light themes and a step lighter on the dark ones. They
  have one hairline, no shadow and one lit row.
- Dialogs: the peek is a sheet at the right edge over a scrim (the dimming is the lift). The full
  editor is the sheet itself, lifted over the window on the scrim.
- Documents (an item editor): each markdown sheet's height is set by its read text, not by its
  hidden mono source, so every block ends with the same room under its last line (16px plus the
  paragraph's 8px). The blocks part evenly by room under 15px heads.

## Density

Rows are 36px (a line), 32px (a line on a scrolling board) or 52px (a triage row). Gutters are
32px. Tiles have 10 to 16px of padding and gaps of 10 to 12px. The rhythm is dense inside a group
and generous between groups. A board view is the exception: it trades some of the room between
groups for showing every group at once.

## The moves on the screens

- **Frame**: the ground, with the sheet inset and rounded. The current view is lit to the sheet's
  own tone, and its glyph takes the accent. New ticket in the sidebar is a round fill.
- **My queue**: no bands. Four zones part by room under 15px heads. The agents are tiles of tone
  in a three-up grid, each with its meter at the foot. Your move's buttons are a tonal Request
  changes beside a solid Approve.
- **Compact**: the dense board. Every group and all 16 open rows fit over the foot strip, which
  holds the key hints and totals. Every state chip up to Running shows in the bar, and the rest go
  under +3. The open row and its expansion form one neutral panel.
- **Intake**: each query's run is headed by its key, name and count, with no band and no row
  rules. The face column carries the fold chevron, the empty ring and the problem dot.
- **All teams**: no lanes and no column rules. Each repo is a heading, and the stage columns under
  it hold tiles of tone straight on the sheet. An empty stage is bare sheet, and the legend sits
  in the foot strip.
- **Ticket**: the run card is a tile of tone with its now-row a step deeper. The tabs have no
  rule. Talk is a full-height rail of tone with the composer as a well at its foot.
- **Library and editors**: column labels sit over rows with no rules, above a foot strip. Save is
  always the accent: solid when there is something to save, a soft wash when there isn't, beside a
  dashed Discard. The AGENTS.md blocks part evenly by room. Stage cards are tiles on the lane's
  axis, and the Library rail is a tone column.
- **Overlays and controls**: popovers have one firm hairline and no shadow. The peek and the full
  editor are sheets over a scrim.

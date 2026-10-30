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
3. **A control at rest shows a fill.** Buttons, fields and pickers wear the faintest fill even at
   rest, so what can be changed reads as a control without an edge: a picker's chip (an owner, a
   runtime, a model) is `--fill-1`, a step firmer (`--fill-2`) on hover and firmer again
   (`--fill-3`) while open. Plain property values stay bare, so the fill alone says "editable".
4. **A line only where it is a picture.** The stepper's bars, meters, the lane's axis and a loop's
   bracket keep their lines. A popover, the one layer that floats, has a single hairline (`--edge`)
   and no shadow. There are no rules between rows, under heads, under the top bar, across the tabs or
   between a document's blocks. The dashed outlines left (a blocked button, a switched-off stage)
   mean "nothing here now".
5. **Room does the grouping.** Groups part by `--group-gap` (20px) above a 15px semibold heading,
   never by a band. The room above a head is always clearly more than the pitch between rows, and
   the head sits closer to its own rows than to the group before. List rows have no rules. A row's
   hover or open wash is a rounded patch that reaches 10px past the words (`--list-bleed`).
6. **Dense where it is a board.** A grouped list that scrolls in its own surface (Compact) runs a
   step tighter: 32px lines, 24px heads with 18px open above each (`--*-dense`), so a head reads as
   the start of a block, yet the whole board, every group from Needs you to Done recently, still
   stands above its foot strip, open row included.
7. **A measure for reading lists.** A list that is read row by row and carries only a time at its
   end (Intake's triage) keeps a 960px measure (`--w-triage`), so the age sits across from its
   title instead of a window's width away. Tables with real columns run out to the sheet's edges.
8. **One accent, restrained.** `--you` is indigo on Paper, Mist and Carbon, royal blue on Midnight,
   teal on Harbour and orchid on Plum. It marks the primary button (Approve, Save), your move's
   glyph, count and counter, the current view's glyph, the current tab's bar, checks, switches,
   gates waiting on you, and focus. In a list's line, the strong move is the line's only fill:
   beside a solid Approve, Request changes is a quiet button (words in ink-2, a fill on hover), so
   the title still leads and the eye goes title, then Approve. A *blocked* primary keeps its place
   as the primary: a soft wash of the accent (`--you-soft`, 16%) with its words semibold in
   `--you-text`, beside a dashed Discard. The state hues (orange running, red blocked, green done)
   appear in glyphs, meters and dots, and their words stay in ink.
9. **What runs past the window softens.** A scrolling list fades over its last 10px; the ticket's
   reading column fades over its last 32px into the sheet's foot, so nothing reads as sliced off.

## Palette (tokens.css)

- **Paper** (light): a white sheet (`--page`) on a ground of ink 4.5% over white. The inks are
  `#111113`, `#3f3f46` and `#66666f`. Tones step by `2.5% / 4.2% / 6.5%` of ink and fills by
  `3.5% / 5.5% / 9%`.
- **Carbon** (dark): a warm graphite sheet `#1c1b1a` on a ground 34% black under it. Inks
  `#edebe8`, `#bdbab6`, `#94908b`: three clearly separate tiers, the third dimmed so meta, keys,
  ages and column labels recede under titles (still at least 4.5:1 on a tile and on a popover).
  Tones step by `3.5% / 5.5% / 8.5%` of the theme's wash and fills by `4.5% / 7% / 11%`.
- **Midnight, Harbour, Plum** set their own sheet, wash and accent on the same ladder, each with a
  dimmed third ink (`#868d9c`, `#93a2b5`, `#a38c9f`). **Mist** sets a cool ground and slate inks.
- On the dark themes a property's or section's label (`--tk-label`) is the third ink itself.
- A new colour is always a `color-mix` of these steps, never a raw neutral.

## Type

Geist at weights 400, 500 and 600 only.

- View title: 24px/600 with tracking of -0.02em. It is the bar's one anchor. The context, counters
  and filter chips after it drop 4px onto its baseline.
- Group or section heading: 15px/600 in ink-1. Its count follows in ink-3 (the accent only for
  your move), and its note in 12px ink-3.
- Row title: 13 to 14px/500 in ink-1. A settled row recedes to ink-2. What a row waits on follows
  its title in ink-3. A tile's or card's title is 14px.
- Body: 14px with a line height of 1.55 to 1.6.
- Meta, keys and column labels: 12 to 13px in ink-3, with no band.
- The ticket's title is 28px/600, and its lead is 15px in ink-2.

## Surfaces and controls

- Buttons are fills, never edges. The default is `--ctl` (fill-2), a step firmer on hover. The
  primary is the accent's one solid fill with white on it. A quiet button has no fill until hover.
  A blocked button is a dashed outline in muted ink. A blocked primary is the accent's soft wash.
- Pickers are chips of `--fill-1` at rest. Fields and the search box are wells of fill-2 with no
  edge. The bar's search is 240px (`--w-search`). Focus draws the accent ring. On a tone rail the
  composer is a well of the sheet's colour (`--well`).
- Chips are flat fills with muted words led by a state dot.
- Popovers take the sheet's colour on the light themes and a step lighter on the dark ones. They
  have one hairline, no shadow and one lit row.
- Dialogs: the peek is a sheet at the right edge over a scrim (the dimming is the lift). The full
  editor is the sheet itself, lifted over the window on the scrim.

## Density

Rows are 36px (a line), 32px (a line on a scrolling board) or 52px (a triage row). Gutters are
32px. Tiles have 10 to 16px of padding and gaps of 10 to 12px. The rhythm is dense inside a group
and generous between groups.

## The moves on the screens

- **Frame**: the ground, with the sheet inset and rounded. The current view is lit to the sheet's
  own tone, and its glyph takes the accent.
- **My queue**: no bands. Four zones part by room under 15px heads. The agents are tiles of tone
  in a three-up grid, each with its meter at the foot. Your move's lines carry one fill each: a
  solid Approve (or Retry), with Request changes as quiet words beside it.
- **Compact**: the dense board, its heads given 18px of room above so each group reads as a block.
  Every group and all open rows fit over the foot strip. The open row and its expansion form one
  neutral panel.
- **Intake**: a 960px reading column: each query's run under its key, name and count, the age
  across from each title.
- **All teams**: no lanes and no column rules. Each repo is a heading, and the stage columns under
  it hold tiles of tone straight on the sheet.
- **Ticket**: the run card is a tile of tone with its now-row a step deeper. The owner is a picker
  chip of faint fill among bare values. The reading column fades into the sheet's foot. Talk is a
  full-height rail of tone with the composer as a well at its foot.
- **Library and editors**: column labels over unruled rows, above a foot strip. An agent's runtime,
  model and effort are picker chips. Save is always the accent: solid with something to save, a
  16% wash with semibold words when not, beside a dashed Discard.
- **Overlays and controls**: popovers have one firm hairline and no shadow. The peek and the full
  editor are sheets over a scrim.

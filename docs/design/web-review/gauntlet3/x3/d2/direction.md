# Precise: a precise instrument

AgentOS drawn as an instrument panel: dense, technical and high in contrast. Every screen sits on
one strict grid, every list reads as a ledger with its columns named, and the machine's identifiers
speak in their own voice. The product looks measured and calm, not decorated. Colour shows state;
the one coloured control is the move that is yours.

## Principles

1. **Two voices of type, words always sans.** Geist is for every word: titles, descriptions,
   names, messages, stage names, sources, models and efforts, ages ("3h 10m", "6m ago"), and every
   label. Geist Mono is kept for what the machine names: ticket and project keys (NW-14, SUP),
   counts in a band, a tab or the sidebar, clock times in a thread (10:02), a skill's slug, a
   file's path, code and commands. Mono sits a size under the sans (12px or 11px beside 13px) and
   at weight 400. Figures are tabular everywhere, so numbers line up without needing mono.
2. **Labels are quiet, in sentence case.** Column heads, field labels (Properties, Code,
   Workflow), section labels (Server, Client, Every stage gets), stage captions (Live, Skipped)
   and the sidebar's Context are 12px sans, weight 500, the quiet ink. Never caps, never tracked.
3. **Groups are a tier of their own.** A list's group band (Your move, Agents at work, Blocked,
   an Intake query, an All teams swimlane) is a clear grey fill ruled over and under by a
   hairline, and every band but the list's first opens on 12px of bare page. The rows run on
   their hairlines inside a group; the bands and the room before them part the groups, so the
   queue's structure scans before its rows do. The band's name is 12px/600 ink, its glyph over the
   rows' first cell, its count mono 11px in the state's hue.
4. **One grid.** Base unit 4px. Sidebar 220px, top bar 48px, the sheet's gutter 24px. A list line
   is 32px, a group band 30px, a column head 28px, cells 12px apart. Every row's first cell sits
   under the bar's title; keys share one column, titles the next, numbers end on one right edge.
   A group's chevron hangs in the gutter. The first band rides up a hairline onto the column
   head's rule, so two rules never stack into a thick one.
5. **Hairlines, not fills; only what floats lifts.** Rows, bands, cells, the sidebar and every bar
   are separated by 1px rules (8% ink in light, 10% hair in dark). Cards are hairline boxes with
   no drop. What floats (popovers, menus, the peek, a settings panel, a full-window editor) is a
   raised fill on its own hairline with a real drop: in light white with a soft 24% shadow, in
   dark a clear step lighter than the page (a 10% wash) on an 18% hair edge and a deep shadow.
6. **Small radii.** 2px keycaps, 4px tags, controls and cards, 6px the run card, popovers and
   panels. Meters and workflow strips are square ticks.
7. **Near-monochrome, colour for state.** Chrome is ink on paper. Selection is ink: an open row is
   a faint wash with a 2px ink rule at its left edge. Colour means state: your move (indigo, each
   theme its own hue), running orange, blocked red, done green. The gate primary (Approve, Save)
   wears your move's hue; Dispatch run stays solid ink. A setting that is on (a switch, a ticked
   box) wears your move's hue too, never a bright ink block.
8. **Progress reads.** On the stage track a finished stage's bar and a passed gate's diamond are
   done's green, the current stage the state's hue, the rest a grey track (skipped dashed). A
   run's step meter keeps finished steps in ink, so a grid of runs reads by the one live tick.

## Palette

- Paper (light): white page; sidebar a 2.5% ink whisper ruled off by a hairline; inks
  #0a0a0b / #3b3b42 / #686872; group bands 4.5% ink; hover 2.5%; open row 4%.
- Mist: Paper on a cool grey sidebar, slate inks, a deeper indigo; bands 5%.
- Carbon (dark): warm graphite #131211, the sidebar a step over it, bright inks; washes and
  hairlines mixed from one warm hair colour; bands a 5.5% wash.
- Midnight, Harbour, Plum: Carbon's ladder with their own page, inks, hair and your-move hue
  (royal blue, harbour teal, orchid); bands 6-7%.
- Controls in the dark are a 6% wash over whatever they sit on (so a button on a raised panel is
  lighter than the panel, never a hole in it) on a 12% hair edge.
- State: live #ea580c (dark #fb8a3c), blocked #c92a2a, done #16803c (progress #16a34a; dark
  #4ade80), your move per theme.

## Type

- Geist 13px for UI and rows (row titles 500), 12px meta and labels, 14px headings and
  descriptions, 18px/600 a view's title in its bar, 22px/600 a ticket's title, 13.5px the ticket
  page's body.
- A group band's name: 12px/600 in ink; its count mono 11px in the state's hue.
- Geist Mono 12px for keys and slugs beside 13px sans, 11px for small keys and counts.

## Surfaces and density

- The frame: sidebar ground, one hairline, the page; the top bar ruled off by one hairline
  across the whole window.
- Lists run edge to edge through the gutter under one column head (Compact, Intake, the
  library's tables). Groups are banded tiers parted by 12px of page.
- Panels of cells, not a pile of cards: My queue's agents at work are three cells to a row on
  shared hairlines, each with a square step meter at its foot.
- Spec sheets: a ticket's or an item's properties are ruled rows with a quiet label column.
- Tags (a row's Now, a card's state pill, a label) are a faint ink fill with 4px corners, on a
  fainter hairline inside a list's row: soft tags, never a field of outlined boxes.

## The moves on the screens

- **My queue**: zones as banded tiers 12px apart (Your move, Agents at work, Ready to start, Done
  recently); ledger rows (key, glyph and title, buttons with an indigo Approve, stage, source,
  age, face); agents at work as a hairline panel of cells.
- **Compact**: one column head over every group (Key, Ticket, Stage, Source, Age); each group a
  ruled band after a gap; the open row expands under an ink rule, its stage track green up to the
  live stage. The list still fits the window with every group open but Done.
- **Intake**: a ledger on Compact's grid under its own column head (Key, Issue,
  Priority · status, Assignee, Age); each query a run under its ruled band (project key mono in
  the keys' column, the name where the titles start), the runs parted by room.
- **All teams**: stage columns headed in the label voice, swimlane bands ruled over and under,
  hairline cards with mono keys and soft filled state tags.
- **Ticket and peek**: a firm 22px title, a ruled spec sheet, the run card with the green-to-live
  stage track and a square step meter, plan sections as quiet labels.
- **Library and editors**: tables under a quiet head band; skills and files by their mono slug
  and path (weight 400); models and efforts as words; workflow strips as square ticks with a loop
  bracket.

## Keep to it

- A new key, slug, path, count or clock time is mono; every word, age and label is sans.
- A new label is 12px/500 quiet sans in sentence case.
- A new grouping in a list is a band ruled over and under with room before it, never a bold row.
- Never add a fill or a shadow where a hairline will do (only what floats lifts, and then it
  lifts clearly); never round past 6px.
- Never colour chrome except the move that is yours and a setting that is on; a new colour must
  mean a state.
- Line up with the grid: first cells under the title, keys in the keys' column, numbers right.

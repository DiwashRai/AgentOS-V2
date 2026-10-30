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
   file's path, code and commands. Mono sits a size under the sans (12px or 11px beside 13px).
   Figures are tabular everywhere, so numbers line up without needing mono.
2. **Labels are quiet, in sentence case.** Column heads, field labels (Properties, Code,
   Workflow), section labels (Server, Client, Every stage gets), stage captions (Live, Skipped)
   and the sidebar's Context are 12px sans, weight 500, the quiet ink. Never caps, never tracked:
   a label names its column; it doesn't shout over the content.
3. **One grid.** Base unit 4px. Sidebar 220px, top bar 48px, the sheet's gutter 24px. A list line
   is 32px, a group band 30px, a column head 28px, cells 12px apart. Every row's first cell sits
   under the bar's title; keys share one column, titles the next, numbers end on one right edge.
   A group's chevron hangs in the gutter.
4. **Hairlines, not fills.** Rows, bands, cells, the sidebar and every bar are separated by 1px
   rules (8% ink in light, 10% hair in dark). Cards are hairline boxes with no drop. Only what
   floats (popovers, the peek, a full-window editor) casts a shadow, and it is a real one: a
   popover lifts a clear step off the page (light: a soft 24% drop; dark: a 10% wash over the
   page on an 18% hair edge).
5. **Small radii.** 2px tags and keycaps, 4px controls and cards, 6px the run card, popovers and
   panels. Meters and workflow strips are square ticks.
6. **Near-monochrome, colour for state.** Chrome is ink on paper. Selection is ink: an open row is
   a faint wash with a 2px ink rule at its left edge. Colour means state: your move (indigo, each
   theme its own hue), running orange, blocked red, done green. The gate primary (Approve, Save)
   wears your move's hue, so the one coloured control on a row answers the row's glyph; Dispatch
   run stays solid ink.
7. **Progress reads.** On the stage track a finished stage's bar and a passed gate's diamond are
   done's green, the current stage the state's hue, the rest a grey track (skipped dashed). A
   run's step meter keeps finished steps in ink, so a grid of runs reads by the one live tick.

## Palette

- Paper (light): white page; sidebar a 2.5% ink whisper ruled off by a hairline; inks
  #0a0a0b / #3b3b42 / #686872; bands 3% ink; hover 2.5%; open row 4%.
- Mist: Paper on a cool grey sidebar, slate inks, a deeper indigo.
- Carbon (dark): warm graphite #131211, the sidebar a step over it, bright inks; washes and
  hairlines mixed from one warm hair colour.
- Midnight, Harbour, Plum: Carbon's ladder with their own page, inks, hair and your-move hue
  (royal blue, harbour teal, orchid).
- State: live #ea580c (dark #fb8a3c), blocked #c92a2a, done #16803c (progress #16a34a; dark
  #4ade80), your move per theme.

## Type

- Geist 13px for UI and rows (row titles 500), 12px meta and labels, 14px headings and
  descriptions, 18px/600 a view's title in its bar, 22px/600 a ticket's title, 13.5px the ticket
  page's body.
- A group band's name: 12px/600 in ink; its count mono 11px in the state's hue.
- Geist Mono 12px for keys beside 13px sans, 11px for small keys and counts.

## Surfaces and density

- The frame: sidebar ground, one hairline, the page; the top bar ruled off by one hairline
  across the whole window.
- Lists run edge to edge through the gutter under one column head (Compact, Intake, the
  library's tables). Group bands are a faint fill ruled under.
- Panels of cells, not a pile of cards: My queue's agents at work are three cells to a row on
  shared hairlines, each with a square step meter at its foot.
- Spec sheets: a ticket's or an item's properties are ruled rows with a quiet label column.

## The moves on the screens

- **My queue**: ledger rows (key, glyph and title, buttons with an indigo Approve, stage, source,
  age, face); agents at work as a hairline panel of cells; sentence-case bands.
- **Compact**: one column head over every group (Key, Ticket, Stage, Source, Age); the open row
  expands under an ink rule, its stage track green up to the live stage.
- **Intake**: a ledger on Compact's grid under its own column head (Key, Issue,
  Priority · status, Assignee, Age); each query's band carries its project key (mono) in the
  keys' column and its name where the titles start.
- **All teams**: stage columns headed in the label voice, swimlane bands, hairline cards with
  mono keys.
- **Ticket and peek**: a firm 22px title, a ruled spec sheet, the run card with the green-to-live
  stage track and a square step meter, plan sections as quiet labels.
- **Library and editors**: tables under a quiet head band; skills and files by their mono slug
  and path; models and efforts as words; workflow strips as square ticks with a loop bracket.

## Keep to it

- A new key, slug, path, count or clock time is mono; every word, age and label is sans.
- A new label is 12px/500 quiet sans in sentence case.
- Never add a fill or a shadow where a hairline will do (only what floats lifts); never round
  past 6px.
- Never colour chrome except the move that is yours; a new colour must mean a state.
- Line up with the grid: first cells under the title, keys in the keys' column, numbers right.

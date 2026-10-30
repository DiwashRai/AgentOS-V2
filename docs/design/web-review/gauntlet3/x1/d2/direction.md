# Precise: a precise instrument

AgentOS drawn as an instrument panel: dense, technical and high in contrast. Every screen sits on
one strict grid, every list reads as a ledger, and the machine's data speaks in its own voice. The
product looks measured and calm, not decorated. Colour shows state and nothing else.

## Principles

1. **Two voices of type.** Geist is for what people wrote: titles, descriptions, names, messages,
   the words of a control. Geist Mono is for what the machine counts and names: ticket keys, run
   numbers, counts, ages and clock times, versions, models and efforts, a line's stage and source,
   and every label (column heads, field labels, group bands, section labels) in mono caps. Mono
   sits a size under the sans beside it (12px beside 13px) so the two share a line.
2. **One grid.** The base unit is 4px. The sidebar is 220px, the top bar 48px, the sheet's gutter
   24px. A list line is 32px, a group band 30px, a column head 28px, and a list's cells sit 12px
   apart (`--line-gap`). Every row's first cell starts under the bar's title. Keys share one
   column, titles share the next, and numbers end on one right edge. A group's chevron hangs in
   the gutter so its glyph lines up with the rows' first cell.
3. **Hairlines, not fills.** Rows, bands, cells, the sidebar and every bar are separated by 1px
   rules (8% ink in light, 10% of the theme's hair in dark). Cards are hairline boxes with no
   drop. Only what floats (popovers, the peek, a full-window editor) casts a shadow.
4. **Small radii.** 2px for tags and keycaps, 4px for controls, cards and a row's tags, 6px for
   the run card, popovers and panels. Meters and workflow strips are square ticks, not pills.
5. **Near-monochrome.** Chrome is ink on paper. The primary action (Approve, Save, Dispatch) is a
   solid ink button: black on light, white on dark. Selection is ink too: an open row is a faint
   neutral wash with a 2px ink rule at its left edge, and a selected stage card is ringed in ink.
   Colour is kept for state: your move indigo (each theme sets its own), running orange, blocked
   red, done green. People's faces are muted hues that never outshout a state.
6. **High contrast.** Three inks, well apart: near-black titles, a dark grey for secondary words,
   and a mid grey that still holds 5:1 on white for the quiet line.

## Palette

- Paper (light): page white; sidebar a 2.5% ink whisper ruled off by a hairline; inks
  #0a0a0b / #3b3b42 / #686872; bands 3% ink; hover 2.5% ink; an open row 4% ink.
- Mist: Paper on a cool grey sidebar, slate inks, a deeper indigo.
- Carbon (dark): a warm graphite page #131211, the sidebar a step over it, bright inks; washes
  and hairlines mixed from one warm hair colour.
- Midnight, Harbour, Plum: Carbon's ladder with their own page, inks, hair and your-move hue
  (royal blue, harbour teal, orchid).
- State: live #ea580c (dark #fb8a3c), blocked #c92a2a, done #16803c, your move per theme.

## Type

- Geist 13px for the UI and rows (row titles 500), 12px meta, 14px headings and descriptions,
  16px for a view's title in its bar, 22px/600 for a ticket's title, 13.5px for the ticket page's
  body.
- Geist Mono 12px for data beside 13px sans, 11px for units and small keys, 10.5px caps tracked
  0.07em for labels (`Text variant="caps"`, column heads, Facts labels, group names).
- Figures are tabular everywhere.

## Surfaces and density

- The frame: sidebar ground, one hairline, the page. The top bar is ruled off by one hairline
  that runs across the whole window, the sidebar's head included; the peek's bar is ruled too.
- Lists run edge to edge through the gutter. Group bands are a faint fill ruled under, named in
  mono caps with the count in the state's hue.
- Panels of cells, not a pile of cards: My queue's agents at work are three cells to a row on
  shared hairlines, each with a square step meter at its foot.
- Spec sheets: a ticket's or an item's properties are ruled rows with a mono-caps label column.

## The moves on the screens

- **My queue**: ledger rows (key, glyph and title, buttons, mono stage, mono source, mono age,
  face); the agents at work as a hairline panel of cells; bands in mono caps.
- **Compact**: one mono-caps column head over every group (Key, Ticket, Stage, Source, Age; the
  Now tag names itself); the open row expands under an ink rule, its parts labelled in mono caps.
- **Intake**: a ledger instead of two-line triage rows: key, title, one fact, assignee (face and
  name) and age on fixed columns, the same grid as Compact. A query's band carries its project
  key in the keys' column and its name where the titles start; a failure, an empty query and
  "+N, Show all" put their glyph in the keys' column and their words on the titles' edge.
- **All teams**: stage columns headed in mono caps, swimlane bands, hairline ticket cards with
  mono keys.
- **Ticket and peek**: a firm 22px title, a ruled spec sheet of properties, the run card with
  mono-caps stage captions (LIVE, SKIPPED) and a square step meter, mono run numbers and clock
  times, plan sections in mono caps.
- **Library and editors**: tables under a mono-caps head band, models and efforts in mono,
  workflow strips as square ticks with a hairline loop bracket, editors' properties as a spec
  sheet, ticket keys in mono.

## Keep to it

- A new number, key, time or version is mono; a new label is `caps`; a new word people wrote is
  sans.
- Never add a fill or a shadow where a hairline will do; never round past 6px.
- Never colour chrome: a new emphasis is ink, a new colour must mean a state.
- Line up with the grid: first cells under the title, keys in the keys' column, numbers right.

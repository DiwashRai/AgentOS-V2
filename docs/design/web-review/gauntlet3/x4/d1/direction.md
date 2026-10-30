# Flat: the direction on a page (round 4 polish)

Flat and quiet. Almost no lines, and a shadow only under what floats. Surfaces are told apart by
room and by small steps of tone. One accent is used, and only for what you can act on or what is
selected. Type carries the hierarchy through its size, weight and ink, so nothing needs a box round
it to be read. This round kept all of that and gave the busy screens structure: every shape stands
on one column edge, sections part by a hairline, wide lists have column labels and faint rules, and
state colour comes back where it means something.

## Principles

1. **Two planes.** The *ground* runs under everything and holds the sidebar. The *sheet* (the main
   column) is set into it with an 8px inset (`--inset`) and a 12px corner, with no edge and no
   shadow. A view lies flat on the sheet. The sidebar's head sits level with the sheet's top bar.
2. **One column edge, words inset.** The sheet's gutter (32px) is the column edge. Every *shape*
   stands on it: a row's hover or open patch, an open row's panel, a tile, the run card, the foot
   strip, the Talk panel's right side (on the bar's right edge). A row's *words* sit `--list-in`
   (16px) inside it, as a tile's do. A group's or section's *heading* hangs on the edge itself, so
   it heads the rows inset under it (glyph at the edge, rows' first cell 16px in). Nothing pokes
   past the column: the old 10px bleed of the wash is gone. The page title and the headings share
   the edge; the right ends of heads and rows share the inset.
3. **Tone, not lines.** An *object* is a tile of tone (`--tone-2`): an agent at work, a board
   card, the run card, a workflow stage. It takes one step more (`--tone-3`) under the pointer. A
   *zone* is a lighter step (`--tone-1`): the foot strip, and the column beside the body (Talk, the
   workflow editor's Library), which is now a rounded panel inset from the sheet's foot and ending
   on the bar's right edge, so the sheet keeps its corners. Anything that lays over a surface is a
   see-through fill (`--fill-1/2/3`): a hover, a control at rest, a pressed chip, the open row.
4. **A line only where it is a picture or where structure needs one.** Pictures: the stepper's
   bars, meters, the lane's axis, a loop's bracket. Structure: one hairline (`--rule`) between a
   view's *sections* (My queue's zones, Intake's queries, AGENTS.md's blocks), on the column edge,
   with `--section-gap` (18px) of room on each side; and in a list out at the sheet's edges
   (Intake, the library's lists) a faint rule (`--list-rule`) between rows, under their words only,
   hidden beside a lit row. No rule under the top bar, across the tabs, or between Compact's or My
   queue's rows. Dashed outlines mean "nothing here now": a blocked button, a switched-off stage,
   a queued agent.
5. **Floating means hairline and shadow.** A popover (menus, pickers, the theme menu, a filter's
   overflow) is the one layer that floats: its own tone, one hairline (`--pop-edge`) and a soft
   shadow (`--pop-shadow`, deeper on the dark themes). `Surface level="sheet"`, a panel held over
   the page (the twins' options panels and agent panel), takes the same edge and shadow. Nothing
   else has a shadow.
6. **Room does the grouping inside a section.** Groups part by `--group-gap` (20px) above a 16px
   semibold heading (`--fs-head`), never by a band. Rows have no rules unless the list is wide.
   Selected rows that follow one another join into a single patch.
7. **Dense where it is a board.** A grouped list that scrolls in its own surface (Compact) runs a
   step tighter: 32px lines, 28px heads at 15px, 10px above each head, a 32px row of column labels
   on top. The whole board, every group from Needs you to Done recently, stands above its foot
   strip, and with a row open the last group still shows whole. The fade at the list's end is
   10px, so nothing reads as hidden under the foot.
8. **One accent, restrained.** `--you` is indigo on Paper, Mist and Carbon, royal blue on Midnight,
   teal on Harbour and orchid on Plum. It marks the primary button (Approve, Save), your move's
   glyph, count and counter, the current view's glyph, the current tab's bar, the *selected*
   filter chip (on `--you-soft`, 15%, in `--you-text`), checks, switches, gates waiting on you, and
   focus. A blocked primary keeps its place: the same soft wash with its words in `--you-text`, so a
   not-yet-lit Save still outweighs a dashed Discard.
9. **State colour where it carries meaning.** The state hues (orange running, red blocked, green
   done) live in glyphs, meters and dots, and their words stay in ink, with three exceptions that
   carry meaning: the bar's running and queued counters lead with their glyphs; a queued agent's
   card is a dashed outline with no tone while a running one is a tile; and a query that didn't
   answer is a panel of the blocked hue's wash (`--card-problem`) with a blocked dot on a halo.

## Palette (tokens.css)

- **Paper** (light): a white sheet (`--page`) on a ground of ink 4.5% over white. Inks `#111113`,
  `#3f3f46`, `#66666f`. Tones step by `2.5% / 4.2% / 6.5%` of ink and fills by `3.5% / 5.5% / 9%`.
  Hairlines: `--rule` 8% ink (sections), `--list-rule` = fill-2 (rows), `--edge` 15% (popovers).
  Shadow: `0 12px 32px -6px` black 16% plus `0 2px 6px` black 6%.
- **Carbon** (dark): a warm graphite sheet `#1c1b1a` on a ground 34% black under it. Tones step by
  `3.5% / 5.5% / 8.5%` of the theme's wash and fills by `4.5% / 7% / 11%`; the popover a step
  lighter (`--pop`, 8% wash) under a deeper shadow (black 55% and 30%). Midnight, Harbour and Plum
  set their own sheet, wash and accent on the same ladder; Mist sets a cool ground and slate inks.
- A new colour is always a `color-mix` of these steps (or black at low alpha for a shadow), never a
  raw neutral.

## Type

Geist at weights 400, 500 and 600 only.

- View title: 24px/600, tracking -0.02em, the bar's one anchor. The context, counters and filter
  chips after it drop 4px onto its baseline. The counters part in two groups by a small dot.
- Section or group heading: 16px/600 in ink-1 (15px on the dense board). Its count follows in
  ink-3 (the accent only for your move), its note in 12px ink-3.
- Row title: 13px/500 in ink-1; a settled row recedes to ink-2. A tile's title is 14px.
- Keys (NW-14) are quiet tabular 13px ink-3 everywhere, in a list or in "Used by", so they never vie
  with names.
- Column labels: 12px/500 ink-3, no band, over the rows' words.
- Body 14px at 1.55 to 1.6. The ticket's title 28px/600, its lead 15px in ink-2.

## Surfaces and controls

- Buttons are fills, never edges. Default `--ctl` (fill-2), a step firmer on hover. Primary: the
  accent's one solid fill with white. Quiet: no fill until hover. Blocked: a dashed outline in
  muted ink; a blocked primary the accent's soft wash. "Request changes" stays a real filled button.
- A picker in a properties row (the ticket's owner, an agent's runtime, model and effort) rests on
  a quiet chip fill (`--chip-rest`, fill-1), a step firmer on hover and open, so what you can change
  reads apart from read-only values beside it.
- Fields and search are wells of fill-2 with no edge; focus draws the accent ring. In the Talk
  panel the composer is a well of the sheet's colour.
- Chips are flat fills with muted words led by a state dot. Filter chips are bare words; the
  selected one sits on the accent's soft wash.
- Dialogs: the peek is a sheet at the right edge over a scrim (the dimming is the lift). The full
  editor is the sheet itself over the scrim.

## Density

Rows are 36px (a line), 32px (a line on the scrolling board). Gutters 32px; words 16px inside the
column edge. Tiles have 14 to 16px of padding and gaps of 10px. Dense inside a group, generous
between sections.

## The moves on the screens

- **Frame**: the ground, with the sheet inset and rounded. The current view lit to the sheet's own
  tone, its glyph in the accent.
- **My queue**: four sections (Your move, Agents at work, Ready to start, Done recently), each a
  `Surface level="list"`, parted by room and a hairline. Heads hang on the edge, rows inset. The
  agents are a three-up grid: running tiles of tone with their meters, queued ones dashed and
  toneless. The bar's counters: 3 your move (accent), 3 runs yours, a dot, then the running and
  queued counts led by their glyphs.
- **Compact**: the dense board under one row of column labels (Key, Ticket, Stage, Source, Age).
  Every group fits over the foot strip; the open row and its expansion form one neutral panel on
  the column edge, its words inset, and the board below it still shows its last group whole. The
  selected filter chip in the accent's wash.
- **Intake**: one list under column labels (Key, Issue, Priority · status, Assignee, Age), each
  issue one line with its facts in columns (the key a link to Jira, the priority's bars or the
  status, a face and a name, the age; Take in on hover). Each query is a section under its sticky
  head, parted by a hairline; rows ruled faintly. The failed query is a blocked-wash panel.
- **All teams**: each repo a heading, its stage columns holding tiles of tone straight on the
  sheet, the legend in the foot strip.
- **Ticket**: the run card a tile of tone with its now-row a step deeper. Runs: the open run a
  panel on the column edge, its stages inset. Talk is a rounded panel of the lighter tone, inset
  from the sheet's foot and on the bar's right edge, the composer a white well at its foot.
- **Library and editors**: column labels over faintly ruled rows, the foot strip on the column
  edge. Save is always the accent, solid or a soft wash, beside a dashed Discard. Pickers rest on
  chip fills; "Used by" keys are quiet. AGENTS.md's blocks part by a hairline.
- **Overlays and controls**: popovers have one hairline and a soft shadow; the theme menu, the
  owner picker and the ticket menu all lift off the page.

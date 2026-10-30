# Warm: paper and ink on a desk (round 4 polish)

A friendly but serious product, made clear by space and grouping rather than lines. The app's
ground is a **desk**; what a view says is laid on it as **sheets of paper**; inside a sheet, a
**well** (the desk's tint, softened) holds what belongs together. Nothing is ruled off when room or
a sheet's edge can part it; a hairline is allowed only *inside* one surface, to part two halves of
the same object (a run card's stages from its now line). Round 4 kept the grouping that wins and
took the weight out: smaller corners, a tighter rhythm, one surface level per area, state where the
eye looks for it.

## Principles

1. **One desk, no rules.** The sidebar and the main column are the same desk (`--side`). No hairline
   between them, under the top bar or between rows. The bar's title, counters, search and buttons
   sit straight on the desk over the sheets.
2. **A group is a sheet; a dense view is one sheet.** In the roomy views each group is its own sheet,
   10px (`--sheets`) under the last: My queue's runs and its Agents at work, each Intake query, each
   All teams repo lane. The group's head is the sheet's first line. Compact and the library lists are
   **one** sheet each (`Table edge`): the column head its first line, the key hints its last (a slim
   well, `--h-band`), the groups under slim well bands that ride at the top while their rows pass.
3. **One surface level per area.** Paper on the desk, wells in the paper: never paper on paper on
   paper. The ticket's run card is one well (stages, a hairline, the live run), with nothing laid on
   it. Agent tiles are wells in their sheet, not sheets on the desk. A full-window editor is one
   sheet of paper over the veil: its bar and its document lie straight on it, a column beside it is a
   well (`--doc-paper`, `--doc-drop`, `--col-paper` set by the dialog).
4. **Hierarchy by surface, not by sameness.** What's yours to do is paper (Your move); what's live is
   paper holding live-tinted wells (Agents at work); what waits is paper (Ready to start); what's
   past is a **settled** sheet (`Surface level="settled"`): paper sunk halfway into the desk, flat,
   no drop. The page reads from top to bottom as do, watch, wait, done.
5. **State where the eye looks.** A running agent's tile is a soft wash of the live hue (`--tile`,
   live 5.5% into paper; deeper on hover); a queued one is an empty dashed outline, its title a step
   quieter. The bar's counters carry their glyphs (running's pie, queued's dashed ring); group counts
   are in their state's hue. Colour still only ever means a state.
6. **The open thing is raised paper.** An open row (Compact's expansion, a library row selected by the
   keys, the newest run) is a slip of `--raised` paper lifted with `--shadow-lift`. The current
   sidebar view is the same move at small scale. A pressed filter or chip is not paper: it is a soft
   tint of your move (`--ring-you`, `--you-text`), so it reads on paper as well as on the desk.
7. **Spacious, not loose.** Room round and between sheets, but lists stay lists: Compact shows every
   group with a row open; the ticket shows its whole plan above the sheet's foot. When a view stops
   fitting, tighten the rhythm (heads, rows, gaps) before anything else.

## Palette

| Token | Paper (light) | Carbon (dark) | Role |
|---|---|---|---|
| `--side` | `#ece5d9` deeper linen | page + 30% black (L* 9) | the desk |
| `--page` | `#fffdf9` | `#282420` umber (L* 14) | a sheet of paper |
| `--raised` | `#ffffff` | `#36312b` | raised paper: open row, controls |
| `--tk-well` | desk 62% into paper | same mix | wells: run card, tabs tray, bands, reply box, blocks |
| `--tk-settled` | paper 50% into desk | same mix | a settled sheet (done) |
| `--ink-1/2/3` | `#2a241f` / `#544a42` / `#6b6056` | `#f3ede5` / `#cbc1b5` / `#a99d90` | inks, all >= 4.5:1 on paper and desk |
| `--you` | `#6157d0` warm iris | `#6d61dc` | your move, focus, pressed |
| `--live` | `#e0640f` | `#fb923c` | running; `--tile` is its wash |
| `--blocked` | `#c4372c` brick | `#f99088` | blocked |
| `--done` | `#2f8a4c` garden green | `#5bc27c` | done |

The light desk is a clear step under the paper (L* 91 against 99), so sheets read as sheets. Shadows
in the light are a warm brown (`rgba(80, 52, 24, a)`), never grey: `--shadow-sheet` a firm 1px edge
at 5.5%, a contact shadow, a short soft fall; `--shadow-lift` a step more. In the dark a lit top
edge over a black ring and a deep drop; popovers a clear step over the paper (`--pop` wash 10%).
Every theme keeps the same ladder at its own hue (Mist a cool stone, Midnight the deepest, Harbour
a lifted navy, Plum aubergine); their desks are their paper with black mixed in.

## Type

Geist and Geist Mono only, weights 400/500/600.

- A view's title 22px/600, tracking -0.02em; a ticket's or item's title 28px/600.
- A sheet's group head 14px/600, its count in the state's hue, its note 13px ink-3.
- **List row titles 13px/500** in ink-1 (Compact, My queue, the library), what they wait on 13px
  ink-3 after them: the head stands a step over its rows. Two-line items (Intake) and tiles keep the
  14px label, in `--tk-ink` (a step under the strong ink in the dark).
- Meta 12px ink-3; mono keys 11-12px. The bar's counters: the number 14px/600, the word 13px ink-2.

## Surfaces and shapes

- Radii: soft, not bubbly. Sheet 12px (`--r-6`); well and tile 10px; row wash, band, tray 8px;
  control 7px; chips, filter pills, counters and avatars round.
- Controls are white paper on a soft edge with a 1px warm contact shadow.
- The gate primary (`Button you`, Approve, Save) is solid iris; blocked it stays the primary,
  unlit: an iris tint with iris words, never a grey that reads as gone.
- Chips are soft round pills of faint ink, no outline (a board card's state pill is the one
  hairline pill).
- Tabs are a tray: the words in a well, the current one a slip of paper.

## Density

- Top bar 52px. `--h-line` 34px rows, `--h-group` 38px heads, `--h-band` 28px bands 6px apart,
  `--h-list-head` 30px column head, `--h-triage` 52px two-line items, `--h-check` 32px plan rows,
  `--h-fact` 30px property rows.
- `--gutter` 16px of desk at the right; 8px between the sidebar's desk and the first sheet.
- Sheets padded 6px (`--list-in`), rows inset 24px so a row's first cell sits under its head's glyph.
- The ticket's document sheet: 24px over the title, 32px at the sides, a 24px veil resting in a
  40px foot; Talk 340-380px.

## The moves, screen by screen

- **My queue.** Your move, Agents at work and Ready to start each a sheet; Done recently a settled
  sheet. Agents at work's head is its sheet's first line, its six tiles wells in a 3-column grid
  6px apart: running washed in the live hue, queued dashed and quieter. Every tile ends on one line
  (a queued one's empty track). A row's buttons keep 24px after them.
- **Compact.** One sheet: the column head (Key, Ticket, Now, Stage, Source, Age), then each group
  under a slim well band (glyph, name, count in the state's hue, fold, summary), then the key hints
  and totals as the sheet's last line, a well. The open row is raised paper holding the stepper,
  the move and the plan; with it open, Queued still shows whole above the foot.
- **Intake.** Each query a sheet, its head the sheet's first line. A row: the face, the title over
  its Jira key; then the assignee and the one fact (priority with its bars, or the status) on
  columns down the sheet, the age at the end.
- **All teams.** The stage names on the desk over the board; each repo a sheet, its cards in
  columns parted by room alone; the legend on the desk at the foot.
- **Library lists.** One sheet hugging its rows: column labels first, the key hints and count last.
- **Ticket.** The document and Talk are two sheets. The run card is one well: the stepper, a
  hairline across the well, the live run (who, step, time, Log, Cancel) and its meter. Tabs are a
  tray. The whole plan fits above the sheet's foot; Talk's reply box and your own message are wells.
- **Peek.** A sheet floated at the right over the warm veil; the same one-well run card.
- **Editors.** An item editor is one document sheet; its content (instructions, each AGENTS.md
  block) in wells that hug their read text. Save is the tinted primary until there is an edit. The
  full-window editors are one sheet of paper over the veil, framed once; the workflow's library a
  well beside the lane.
- **Popovers and menus.** Raised paper, the warm layered drop, 6px off their trigger, rows 34px.
- **Pickers and pressed chips.** A value you can change rests as a soft slip of faint ink; a
  pressed filter or property chip is an iris tint with iris words.

## Keep to it

- Reach for room, a sheet or a well before a line; a hairline only inside one surface.
- Never stack paper on paper: if something needs to stand out inside a sheet, it is a well (below)
  or the one open slip (above), never another card.
- New colour tokens are mixes of a theme's paper, desk and inks (or black/white at low alpha); light
  shadows stay brown.
- Don't tint whole groups by state (a sheet per hue stripes the list); tint the thing that is in
  the state (a running tile), and let glyphs and counts say the rest.
- A dense view earns density by gathering its groups onto one sheet with banded heads and a quieter
  13px row, never by going back to hairlines.

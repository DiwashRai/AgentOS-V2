# Warm: paper and ink on a desk

A friendly but serious product, made clear by space and grouping rather than lines. The app's
ground is a **desk**; what a view says is laid on it as **sheets of paper**; inside a sheet, a
**well** (the desk's tint, softened) holds what belongs together. Nothing is ruled off when room or
a sheet's edge can part it. A line is the last resort.

## Principles

1. **One desk, no rules.** The sidebar and the main column are the same desk (`--side`). There is
   no hairline between them, under the top bar or between rows. The bar's title, counters, search
   and buttons sit straight on the desk over the sheets.
2. **A group is a sheet, unless the view is for density.** In the roomy views each group is its
   own sheet of paper, a step (`--sheets`, 14px) under the last: Intake's queries, My queue's runs
   (Your move, Ready to start, Done recently), each of All teams' repo lanes, the library's list;
   the group's head is the sheet's first line, not a band. Compact, the dense view, lays all its
   groups on **one** sheet: each head is a slim soft band (`--list-band` over the paper, 34px, 12px
   corners, 6px of room above it) that rides at the top while its rows pass. So Compact is visibly
   denser than My queue, and the sheet-per-group move stays for the views where room is the point.
3. **Paper is lifted, not outlined.** A sheet has large soft corners (`--r-6`, 18px) and a gentle
   warm drop (`--shadow-sheet`: a near-invisible 1px edge, a 1-2px contact shadow, a long soft
   fall). Something lifted further (an open row, a hovered tile) takes `--shadow-lift`; floating
   layers (popovers, the peek, the full-window editors) `--shadow-pop` / `--shadow-float`.
4. **Wells hold what belongs together.** Inside paper, a well (`--tk-well`, the desk tint mixed into
   the paper) sets apart one object: the ticket's run card (stages over a slip of paper with the live
   run), the tabs' tray, Talk's reply box, your own message, an item editor's content and each
   AGENTS.md block, a code block.
5. **The open thing is raised paper.** An open row (Compact's expansion, a library row selected by
   the keys, the newest run) is a slip of `--raised` paper lifted off its sheet with `--shadow-lift`,
   not a tint. The current sidebar view, the pressed filter pill and the current tab are the same
   move at small scale: a slip of paper on the desk or in its tray.
6. **Colour only means a state.** Neutrals are warm and quiet; hue is reserved for your move (the
   theme's accent), running (orange), blocked (red), done (green). The bar's one filled pill is
   "N your move", in the accent's tint.
7. **Spacious, not loose.** Generous room round and between sheets; rows a little taller than
   Linear's; but a list stays a list (Compact's open row and All teams' four lanes fit the window).

## Palette

| Token | Paper (light) | Carbon (dark) | Role |
|---|---|---|---|
| `--side` | `#f3eee5` linen | page + 30% black (L* 9) | the desk |
| `--page` | `#fffdf9` | `#282420` umber (L* 14) | a sheet of paper |
| `--raised` | `#ffffff` | `#36312b` | raised paper: open row, controls, popover |
| `--ink-1/2/3` | `#2a241f` / `#544a42` / `#72675d` espresso | `#f3ede5` / `#cbc1b5` / `#a99d90` cream | three inks, all >= 4.5:1 on paper and desk |
| `--you` | `#6157d0` warm iris | `#6d61dc` | your move, focus, the open step |
| `--live` | `#e0640f` | `#fb923c` | running |
| `--blocked` | `#c4372c` brick | `#f99088` | blocked |
| `--done` | `#2f8a4c` garden green | `#5bc27c` | done |
| `--tk-well` | desk 62% into paper | same mix | wells |

Shadows in the light are a warm brown (`rgba(80, 52, 24, a)`), never grey; in the dark a lit top
edge (`rgba(255, 244, 230, .05)`) over a black ring and a deep drop. The scrim under the peek and the
editors is a light warm veil (16% of a brown; 50% black in the dark), so the page stays legible.
Faces (`--id-*`) are softened earth tones with white initials.

Every theme keeps the same ladder at its own hue: each sets its paper and inks, and its desk is that
paper with black mixed in (dark) or its own tinted desk (Mist `#e9ecf1` under `#fcfdfe`). Carbon is
a roast, not a black; Midnight the deepest (`#15171d` paper); Harbour a lifted navy; Plum aubergine.

## Type

Geist and Geist Mono only, weights 400/500/600.

- A view's title 22px/600, tracking -0.02em; a ticket's or item's title 28px/600.
- A sheet's group head 14px/600, tracking -0.01em, its count in the state's hue, its note 13px ink-3.
- Row titles 14px/500 in ink-1, what they wait on 13px ink-3 after them on the same line.
- Meta 12px ink-3; mono keys 11-12px.
- The bar's counters: the number 14px/600 in ink-1, the word 13px ink-2; a zero recedes to ink-3.

## Surfaces and shapes

- Radii: sheet 18px; well and tile 14px; row wash and tray 12px; control 9px; chips, filter pills,
  counters and avatars round (pill).
- Controls (buttons, search, pickers) are white paper on a soft edge with a 1px warm contact shadow.
- Chips are soft round pills of faint ink, no outline anywhere (a board card's state pill is the
  one hairline pill, so it reads on the card).
- Tabs are a tray: the words in a well as wide as they need, the current one a lifted slip of paper.
- Board and stage cards stay crisp: white on a faint edge with a small drop, on their sheet.

## Density

- The top bar 56px (`--h-top`). `--h-line` 36px rows, `--h-group` 40px heads, a sheet's padding
  6px with rows inset 24px (`--list-pad` 16px + 8px) so a row's first cell sits under its head's glyph. Row hover is a soft round wash inset by the sheet's
  padding.
- `--gutter` 32px of desk at the right; 8px between the sidebar's desk and the first sheet (the
  sidebar's own padding makes the visible gap about 20px).
- The ticket's document sheet has a 32px margin and Talk is 340-380px wide, so the description
  reads in two lines and the Runs tab shows both runs whole. Item editors keep a 40px margin, the
  reading column 760px.

## The moves, screen by screen

- **Frame.** One desk; the sidebar has no rule; the current view is a slip of paper with a soft
  drop; 32px items 2px apart.
- **My queue.** Your move, Ready to start and Done recently are each a sheet; Agents at work is a
  head on the desk over its tiles, each tile a sheet of its own (lifting further on hover), its
  words on the line of the sheets' rows.
- **Compact.** One sheet; each group under a soft rounded band (glyph, name, count in the state's
  hue, fold chevron, summary at the end) that rides at the top; with a row open, Queued still shows
  above the foot; the open row is raised paper holding the stepper, the move and the plan; the foot
  (key hints, totals) on the desk, the list fading under it.
- **Intake.** Each query a sheet, its head (chevron in the faces' column, key, name, count) the
  sheet's first line; triage rows unruled, a face leading two lines; a failed query's problem in the
  same sheet.
- **All teams.** The stage names on the desk over the board; each repo a sheet, its head line then
  its cards in columns parted by room alone (no column rules); an empty stage is bare paper; the
  legend at the foot.
- **Library lists.** One sheet hugging its rows, column labels its first line; the key hints and
  count pinned to the window's foot on the desk.
- **Ticket.** The document and Talk are two sheets side by side on the desk. The run card is a well:
  the stepper over a slip of paper carrying the live run. Tabs are a tray. Talk's reply box and your
  own message are wells.
- **Peek.** A sheet floated at the right over the warm veil; the same well-and-slip run card.
- **Editors.** Item editors are one document sheet; the content (instructions, each AGENTS.md block)
  sits in wells that hug their **read** text: at rest the reading sets the well's height (a fenced
  block's source lines don't leave an empty band), the source laid over it to take the click. The workflow editor is two
  sheets (the lane, the library). The full-window editors lift a desk of their own over the veil and lay the same sheets on it.
- **Popovers and menus.** Raised paper, round corners, the warm layered drop; rows 34px with a soft
  round hover.

## Selections

A run of open rows (a selection) is one slip of raised paper, not a stack: the joins lose their
corners and the lower row's edge over the join.

## Keep to it

- Reach for room, a sheet or a well before a line. A new rule needs a reason a sheet can't give.
- New colour tokens are mixes of a theme's paper, desk and inks (or black/white at low alpha),
  never a raw neutral; shadows in the light stay brown.
- Don't tint groups by state (a sheet per hue stripes the list); the glyph and the count say it.
- A dense view earns density by gathering its groups onto one sheet with banded heads, never by
  going back to hairlines.
- Keep lists honest: if a view stops fitting what the current design fits, tighten the rhythm
  (heads, row height) before adding room.

# Direction: colour as information

Every hue on a screen says one thing, and says it the same way everywhere. Colour is a code you
learn once (state, kind, phase, priority, person, team) and then read before you read words. The
chrome is tinted with the theme's own accent, so each theme has a character. The colour sits in
small marks and faint washes, never in big saturated fields, so the app stays calm enough to work
in all day.

## Principles

1. **One hue, one meaning.** The accent (`--you`) means *you*: your move, the current view, tab
   and filter, the open row, focus, primary actions (Approve). The states: orange is running,
   red is blocked, green is done. Grey means waiting, queued or idle. The categories (`--c-*`, six
   hues) code kinds, phases and types. People keep their `--id-*` hue in every theme.
2. **Marks first, then washes.** A state lives in its glyph, its count and its pill. It reaches
   faintly into the surface it heads: a group's band, a running agent's card, a live run's status
   bar. Text stays ink. Only short counts, names and labels take a hue, mixed toward the ink so
   they keep 4.5:1.
3. **Tinted chrome, white sheet.** The window is the theme's frame: the sidebar and an 8px margin,
   mixed from the accent. The main column is an inset rounded sheet on it. The sheet's top bar,
   the ticket's rail and the peek's bar take half of the frame's tint, so they read as chrome
   around the white (or dark) reading surface.
4. **Calm.** Light washes are about 8% of the hue, flat. Dark washes are 12% and glow from the
   glyph's end, fading into the neutral band by 60%: a flat orange or red over graphite turns
   brown. Each screen has one solid fill per job (the accent button). No stripes, no coloured
   card tops.

## Palette

- **States**: live `#ea580c` (dark `#fb923c`), blocked `#dc2626` (`#f87171`), done `#16a34a`
  (`#4ade80`). A state pill (`Chip dot`) is washed 13% and edged 32% in its hue, with words in
  ink.
- **Categories** (light / dark): violet `#7c3aed` / `#a78bfa`, sky `#0284c7` / `#38bdf8`, teal
  `#0d9488` / `#2dd4bf`, amber `#c48a06` / `#f5c542`, pink `#db2777` / `#f472b6`, slate `#64748b`
  / `#94a3b8`. They code:
  - library kinds: workflow violet, agent sky, skill teal, file amber;
  - ticket types: feature violet, improvement sky, bug pink, task slate;
  - workflow phases: plan violet, build sky, verify teal, review pink;
  - a raised priority: amber bars;
  - a team's key: a hue per key, stable by hash.
- **People**: violet, blue, rose, teal, slate faces. A name in Talk uses its face's hue mixed 75%
  into the ink (`--id-*-ink`), so it reads on either ground.
- **Themes** each set an accent and a frame:
  - Paper: white sheet on a lavender frame, indigo `#4f46e5`.
  - Mist: steel-white sheet with white cards, steel-blue frame, cobalt `#1d63d8`.
  - Carbon: warm graphite sheet on a violet-black frame, violet `#6a5af0`.
  - Midnight: near-black sheet on a night-blue frame, electric blue `#2563eb`.
  - Harbour: lifted navy, sea frame, teal `#0e7c7b`.
  - Plum: aubergine with orchid `#a03ccf`.

  In the dark themes a `you` glyph and the current view's icon use the lighter `--you-mark` (the
  focus colour), so they read against the dark.

## Type, surfaces, density

- Geist with the same scale as before (11 to 28px; weights 400, 500 and 600). This direction
  changes colour and surfaces, not the type scale or the row density.
- Surfaces, bottom to top: the frame, the sheet, the top bar and rail (half tint), the bands, the
  cards. Cards are white on a hairline in light themes and a step lighter in dark ones. A running
  agent's card is outlined in live over a 4% wash. A queued one is dashed with no fill.
- Hairlines carry the structure. The sheet gets a soft lift; a popover gets a deeper one.

## Moves on the screens

- **Frame**:
  - The tinted sidebar on the frame, with the inset sheet.
  - The current view is a pill of the sheet's colour in accent ink. Its icon is in the accent,
    except that a library kind keeps its own hue.
  - Library kinds are coloured in the sidebar.
  - The Space tile is solid accent.
- **Top bar**:
  - The bar is tinted and ruled off from the view.
  - A non-zero state counter takes its hue and its glyph (your move, running, blocked). My
    queue's running and queued counters now carry their marks too.
- **Lists** (My queue, Compact, Intake):
  - Group bands wash in their state's hue; neutral groups stay grey.
  - Compact's Now tag for a working agent is a live pill, matching the board's.
  - Intake keys sit on their team's tile. A query that failed gets a blocked band.
- **My queue's agents**: running cards are outlined and washed in live; queued cards are dashed
  and empty. The grid reads as "4 working, 2 waiting" at a glance.
- **All teams**:
  - Each column head leads with its phase's dot (`Chip tone="bare"`), coded the same as the
    library's workflow strips.
  - Board cards carry state pills.
- **Ticket and peek**:
  - The Talk rail and the peek's bar are chrome-tinted.
  - Talk names are in their person's hue, and "You" is in accent ink on an accent-tinted bubble.
  - The live run's status bar is washed in live.
  - The tabs are underlined in the accent.
  - The type shows on its category tile and high priority shows in amber.
- **Workflow editor**: a stage's phase chip carries its phase dot, so the lane, the board heads
  and the strips share one phase code.
- **Library**: each list row leads with its kind on a tile of the kind's hue. An item's document
  shows that tile, a size up, over its title.

## Keep to it

- Before adding a colour, name the one thing it means. If that meaning already has a hue, use
  that hue.
- Never use a state hue for a category, or a category hue for a state.
- Washes in tokens only (`--band-*`, `--*-tile`, `--*-edge`, `--tile-live`). Light themes get
  flat washes. Dark themes fade from the glyph (`--band-end`).
- Reuse `Chip dot` for any new coded tag (a state or a phase). Use `Head tone` for any coded
  group.

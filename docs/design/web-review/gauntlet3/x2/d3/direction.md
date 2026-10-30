# Direction: colour as information

Every hue on a screen says one thing, and says it the same way everywhere. Colour is a code you
learn once (state, kind, phase, priority, person, team) and then read before you read words. The
chrome is tinted with the theme's own accent, so each theme has a character. Colour sits in small
marks and faint washes, never in big saturated fields, so the app stays calm enough to work in
all day.

## Principles

1. **One hue, one meaning.** The accent (`--you`) means *you*: your move, the current view, tab
   and filter, the open row, focus, primary actions (Approve), your own message. The states:
   orange is running, red is blocked, green is done. Grey means waiting, queued or idle. The
   categories (`--c-*`, six hues) code kinds, phases and types. People keep their `--id-*` hue in
   every theme, on their face.
2. **Marks carry the hue, words stay ink.** A state lives in its glyph, its count and its pill;
   a person in their face; a kind in its tile. Names, titles and body text stay ink. Only short
   counts and labels (a state count, "didn't answer", "You") take a hue, mixed toward the ink so
   they keep 4.5:1. Talk's names are ink beside their coloured faces.
3. **Tinted chrome, one sheet.** The window is the theme's frame: the sidebar and an 8px margin,
   mixed from the accent. The main column is an inset rounded sheet on it. The sheet's top bar,
   the ticket's rail and the peek's bar take half of the frame's tint; a list's foot is ruled off
   by the same edge. The sidebar's head sits level with the sheet's top bar (both centred 37px
   down).
4. **Calm.** Light washes are about 8% of the hue, flat. Dark washes are 14% at the glyph's end
   and fade into the neutral band within 280px (`--band-reach`): a glow from the mark, never a
   brown or maroon field. The live run's status bar fades the same way. Each screen has one solid
   fill per job (the accent button). No stripes, no coloured card tops.
5. **Colour at rest is quieter than colour in use.** The sidebar's library kinds keep only a hint
   of their hue (45% into the sidebar grey, `--c-*-quiet`); the current view's glyph takes its
   full hue. Navigation never competes with the states on the sheet.

## Palette

- **States**: live `#ea580c` (dark `#fb923c`), blocked `#dc2626` (`#f87171`), done `#16a34a`
  (`#4ade80`). A state pill (`Chip dot`) is washed 13% and edged 32% in its hue, words in ink.
- **Categories** (light / dark): violet `#7c3aed` / `#a78bfa`, sky `#0284c7` / `#38bdf8`, teal
  `#0d9488` / `#2dd4bf`, amber `#c48a06` / `#f5c542`, pink `#db2777` / `#f472b6`, slate `#64748b`
  / `#94a3b8`. They code: library kinds (workflow violet, agent sky, skill teal, file amber);
  ticket types (feature violet, improvement sky, bug pink, task slate); workflow phases (plan
  violet, build sky, verify teal, review pink); a raised priority (amber bars); a team's key (a
  hue per key, stable by hash).
- **People**: violet, blue, rose, teal, slate faces, white initials. The hue is on the face only.
- **Themes**, each an accent, a frame and a sheet of one temperature:
  - Paper: white sheet on a lavender frame, indigo `#4f46e5`.
  - Mist: steel-white sheet with white cards, steel-blue frame, cobalt `#1d63d8`.
  - Carbon: a cool neutral graphite sheet (`#19191d`, washes and hairlines `#e2e2f0`) on a
    violet-black frame, violet `#6a5af0`. The sheet is no longer warm: frame and sheet share one
    cool family, and a warm state wash reads as a glow rather than brown.
  - Midnight: near-black sheet on a night-blue frame, electric blue `#2563eb`.
  - Harbour: lifted navy, sea frame, teal `#0e7c7b`.
  - Plum: aubergine with orchid `#a03ccf`.

  In the dark themes a `you` glyph and the current view's icon use the lighter `--you-mark`.

## Type, surfaces, density

- Geist, 11 to 28px; weights 400, 500 and 600. Unchanged by this direction.
- Surfaces, bottom to top: the frame, the sheet, the top bar and rail (half tint), the bands, the
  cards. Cards are white on a hairline in light themes and a step lighter in dark ones. A running
  agent's card is outlined in live over a 4% wash; a queued one is dashed with no fill.
- Density is fixed by the content: a list's foot is a 32px line (not 40), a Compact row's
  expansion has 10px over and 12px under. On a 900px window Compact's last row (open or not)
  stands whole above the foot; the list fades only its last 10px as rows scroll under it.

## Moves on the screens

- **Frame**: tinted sidebar on the frame with the inset sheet; the current view a pill of the
  sheet's colour in accent ink, its icon in the accent (a library kind in its own hue); other
  library kinds a quiet hint of their hue; the Space tile solid accent; the head level with the
  top bar.
- **Top bar**: tinted and ruled off; a non-zero state counter takes its hue and glyph.
- **Lists** (My queue, Compact, Intake): group bands wash in their state's hue (light flat, dark a
  glow from the glyph); neutral groups grey. Compact's Now tag is a live pill. Intake keys sit on
  their team's tile; a failed query gets a blocked band. Compact's foot is ruled and never cuts a
  row in the shots.
- **My queue's agents**: running cards outlined and washed in live; queued dashed and empty.
- **All teams**: phase dots lead the column heads; board cards carry state pills.
- **Ticket and peek**: the rail and the peek's bar chrome-tinted; Talk names in ink beside their
  faces, "You" in accent ink over an accent-tinted bubble; the live run's status bar glows live
  from its glyph; tabs underlined in the accent; type on its category tile, high priority amber.
- **Workflow editor**: a stage's phase chip carries its phase dot.
- **Library**: each row leads with its kind on a tile of the kind's hue; a document shows that
  tile a size up over its title.

## Keep to it

- Before adding a colour, name the one thing it means. If that meaning already has a hue, use it.
- Never use a state hue for a category, or a category hue for a state.
- Put the hue on the mark, not the words. If text needs a hue, it must be short and mixed toward
  the ink to 4.5:1 on every theme (check the slate person on Carbon).
- Washes in tokens only (`--band-*`, `--*-tile`, `--*-edge`, `--tile-live`, `--c-*-quiet`).
  Light themes flat; dark themes fade from the glyph within `--band-reach`.
- A dark theme's sheet and frame share a temperature.
- Reuse `Chip dot` for any coded tag; `Head tone` for any coded group.

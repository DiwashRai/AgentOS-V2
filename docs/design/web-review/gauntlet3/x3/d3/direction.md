# Direction: colour as information

Every hue on a screen says one thing, and says it the same way everywhere. Colour is a code you
learn once (state, kind, phase, priority, person, team) and then read before you read words. The
chrome is tinted with the theme's own accent, so each theme has a character. Colour sits on marks
(glyphs, dots, faces, tiles, meters) and in glows that start at a mark and fade out; surfaces,
cards and pills stay neutral. The app stays calm enough to work in all day, and your move is the
loudest thing on any screen.

## Principles

1. **One hue, one meaning.** The accent (`--you`) means *you*: your move, the current view, tab
   and filter, the open row, focus, primary actions (Approve), your own message. The states:
   orange is running, red is blocked, green is done. Grey means waiting, queued or idle. The
   categories (`--c-*`, six hues) code kinds, phases and types. People keep their `--id-*` hue in
   every theme, on their face. A label that is none of these (a workflow's "Default") is a plain
   neutral chip, never a state's colour.
2. **The hue sits on the mark.** A state lives in its glyph, its count, its pill's dot and its
   meter; a person in their face; a kind in its glyph and tile. Names, titles and body text stay
   ink. Only short counts and labels (a state count, "didn't answer", "You") take a hue, mixed
   toward the ink so they keep 4.5:1. Talk's names are ink beside their coloured faces.
3. **Glows, not stripes.** A group's band is the neutral grey band in every theme, lit by a glow
   of its state's hue from the glyph's end that fades into the grey within `--band-reach` (300px
   light, 240px dark). Down a list you see a column of coloured glyphs with a soft light behind
   each, never full-width stripes of colour, and a warm hue never browns a band on the dark. The
   live run's status bar on the ticket glows the same way, into the card's own well.
4. **Neutral cards, neutral pills.** Cards are white on a hairline (a step up in the dark),
   whatever their state: a running agent's card says live with its glyph and its meter, so the
   "Your move" rows above stay the call to action. A queued card is dashed with no fill. A state
   pill (`Chip dot`) is the tag's neutral hairline over a faint 8% wash, the hue on its dot; your
   move's pill a step firmer (12%).
5. **Tinted chrome, one sheet.** The window is the theme's frame: the sidebar and an 8px margin,
   mixed from the accent. The main column is an inset rounded sheet on it. The sheet's top bar,
   the ticket's rail and the peek's bar take half of the frame's tint, ruled off. The sidebar's
   head sits level with the sheet's top bar (both centred 37px down).
6. **Kinds read at rest.** The sidebar's library kinds (Workflows violet, Agents sky, Skills
   teal, Files amber) keep 78% of their hue at rest, so all four read as one coded set (none looks
   disabled); the current view's glyph takes its full hue on the sheet-coloured pill.

## Palette

- **States**: live `#ea580c` (dark `#fb923c`), blocked `#dc2626` (`#f87171`), done `#16a34a`
  (`#4ade80`). Glow strength `--tint` 11% in every theme. Pill washes 8% (`--*-tile`), your move's
  12%; `--you-edge`/`--live-edge` 30% for a chosen filter and the live bar's rule.
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
    violet-black frame, violet `#6a5af0`.
  - Midnight: near-black sheet on a night-blue frame, electric blue `#2563eb`.
  - Harbour: lifted navy, sea frame, teal `#0e7c7b`.
  - Plum: aubergine with orchid `#a03ccf`.

  In the dark themes a `you` glyph and the current view's icon use the lighter `--you-mark`.

## Type, surfaces, density

- Geist, 11 to 28px; weights 400, 500 and 600. Unchanged by this direction.
- Surfaces, bottom to top: the frame, the sheet, the top bar and rail (half tint), the bands
  (neutral grey with a state glow at the left), the cards (neutral).
- Density is fixed by the content: a list's foot is a 32px line, a Compact row's expansion has
  10px over and 12px under. On a 900px window Compact's last row stands whole above the foot.

## Moves on the screens

- **Frame**: tinted sidebar on the frame with the inset sheet; the current view a pill of the
  sheet's colour in accent ink; the four library kinds in their hues at rest; the Space tile solid
  accent; the head level with the top bar.
- **Top bar**: tinted and ruled off; a non-zero state counter takes its hue and glyph.
- **Lists** (My queue, Compact, Intake): grey group bands, each lit from its glyph by its state's
  glow; neutral groups plain grey. Running rows carry neutral pills with a live dot (Builder 3/5).
  Intake keys sit on their team's tile; a failed query's band glows blocked.
- **My queue's agents**: neutral cards; live in the glyph and the orange meter; queued dashed.
- **All teams**: phase dots lead the column heads; board cards carry neutral state pills with a
  coloured dot.
- **Ticket and peek**: the rail and the peek's bar chrome-tinted; Talk names in ink beside their
  faces, "You" in accent ink over an accent-tinted bubble; the live run's status bar glows live
  from its glyph into the card's well; tabs underlined in the accent; type on its category tile,
  high priority amber.
- **Workflow editor**: a stage's phase chip carries its phase dot; "Default" a neutral chip.
- **Library**: each row leads with its kind on a tile of the kind's hue; a document shows that
  tile a size up over its title.

## Keep to it

- Before adding a colour, name the one thing it means. If that meaning already has a hue, use it.
- Never use a state hue for a category or a plain label, or a category hue for a state.
- Put the hue on the mark, not the words or the surface. If text needs a hue, it must be short and
  mixed toward the ink to 4.5:1 on every theme.
- A state reaches past its mark only as a glow that starts at the mark and fades within
  `--band-reach` (`--band-*`, `--now-live`). No flat full-width washes, no tinted cards, no
  coloured pill edges.
- A dark theme's sheet and frame share a temperature.
- Reuse `Chip dot` for any coded tag; `Head tone` for any coded group.

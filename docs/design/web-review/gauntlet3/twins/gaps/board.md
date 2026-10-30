# Twin "board": gaps

Reference: `linear-bar/20-ai-f4.png`, crop [232, 202, 2224, 812] at scale 1.84 (13px cap height
measured 17.45-17.56 reference px on "Mode", "Design" and "Faster"), theme Carbon (`dark`).
Measurements below are CSS px (reference px / 1.84). Format: component: what Linear does / what
ours does / what I used instead.

## Things the kit couldn't draw

- **Board columns (Stack cols={3})**: Linear's three columns are unequal: Offline Mode's and Core
  Performance's cards are 367px wide, UI Refresh's 418px, 13.6px apart / `Stack cols={3}` lays out
  only equal columns (384px each here). A row Stack can't do it either: `grow` gives equal shares
  (flex 1 1 0, min-width 0) and a column without `grow` is only as wide as its longest line (about
  310px here). Nothing in the kit sets a column's width (Table's widths stop at 300px and its rows
  are lists or swimlanes) / equal columns, 14px apart. Column 2 starts 16px right of Linear's and
  column 3 starts 34px right; the right edges of column 3 match.
- **Board without swimlanes (Table + Row kind="columns"/"band")**: Linear's board is three bare
  column heads over their cards: no swimlane, no rules / the kit's board always draws a swimlane's
  band head across the board, a hairline between columns and a ruled, sticky column head /
  composed from Stack (cols={3}, one column Stack per lane), with a head line of Icon, Text and
  Buttons.
- **Padding without a surface**: the bar is inset 10px from the window, the board 14px, a column's
  glyph 14px and its add button 10px / no kit piece pads a region without drawing a surface
  (Surface's recess and sheet paint a ground) / empty Stacks as spacers, sized by their parent's
  gap. Lengths that are no single step (18px: the cards under the head, a card's foot under its
  title) are two gaps either side of a spacer (2 + 16).
- **View tabs (Segmented)**: three fully round pills 31px tall, 7px apart, words inset 12.5px; every
  tab sits on a hairline with a faint fill, and the pressed one has a firmer fill and brighter words
  (inactive words about #76797E) / 28px chips with 8px corners and a fixed 4px gap, words inset 9px;
  only the pressed chip has a fill and a hairline, and the others are bare words in ink-2
  (#BDBAB6, much brighter than Linear's) / Segmented as is. Active and Backlog start 9px and 17px
  left of Linear's.
- **Bar icon buttons (Button size="sm")**: four 30px circles on a dim hairline with almost no fill,
  7px apart / 28px squares with 6px corners, the --ctl fill, a hairline and a drop shadow. The kit
  has no round icon button / Button size="sm" (as the peek uses them), 8px apart (the nearest step
  to Linear's 37px pitch: ours is 36).
- **Bar glyphs (Icon)**:
  - Filter: Linear has three lines narrowing downward / the kit has none / I used `compact` (four
    equal lines, so it reads as a menu).
  - Display options: Linear has two sliders (a line with a knob each) / none / `settings` (a gear).
  - Insights: Linear has a bar chart (a middle, a tall and a short bar, 13px) / none / `high`
    (three rising signal bars, 12px, smaller).
  - Details: Linear has a rounded panel with a bar at its right / none / `intake` (a tray).
- **Project glyphs in the column heads (Icon)**:
  - Offline Mode: Linear has wifi arcs with an exclamation / none / `high` (signal bars, the same
    glyph as the priority, 12px).
  - Core Performance: Linear has an outline bolt / `feature` is a filled bolt on a faint square
    (14px) / `feature`.
  - UI Refresh: Linear has a crossed pencil and ruler / none / `compose` (a page and a pen, 16px).
  - Our three head glyphs are three sizes (12, 14, 16) where Linear's are all 13px. With one 14px
    gap after the glyph, the names land 0, 2 and 3.5px right of Linear's. The kit has no
    project-icon set.
- **Status pill with its faces (Chip)**: Linear's pill (26px, round, a dim hairline) holds the words
  ("Working...", "Waiting", "Finished", "Error") and then the agent's and the person's faces inside
  its right end / Chip takes words only, no children / Chip tone="edge" (20px, 12px words) with the
  faces after it, outside, 4px on (no dot, since Linear's pill has none; All teams' pill draws a
  dot).
- **Faces (Avatar)**: photos and agent brand logos (OpenAI's knot, Cursor's cube, a third agent's
  mark), about 15px, the second overlapping the first by about 4px / initials only: Avatar
  size="sm" is a 16px neutral grey disc with two letters, and `people` lays faces 2px apart, never
  overlapping / Avatar size="sm" (a run's starter), `people` for two. The names behind the
  initials are mine (Codex, Cursor and Copilot for the logos; made-up names for the photos), since
  Linear shows no names.
- **Status glyphs (Mark)**: Linear's workflow states have their own hues. In Progress is a yellow
  (#F0BF00) ring half filled; In Review is a green (#27A644) ring three quarters filled; Done is an
  indigo (#5E6AD2) disc with a dark tick / the kit's marks are tied to its attention states' hues /
  In Progress on `run` (an orange ring with a half pie: the form, not the hue), In Review on `wait`
  (a grey ring, three quarters: the form, not the hue), Done on `done` (a green disc with a tick:
  the form, not the hue). There is no way to draw Linear's yellow, a green review ring or an indigo
  done.
- **Priority (Icon, Button)**: a 26px circle on a dim hairline, no fill, holding the bars. Linear
  has High (3 bars lit, ENG-2749 and ENG-2703), Medium (2 of 3 lit, five cards), Low (1 lit,
  ENG-1882) and No priority (three dashes, ENG-2753) / the kit has no round icon-only pill and no
  medium glyph / Button size="xs" default (a 20px rounded square with 4px corners, a fill and a
  hairline) holding `high`, `low` or `normal`. Medium is drawn as `low` (one bar lit: the nearer
  by lit area), and No priority as `normal`'s three dashes.
- **Label pills (Chip)**: about 26px tall, 13px words in a grey near #888D96, a round hairline barely
  off the card (#1F2021 on #141516). Each dot is the label's own colour: Design cyan #55CDFF, iOS
  yellow #F0BF00, System2026 orange #CB5C2D, Performance green #27A644, Android indigo #5E6AD2 /
  Chip tone="edge" is 20px tall with 12px words, its hairline much brighter (#42413E on #262523),
  and its dot takes only the five state hues / Chip tone="edge": Design and Android on `you`
  (indigo), iOS and System2026 on `live` (orange), Performance on `done` (green). There is no free
  label colour, so Design reads like Android, and iOS like System2026.
- **Pull-request pills (Chip, Icon)**: a git pull-request glyph in green before the number / the
  kit has no pull-request glyph, and a Chip's lead is always the grey --prop-mark / Chip
  tone="edge" lead="branch".

## Where a kit component draws differently and no composition avoids it

- **Card look="ticket", the surface**: Linear's card is barely off the ground (#141516 on #121314)
  on a dim hairline (#222324) / Carbon's --teams-card is the wash at 7% over the page (#262523 on
  #171615, +15) on --teams-card-edge (#42403D, about +40 over the page) with a drop shadow. Our
  cards read as raised grey slabs, Linear's as outlines on the ground.
- **Card look="ticket", its rhythm**: the Card puts a fixed 6px between its children (`.main`'s
  gap), and its padding is fixed at 10px on top and 12px at the sides and bottom. Linear's title
  sits 2px under the key's line and its foot 18px under the title.
  - Composition: I gave the Card one child, a Stack of the three lines, so the gaps are mine. The
    title now lands within 1px of Linear's, and so do the foot and the first row's top edge.
  - The key line's height depends on what it holds: 20px with a pill (the Chip), 18px without one
    (Badge sm 18, faces 16), and the kit has no way to give a line a height. Cards without a pill
    (ENG-1882, ENG-1337) take a 4px gap under the key where the others take 2, so every title and
    card height match.
  - What stays: our cards are 102.2px tall to Linear's 104.3, because our foot chips and priority
    are 20px to Linear's 26. With Linear's 9-10px between cards (ours 10), each row comes about 1px
    higher than the last against Linear's 113px pitch (ours is 112). By the third row, the top
    edges are 1.6px high, the titles 2px and the bottom edges 2.7px.
- **Badge kind="key" size="sm"**: Linear's key is 11px in a dim grey (about #66696F) / 12px in
  ink-3 (#A9A5A1).
- **Card title (Text variant="label")**: Linear's is 13px regular in a grey near our ink-2 (about
  #BEBEC4) / 14px regular in ink-1, as All teams draws card titles (kept as our screen does).
- **Column head name**: Linear's is 13px medium in a grey between our ink-1 and ink-2 (about
  #D5D5D5) / ink-1 (kept as All teams' column head draws it).
- **Quiet xs buttons (the heads' more and add)**: their glyphs are 10.5px (dots) and 8.5px (plus)
  in a 20px box; Linear's plus is 10px.
- **Theme ground**: Linear's window is #121314; Carbon's page is #171615, a touch lighter and
  warmer (the nearest of the six).

## Not the kit's

- The reference fades its last rows to black, a marketing overlay: title ink is about 192 in rows
  1-2, about 167 in row 3, 116 in row 4 and 64 in row 5, and the ground darkens from #121314 to
  about #0B0B0C. The crop now ends at reference y 1014, in the 16px gap between rows 3 and 4, so
  rows 4 and 5 are left out of both images. The twin draws only each lane's first three tasks and
  leaves out the ones below the crop: Offline Mode's ENG-2692 and ENG-2690, Core Performance's
  ENG-2691 "Improved empty states", and UI Refresh's two ENG-2050 cards and its sixth card. The
  heads still say 5, 4 and 6, as Linear's do. Row 3 is already a little dimmed by the fade (its
  title ink is about 170 to rows 1-2's 192), and the twin draws it at full strength.

# Linear's way of separating without greys: what we take (opus)

Every value below was measured with Pillow on the PNGs named. Our screens are 1440×900 at 1x. Linear's are 2x captures, so a 1px hairline there is a run of 1–2 px, and I quote its darkest or lightest pixel. "+n" means n levels (0–255) lighter than the plane under it.

The short version: **Paper is mostly there. Carbon is not.** Carbon still draws almost every control, tag, field and expanded panel as a +13 fill with no edge (`--fill-2` → `#1c1e21` on the `#0f1012` sheet). Linear draws the same things as a +2..4 fill inside a +13..17 hairline. Most of what follows is one move, applied in different places: in Carbon, move the step from the fill to the edge.

---

## 1. Techniques, most effective first

### T1. In Carbon, controls are a hairline, not a fill
- **Linear:** `twins/board/linear.png`, the view tabs top left and the round icon buttons top right. The sheet is `#121314`, an inactive tab's fill is `#161718` (+4) and its edge is `#1f2021` (+13). The active tab is `#1b1c1d` (+9) inside `#252626` (+19). `twins/triage/linear.png`: the Display button is a faint fill on a hairline, and the filter button is a dashed outline with no fill at all.
- **Ours:** `frame/2-my-queue-dark.png`. "Request changes", "Retry", "New ticket" and the search field are `#1c1e21` (+13) with **no edge**: the button's edge pixel at x=961 is `#151618`, which is just antialiasing. They read as grey bricks. `twins/triage/twin.png` shows the same thing: the filter and display buttons are solid grey squares.
- **Change:** `tokens.css`, add a Carbon override block after the derived block (the mirror of Paper's controls block at line 269):
  - `--ctl: color-mix(in srgb, var(--wash) 2%, transparent)` (≈ `#131416`)
  - `--input` and `--field`: the same value
  - `--ctl-rest-edge: var(--rule)` (`#222326`)
  - `--select-edge: var(--rule)`
  - keep `--ctl-lift: var(--fill-2)` for hover, so hover is the one time a control fills.

  `Button.module.css` and `Form.module.css` already draw `--ctl-rest-edge`, so nothing else changes.
- **Mode:** Carbon.

### T2. In Carbon, tags are outlined, with no fill
- **Linear:** `twins/board/linear.png`, the "Performance", "iOS" and "#56995" pills on a card. The fill **is the card** (`#141516`) and the edge is `#1e1f20` (+10). The colour lives only in the dot or the PR glyph. `twins/issues/linear.png`: the "Currency" label is an edge of `#29292b` around the sheet's own `#101012`.
- **Ours:** `twins/board/twin.png`: the same pills are filled `#1f2124` (+13 over the card's `#121315`) with no edge. In `lists/3-compact-filters-dark.png` the run chips ("Builder 3/5", "Cy · Review the change") are filled the same way. In `editors/2-workflow-editor-dark.png` the "tests" and "context/api-conventions.md" chips are `#1f2124` and the "Build"/"Verify"/"Review" tags are `#26282c`.
- **Change:** `tokens.css`, Carbon:
  - `--list-chip-fill: transparent`
  - `--tag-edge: var(--rule)`
  - `--chip-firm: transparent`
  - `--chip-firm-edge: var(--rule-strong)` (`#323439`)

  `Chip.module.css` and `Badge.module.css` already paint `--tag-edge`/`--chip-firm-edge` as an inset line. Keycaps (`Esc`, `/`) follow through `--field` (T1).
- **Mode:** Carbon.

### T3. An opened thing is a card (a hairline and a faint tone), not a slab
- **Linear:** `twins/home/linear.png`, the comment card ("karri · 4 min ago"). It is `#19191a` on a `#151617` sheet (+4) inside a `#282a2b` edge (+19). Nothing in Linear's dark screens lays a +13 fill over a large area.
- **Ours:** `lists/2-compact-open-dark.png`: the open NW-17 row is a `#1c1e21` panel 307 px tall (y 396–702) with **no edge**, and the buttons inside it are `#282b2f`, so it is grey on grey. `ticket/2-ticket-runs-dark.png`: the expanded run #42 is the same `#1c1e21` slab (y 515–749), and its Failed/Running/Pending pills are `#282b2f` inside it.
- **Change:**
  - `tokens.css` derived block: `--list-open: var(--tone-2)` (Carbon `#121315`; Paper white).
  - `Row.module.css`, the open state (line 44): add `box-shadow: inset 0 0 0 var(--line-1) var(--card-edge)`.

  With T1 and T2 in place, the buttons and pills inside become hairlines on a near-sheet card. That is the run card's own recipe (`Stepper .card`), which already measures right: `#121315` inside `#222326`.
- **Mode:** both, but it only hurts today in Carbon. In Paper `--list-open` is `--fill-2`, a slate panel, and white plus hairline is the same fix.

### T4. Draw a hairline round the sheet
- **Linear:**
  - `twins/issues/linear.png`: the sheet `#101012` meets the `#090909` ground with an edge pixel of `#292933` (x≈844).
  - `twins/home/linear.png`: the sheet edge is `#282a2b` on the left (x≈479).
  - `01-theme-ash.png`: the sheet's left edge is `#e3e4ec` against the `#edeef3` ground (x=231).
- **Ours:** `Frame.module.css` `.main` ("two planes and no line"). Carbon's ground `#0a0b0c` against the sheet `#0f1012` is a 5-level step. On every dark screen the sheet's right and bottom edges dissolve; check `frame/2-my-queue-dark.png` at x=220–240 (the edge goes straight `#0a0b0c` → `#0f1012`).
- **Change:** `Frame.module.css` `.main`: `box-shadow: inset 0 0 0 var(--line-1) var(--sheet-rim)`. In `tokens.css` set `--sheet-rim: var(--rule)` in Carbon (`#222326`). In Paper it can be `transparent`; its 16-level step already holds. If you want Paper crisper, use `color-mix(in srgb, var(--hair) 8%, transparent)`.
- **Mode:** Carbon (Paper optional).

### T5. Part a card's sections with a hairline, not a deeper band
- **Linear:** `more/ticket-02-issue-page-light.png`, the "Discussion summary" card. Its foot ("Generated Sep 24, 2025") is parted by a `#dcdcdc`-class rule, and the card stays `#ffffff` all the way down. Popovers do the same: in `twins/project-teams/linear.png` the "Change teams…" find row is the popover's own `#212123`, with a `#29292b` divider under it (y≈737). In `twins/subissues/linear.png` the section divider is `#e5e5e5` on a white popover.
- **Ours:**
  - `ticket/1-ticket-light.png`: the run card's "now" foot is a `#f8f9fa` band (y 372–450) inside a white card. In Carbon it is `#1a1b1e` inside `#121315`.
  - `frame/3-theme-menu-light.png`: the popover's "Change theme…" find strip is `#f8f9fa` on white.
  - `controls/2-owner-picker-dark.png`: the find strip is `#27292d` on the `#1f2124` popover.
- **Change:**
  - `Stepper.module.css` `.now`: `background: none; border-top: var(--line-1) solid var(--card-edge)`.
  - `Popover.module.css` `.find`: `background: none; border-bottom: var(--line-1) solid var(--pop-rule)`. This reverses the "no rule" note there; the rule is what Linear uses.
- **Mode:** both.

### T6. Show the pressed one with a hairline box and ink, not a tinted wash
- **Linear:**
  - `twins/subissues/linear.png`, the pressed "Status" and "Assignee" chips: `#ffffff` inside a `#d5d5d5` edge, words in full ink. The unpressed ones are bare words.
  - Dark, `twins/display/linear.png`: the chosen "List" is `#28292e` inside `#37383d`. In `twins/board/linear.png` the active tab is `#1b1c1d` inside `#252626`.
- **Ours:** `Segmented.module.css` (line 50): the pressed pill is `--you-soft` with `--you-text` words. In `lists/2-compact-open-dark.png` and `controls/3-compact-filters-dark.png`, "Everything 18" is a navy slab. In `twins/subissues/twin.png`, "Status"/"Assignee" are lavender slabs with indigo words. It is a coloured slab doing the job a line does.
- **Change:** `Segmented.module.css` pressed: `background: var(--ctl); border-color: var(--ctl-rest-edge); color: var(--ink-1)`, using a firmer edge, `var(--rule-strong)`. Keep the accent in the count only: `em { color: var(--you-text) }`. In Paper that gives white on `#dadde6`; in Carbon (with T1) about `#131416` on `#323439`.
- **Mode:** both.

### T7. Paper's tag edge must be the firm hairline, because white on `#fcfcfd` is invisible
- **Linear:** `more/ticket-02-issue-page-light.png`, the "Bug" label: the fill is the sheet itself (`#fcfcfc`), the edge `#dcdcdc` (−32). Selects in `twins/subissues/linear.png` have a `#dadada` edge, and the popover edge is `#d7d7d7`.
- **Ours:** `--tag-edge: var(--rule)` = `#eaecf1` (−18). The white fill is +3 over `#fcfcfd`, which nobody sees. So a plain Paper chip (the `ticket` and `AGENTS.md` chips in `ticket/3-ticket-workflow-light.png`, "Library has v4") reads as a smudge, not a part. The firm chips already get it right: "Builder 3/5" in `lists/3-compact-light.png` has a `#dadde6` edge (`--chip-firm-edge`). So do buttons and selects (`--rule-strong`, `#dadde6`), which match Linear.
- **Change:** `tokens.css` Paper block: `--tag-edge: var(--rule-strong)`.
- **Mode:** Paper.

### T8. Icon and compose buttons sit on a hairline circle
- **Linear:** `twins/board/linear.png`, the four round icon buttons top right: fill `#161718` (+4), edge `#1f2021` (+13). `twins/home/linear.png`: the sidebar's compose button is a circle on a hairline.
- **Ours:** `Frame.module.css` `.create` (line 115) is `background: var(--fill-2)`, a grey disc in both modes (`frame/1-my-queue-light.png` and `-dark.png` at 204,38). Square buttons in the bars are grey squares in Carbon (`ticket/2-ticket-runs-dark.png`, the "…" at 1385,38: `#36383d`-class fill).
- **Change:** `.create`: `background: none; box-shadow: inset 0 0 0 var(--line-1) var(--rule-strong)`. Square buttons follow T1.
- **Mode:** both.

### T9. My own message: white or near-sheet on a hairline, not a grey bubble
- **Linear:** keeps a grey bubble here (`twins/home/linear.png`, `#272829` on `#1b1c1e`), so this one is about our goal, not a copy. Its cards elsewhere (T3) show the means.
- **Ours:** `Thread.module.css` line 97, `--tk-mine` = `--fill-2`. That is `#f2f3f6` in Paper (`ticket/1-ticket-light.png` 1080,395) and `#1c1e21` in Carbon. It is the darkest surface on the ticket page in both modes.
- **Change:** `tokens.css` derived block: `--tk-mine: var(--tone-2)`. In `Thread.module.css` add `box-shadow: inset 0 0 0 var(--line-1) var(--card-edge)`. Paper: white on `#eaecf1`; Carbon: `#121315` on `#222326`. The right-aligned position and the "You" header already say whose it is.
- **Mode:** both.

### T10. Paper's group band: lighter, so it reads as a stripe and not an object
- **Linear:** `01-theme-ash.png`. The band is `#f7f7f7` on a `#ffffff` sheet (−8), hue-neutral and **full bleed**, with row rules of the same `#f7f7f7`. It reads as a section stripe.
- **Ours:** `#f5f6f8` on `#fcfcfd` (−7, slate-blue), rounded 8px and floating, 4–7 per list screen across 1172px (`frame/1-my-queue-light.png` y 68–103, `teams/1-all-teams-light.png`). The step is Linear's, but the rounded, inset, tinted block reads as a grey tablet.
- **Change:** `tokens.css`: Paper `--group-band: color-mix(in srgb, var(--wash) 2%, transparent)` (≈ `#f8f8fa`) and `--group-band-hover: var(--fill-1)`. `Head.module.css` `.group::before`: `border-radius: var(--r-2)`. The glyph and the 500-weight name already carry the heading. Carbon's band (`#17181b` on `#0f1012`) is Linear's own (`#171b1c` on `#101012`); leave it.
- **Mode:** Paper.

---

## 2. Greys and shadows we still have

**Carbon: grey slabs (fill, no edge)**

| Where (screen, point) | Measured | What paints it | How Linear separates the same kind |
|---|---|---|---|
| Every button at rest: Request changes, Retry, New ticket (`frame/2-my-queue-dark` 1320,38) | `#1c1e21`, no edge | `--ctl` = `--fill-2` | +4 fill, +13 edge (T1) |
| Bar search, library search, "Search agents" (`editors/2-workflow-editor-dark` 1200,183) | `#1c1e21` | `--field`/`--input` | Reply box in `home/linear`: faint fill inside a `#3b3c3d` edge |
| Compact's open row (`lists/2-compact-open-dark`, y 396–702) | `#1c1e21`, 307 px tall | `--list-open` | A card: +4 inside a +19 hairline (T3) |
| Cancel / Peek / Open ticket inside it | `#282b2f` on `#1c1e21` | `--ctl` on `--list-open` | Hairline buttons (T1) |
| Expanded run #42 (`ticket/2-ticket-runs-dark`, y 515–749) | `#1c1e21` | `--list-open` | Card (T3) |
| Failed / Running / Pending pills in it, "47m of 90m" | `#282b2f` | `--chip-firm` = `--fill-3` | Outlined pill ("Working…" in `board/linear`) |
| Run chips "Builder 3/5", "Cy · Review the change" (`3-compact-filters-dark`) | `#232529`-class | `--list-chip-fill` | Outline only (T2) |
| Stage tags Build/Verify/Review, skill and file chips (`2-workflow-editor-dark` 380,276; 330,349) | `#26282c`, `#1f2124` | Chip | Outline only (T2) |
| Rounds stepper "− 3 rounds +" (600,630) | `#1c1e21` | `--field` | Hairline field |
| Run card's "now" foot (`ticket/2-ticket-runs-dark` 800,415) | `#1a1b1e` in `#121315` | `Stepper .now` `--fill-1` | A rule (T5) |
| Talk bubble | `#1c1e21` | `--tk-mine` | (T9) |
| Popover find strip (`controls/2-owner-picker-dark` 700,240) | `#27292d` on `#1f2124` | `Popover .find` `--fill-1` | Same fill, `#29292b` divider (T5) |
| "Everything 18" pressed filter | navy wash | `Segmented` `--you-soft` | Box + ink (T6) |
| Foot keycaps `Esc`, `/` | grey squares | Badge `--field` | Follows T1 |
| Sidebar compose disc | `--fill-2` | `Frame .create` | Hairline circle (T8) |
| Sheet against ground | 5-level step, no edge | `Frame .main` | `#292933` rim (T4) |

**Paper: grey slabs**

| Where | Measured | What paints it | How Linear separates it |
|---|---|---|---|
| Group bands, every list (`frame/1-my-queue-light` y 68–103) | `#f5f6f8` rounded | `--group-band` `--fill-1` | `#f7f7f7` full-bleed stripe (T10) |
| Run card's "now" foot (`ticket/1-ticket-light` y 372–450) | `#f8f9fa` in white | `Stepper .now` | `#e8e8e8` rule (T5) |
| Talk bubble (1080,395) | `#f2f3f6` | `--tk-mine` | White + hairline (T9) |
| Popover find strip (`frame/3-theme-menu-light` y 745–784) | `#f8f9fa` | `Popover .find` | Divider `#e5e5e5` (T5) |
| Pressed filter, chosen display chips (`twins/subissues/twin`) | lavender wash | `Segmented` | White + `#d5d5d5` (T6) |
| Code block in a text block (`editors/3-file-editor-light` 600,700) | `#f7f8f9` | Text code | Linear's code is a fill too; this one is acceptable. If kept, it is the one sanctioned grey. |
| Sidebar compose disc | `--fill-2` | `Frame .create` | Hairline circle (T8) |
| The open row (not in these shots) | `--fill-2` | `--list-open` | White card (T3) |

**Shadows.** Only the popover (`--pop-shadow`) and the theme menu, its instance, still cast one (`frame/3-theme-menu-light`: the `#e1e3ea`→`#e8eaf1` ramp above it). That matches Linear, whose popovers also float on a shadow (`twins/subissues/linear` `#f7f7f7`→`#f1f1f1` ramp; `project-teams/linear` `#0d0d0f` dark under its edge). Nothing on the sheet relies on a shadow; keep it that way.

**Greys that are fine (Linear does the same):**
- Carbon's group band.
- The hover and highlighted row fills.
- The sidebar's current view in Carbon (`#1d1f22`). Linear fills its current item too.

---

## 3. What not to take from Linear

- **Outlining every inactive tab.** `twins/board/linear.png` boxes All tasks / Active / Backlog each in a hairline pill. Our bar's filter row carries up to five chips with state glyphs and counts beside the title and the stat words. Boxing each one turns the bar into a row of boxes. Box the pressed one only (T6).
- **Indigo-tinted selection over a large area.** `twins/issues/linear.png`'s selected rows are `#1b1d36` on `#101012`, a saturated +9..+36 slab. Our open row holds a stepper, buttons, a thread and the `--you` "Approve" primary. An indigo panel behind them would drown the one accent that means "act here". Use tone plus hairline (T3).
- **The grey user bubble** (`home/linear` `#272829`). It is Linear's one remaining grey slab; don't copy it (T9).
- **Hue-tinted resource chips** (`twins/project/linear.png`: blue-washed "PRD/Spec", amber "Approval Chain"). Colour belongs in the glyph. Our chips already carry state dots, and tinted fills would compete with the state glyphs in the rows.
- **Ash's faint label edge** (`01-theme-ash.png`, `#f4f5f5` on white). It disappears. Take the newer `#dcdcdc` (T7).
- **The soft drop shadow under light cards** (`ticket-02`'s summary card shows a 3px `#fbfbfb`→`#f8f8f8` ramp outside its `#e8e8e8` edge). Our cards are flat on a hairline and should stay so; a shadow on the sheet breaks the "only what floats" rule.

---

## 4. Secondary: which reads better now

- **Carbon:** Linear's reads clearly better. Its dark sheet is one plane with lines drawn on it: controls, tags and cards are hairlines over +2..4 fills, and the sheet has a rim. Ours scatters `#1c1e21` bricks (buttons, search, chips, the open row, the run card) over a sheet that dissolves into its ground. T1–T4 close most of the gap.
- **Paper:** close to par on the lists, where our white-on-hairline buttons (`#dadde6` edge) match Linear's `#dadada`. Linear's ticket page and popovers read cleaner because hairlines carry their structure where ours still use inner fills (`#f8f9fa` run foot, `#f8f9fa` find strip, `#f2f3f6` bubble) and because our tag edges are too faint to see. T5, T7 and T9 fix that.

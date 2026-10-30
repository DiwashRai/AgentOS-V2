# Style review — codex

The remaining problem is the use of translucent neutral fills as a universal separator. Carbon's ordinary cards are already close to the required tonal step, but its expanded rows, chips, buttons and messages use a second, much brighter scale. Paper removes most resting control fills, then puts grey back into group headings, the run footer, messages and code blocks. Changing the page colours again would miss the problem.

I inspected all 25 PNGs actually present in `q7/screens` (15 Paper, 10 Carbon), all eight twin pairs, the three identified light references, and the relevant dark references. Paths below are relative to this report: **S** means `../q7/screens/`, **T** means `../q7/twins/`, and **L** means `../../linear-bar/`. Measurements are decoded PNG RGB values at original resolution, not colours read from resized previews. Coordinates start at the upper left. Proposed values are starting points, not measured results of an implementation. No application files were changed or server started.

Linear does use greys and shadows. Its Ash group headers are `#f7f7f7`; its dark context menu is `#1b1c1f`; its light display popover casts a shadow. The useful lesson is selective boundaries and small tonal steps. Blindly copying its palette would fail this brief.

## 1. Techniques, in order of impact

### 1. Give an expanded object a contour instead of flooding its entire area

**Linear:** In [T/board/linear.png](../q7/twins/board/linear.png), the ground is predominantly `#121314` in rectangle `(22,89)–(2179,121)` and a top card is `#141516` in `(44,235)–(689,316)`: a two-level RGB step. Rounded hairlines and the gaps between cards establish the objects. [L/light/dash-01-dashboard.png](../../linear-bar/light/dash-01-dashboard.png) goes further: the app ground measures `#0f1011`, while a chart interior measures `#0e1010`. The cards remain separate because of their perimeter and headings.

**Ours:** [S/lists/2-compact-open-dark.png](../q7/screens/lists/2-compact-open-dark.png) fills the NW-17 expansion, approximately `x244–1416, y396–703`, with `#1c1e21` against `#0f1012`. Its interior buttons then reach `#282b2f`. This is the largest unnecessary grey slab in the real dark screens. The expanded run in [S/ticket/2-ticket-runs-dark.png](../q7/screens/ticket/2-ticket-runs-dark.png) repeats it. The ordinary workflow stage cards, by contrast, measure only `#121315` and already demonstrate the smaller step.

**Change:** In `tokens.css`, separate `--list-open` from `--fill-2`: start at `var(--tone-2)` in both themes, approximately `#121315` in Carbon and white in Paper. In `Row.module.css`, give `.row.open::before` a single inset 1px contour using `--card-edge`; this is a line with zero blur, not elevation. Preserve the existing expansion, padding and stage rail. Use heading weight and the existing actions to identify the open content. Do not turn expansion into a large indigo selection patch: Linear's `T/issues/linear.png` uses `#1b1d36` for checked selection, a different state.

**Mode:** Both; Carbon first. This also changes keyboard-selected library rows, which share `Row.open`; retain their visible contour and focus ring.

### 2. Let headings, gaps and one hairline carry group structure

**Linear:** The column headings in [T/board/linear.png](../q7/twins/board/linear.png) sit directly on the ground. A glyph, a stronger name, a quiet count and open space distinguish each group without a rounded filled banner. Ash's [L/01-theme-ash.png](../../linear-bar/01-theme-ash.png) does use `#f7f7f7` bands, but those are continuous structural strips. They are evidence that Linear sometimes uses grey, not an instruction to add it everywhere.

**Ours:** My queue, Compact, Intake and All teams repeatedly paint rounded, almost full-width bands: `#f5f6f8` on Paper and `#17181b` on Carbon. In Compact there are seven of them. The bands become the strongest repeating shapes, even where the headings and existing gaps already explain the groups.

**Change:** In `tokens.css`, set `--group-band: transparent`; retain a small hover response rather than a resting panel. In `Head.module.css`, replace the band in `.group::before` and `.line::before` with a 1px top rule using `--rule`, with square ends. Keep `.name` at 13px/500 and the note/count at 12–13px/400. Keep the existing 10px group gaps and sticky opaque `--ground`; removing the decorative band must not make a sticky heading transparent to scrolling text. This changes paint, not grouping or density.

**Mode:** Both. Paper benefits especially because the banners interrupt an otherwise white document.

### 3. Outline tags; colour their glyphs; stop filling every label

**Linear:** [T/board/linear.png](../q7/twins/board/linear.png) separates Performance, iOS and agent-state pills with a faint outline, quiet words and a coloured dot or glyph. The Performance region `(850,330)–(1000,360)` is predominantly the card's own `#141516`. In [T/project/linear.png](../q7/twins/project/linear.png), Large, Improvements and Now are similarly outlined labels, while Resources intentionally have a different treatment.

**Ours:** The equivalent Performance region in [T/board/twin.png](../q7/twins/board/twin.png) is predominantly `#1f2124`, on a `#121315` card. The real workflow editors repeat filled ticket/file chips and Build/Verify/Review tags. Compact's resting Builder 3/6 chip measures `#232529`; Runs has still brighter status and budget pills. Hundreds of tiny neutral boxes can make a screen read grey without any single large card doing so.

**Change:** For Carbon in `tokens.css`, start with `--list-chip-fill: transparent`, `--tag-edge: var(--rule)`, `--chip-firm: var(--tone-2)` and `--chip-firm-edge: var(--rule-strong)`. `Chip.module.css` already draws these inset contours, so no new component or variant is needed. Preserve coloured dots, names and counts. Paper already uses white and an edge; leave its resting chip fill alone. Keep the firmer treatment confined to chips that already request it.

**Mode:** Carbon primarily. This is a better use of an outline than adding a border around every text fragment.

### 4. Define controls by their edge, and make hover change the edge before the fill

**Linear:** Priority and All in the light [T/subissues/linear.png](../q7/twins/subissues/linear.png) are white controls inside a white popover, legible as controls through their thin perimeter and chevron. In [L/more/editors-02-team-settings.png](../../linear-bar/more/editors-02-team-settings.png), the dark Identifier/name fields share the surrounding form's `#17181a` tone; the field perimeter does the separating. Linear does not require a brighter slab for each nested input.

**Ours:** Carbon's New ticket and resting search surfaces reach `#1c1e21` on the sheet. Buttons in an expanded row compound the wash to `#282b2f`. `Form.module.css` sends `.box:hover` and `.search:hover` directly to `--fill-3`, so Paper's white fields also turn grey under the pointer. The theme system's resting Paper fix is only half a fix.

**Change:** For Carbon, map `--ctl`, `--input` and `--field` to `var(--tone-1)`, approximately `#111214`; map `--ctl-rest-edge` to the existing `--rule-strong`. For property pickers, start `--chip-rest` at the same near-black step and retain `--select-edge`. In `Button.module.css` and `Form.module.css`, make hover strengthen the existing border/inset contour, with at most a `--tone-2` interior. Paper stays white on hover with the stronger edge. Preserve primary fills, disabled treatments, caret and focus outlines. Do not globally reduce `--fill-*`: rules and interaction states use them too.

**Mode:** Both; the resting-state change is Carbon only. Retain the current sizes and hit areas.

### 5. Separate a card's footer with a rule, not another filled panel

**Linear:** The agent-result card in [L/more/ticket-03-activity-feed.png](../../linear-bar/more/ticket-03-activity-feed.png) uses a horizontal rule between its actor/header and the Changed 5 files row. The upper interior `(1200,780)–(2200,810)` measures `#101112`; the lower region remains predominantly `#101112`. One perimeter encloses one object.

**Ours:** The ticket's stage card is white/`#121315`, but its Now footer becomes `#f8f9fa`/`#1a1b1e`. That darker-on-light/brighter-on-dark rectangle reintroduces a slab inside the card. It appears in all three ticket shots, the ticket-menu and owner-picker shots, and the peek.

**Change:** In `Stepper.module.css`, replace `.now { background: var(--fill-1) }` with the card's `--tk-card` and one top inset hairline in `--card-edge`. Use an inset line to avoid shifting the footer's geometry. Keep the orange status glyph, meter and text hierarchy; those already carry the live state. Do not increase the card fill or add an exterior shadow to compensate.

**Mode:** Both.

### 6. Make popovers readable by their perimeter; remove their cast shadow

**Linear:** [L/more/controls-02-context-menu.png](../../linear-bar/more/controls-02-context-menu.png) has an explicit `#383b41` perimeter, a `#1b1c1f` interior, and a single highlighted row at `#2c3039`. Its shape is understandable from the line and row treatment. There is also darkening outside it. Likewise, [T/subissues/linear.png](../q7/twins/subissues/linear.png) uses a white popover over `#fcfcfc`, with a perimeter, section rules **and a real soft shadow**. Borrow the structural cues; discard the shadow to satisfy this brief.

**Ours:** The Paper ticket menu and theme menu cast obvious blurred clouds. Carbon's owner picker combines `#1f2124` interior, `#27292d` search strip, `#2b2e32` active row and a deep shadow. Its search strip is a second grey panel before any option is selected.

**Change:** Set `--pop-shadow: none` in both theme blocks of `tokens.css`. Keep `--pop-edge` explicit: the current Paper edge is about `#e1e4eb` on white; Carbon can start near the reference's `#383b41` using the existing hair mix, with `--pop` reduced from 8% wash to roughly 5–6% (`#191b1e` to `#1b1d20`). In `Popover.module.css`, make `.find` share `--pop` and use a single bottom hairline instead of `--fill-1`. Keep one highlighted option, its checkmark and its small tonal step. In the owner picker over the stage card, the perimeter must remain continuous and stronger than the card's own line.

**Mode:** Both. `Popover.sheet` also supplies tooltip/toast styling, so their inherited shadow changes too; neither is visibly open in the real screenshots. No claim here that Linear's notification marketing card is evidence of an actual toast.

### 7. Keep own messages distinct with a white/near-black bubble and a hairline

**Linear:** In [T/home/linear.png](../q7/twins/home/linear.png), the two human comments form one outlined conversation object with a dividing line; their author/time lines and spacing distinguish the messages. The chat on its right does use a filled user bubble. That is a chat treatment, not something we need to reproduce for every human ticket message. The light Discussion summary in [L/more/ticket-02-issue-page-light.png](../../linear-bar/more/ticket-02-issue-page-light.png) gives a usable alternative: white interior on a `#fcfcfc` page, with a perimeter.

**Ours:** The You message in Talk is `#f2f3f6` on Paper and `#1c1e21` on Carbon. It is another conspicuous neutral tile beside otherwise unboxed comments. The peek repeats it.

**Change:** Map `--tk-mine` to `var(--tone-2)` in `tokens.css`; add the existing 1px `--card-edge` inset contour to `.mine .bubble` in `Thread.module.css`. Keep the current right alignment, You label, time and padding. Those already make authorship obvious. This borrows Linear's outlined object treatment without copying its timeline or rearranging our conversation.

**Mode:** Both.

### 8. Use monospace and a thin enclosure for code, not a grey code mat

**Linear:** The inline `vehicle_state` in [T/home/linear.png](../q7/twins/home/linear.png) is recognised through monospace and a tight perimeter. Its contour distinguishes a token without requiring a broad neutral panel. The white prompt and template cards inside [L/more/overlays-02-large-modal-over-app.png](../../linear-bar/more/overlays-02-large-modal-over-app.png) also show that an interior can remain white while its outline identifies a separate editable object.

**Ours:** The Checks fence in [S/editors/3-file-editor-light.png](../q7/screens/editors/3-file-editor-light.png), repeated in [S/overlays/3-item-overlay-light.png](../q7/screens/overlays/3-item-overlay-light.png), is a wide `#f7f8f9` slab. Inline paths get little grey strips too. `Form.module.css` gives both `code` and `pre` the shared `--chip-hover` background, despite neither being hovered.

**Change:** In `Form.module.css`, make `.prose :is(code, pre)` use a transparent background and a 1px inset `--sheet-edge` contour. Preserve monospace, current padding and line height. A fence should have one enclosure: clear the nested `pre code` background and contour so it does not acquire a second box. Paper's enclosing editable sheet remains near-white (`#fefefe`) on `#fcfcfd`.

**Mode:** Both; directly evidenced in Paper. Applying an inline-code contour to fences is a proposed extension of the technique, not a claim that the supplied Linear image shows the same fence.

### 9. Put identity colour in a bare glyph, not in its background tile

**Linear:** The red, green and pink glyphs in [L/more/library-02-dashboards-list.png](../../linear-bar/more/library-02-dashboards-list.png) distinguish saved objects directly on the sheet. In [T/project/linear.png](../q7/twins/project/linear.png), the coloured initiative glyph and label dots carry identity while words stay ordinary ink. Their colour reduces the need for surrounding neutral containers.

**Ours:** Our library row leads are explicitly `quiet`, so Workflows/Agents/Skills lose the identity colours already used in the sidebar. Elsewhere, ticket types place a tiny grey square behind the glyph, and Carbon accumulates those squares among its filled chips. Changing icon artwork is unnecessary.

**Change:** In `Icon.module.css`, let `.icon.quiet` use `var(--kind, var(--ink-3))` for the already-mapped library kinds. Existing glyph hues remain workflow indigo, agent teal, skill amber and file blue; do not invent new hues. In `tokens.css`, set `--type-square: transparent`; retain the actual type glyph and neutral priority bars. Keep names at the existing 500 weight and descriptions/counts at 400 with secondary ink. No icon tile, new widget or larger icon is needed.

**Mode:** Both. Do not colour all metadata or all menu glyphs; that would destroy the distinction between identity, state and action.

## 2. Remaining greys and shadows: screen inventory

This inventory groups repeated appearances of the same kit treatment. It covers every supplied real screen, including smaller controls and interaction fills. Near-white editable sheets and near-black stage cards are recorded separately from the stronger slabs; treating every neutral pixel as an error would make either theme impossible.

| Where in our screens | Remaining treatment | Separation to use |
|---|---|---|
| Sidebar in every ordinary Paper screen; visible behind the peek | The large `#eceef5` ground still reads cool grey. Linear Ash is almost the same at `#edeef3`, so matching Ash does not solve this owner requirement. | If the sidebar is included in “no greys”, take `--side` toward near-white `#f5f6fa`, keep active navigation white and add a single inset `--rule` contour to `Frame.main` if the sheet edge becomes unclear. This is a deliberate departure from Ash. Keep the existing geometry. |
| Carbon frame in every ordinary dark screen | Ground `#0a0b0c`, sheet `#0f1012`, selected navigation around `#1d1f22`. The selected row is the grey patch, not the black ground. | Keep the two dark planes; reduce `--side-on` from 7% wash toward 3–4%, approximately `#15171a`. The accent glyph, stronger label and count identify the current view. Linear's bare ground and local selection demonstrate the same hierarchy. |
| `frame/1`, `frame/2`, `frame/3`, `lists/1`, `lists/2`, `lists/3`, `controls/3`, both Intake shots, both All teams shots | Every queue/repo/query band, including Quiet repos and empty Intake queries: `#f5f6f8` / `#17181b`. | Technique 2: heading ink, existing gap, one structural hairline. Remove the repeated rounded neutral bars. |
| `lists/2-compact-open-dark` | The entire expanded NW-17 row, plus brighter nested Cancel/Peek/Open ticket buttons. | Techniques 1 and 4. The expansion needs its own contour, not more fill behind every child. |
| `ticket/2-ticket-runs-dark` | Expanded run #42 is `#1c1e21`; budget and stage-state pills are brighter again. Closed run #39 also retains its budget pill. | Techniques 1 and 3. Use the run title, stage glyphs and one outline; keep collapsed rows on the sheet. |
| All three ticket shots, `controls/1-ticket-menu-light`, `controls/2-owner-picker-dark`, `overlays/1-peek-light` | The run card's Now footer is `#f8f9fa` / `#1a1b1e` inside a white / `#121315` card. | Technique 5. Linear's result card uses one fill and an internal rule. |
| The same ticket/control/peek screens | Own-message bubble `#f2f3f6` / `#1c1e21`. | Technique 7: keep the bubble shape and authorship cues; use white/near-black with a hairline. |
| Header search and default action buttons across frame, lists, intake, teams, ticket and library; library search in `editors/2` and `overlays/2` | Carbon's resting `#1c1e21` controls; stronger hover/stacked fills. Paper is white at rest but still greys on hover. | Technique 4: a low tonal step and a defined contour. Primary indigo actions retain their fill. |
| `editors/1-agent-editor-light`; owner trigger in ticket/control screens | Runtime/model/effort and owner picker triggers. Paper is already white outlined; Carbon is filled and brightens further while open. | Keep Paper's contour. Bring Carbon to the same edge-based distinction through `--chip-rest` and `--select-edge`, with a small open-state step. |
| `lists/2`, `lists/3`, `controls/3`, `ticket/2`, `ticket/3`, `editors/2`, `overlays/2` | Now/state/phase/version/default/drift tags, context attachment chips and removable ticket/file chips. Carbon uses `--fill-2` or `--fill-3`; these compound over the open row. | Technique 3. Outline an object once, leave its interior on its parent, keep the coloured glyph/dot. Paper's outlined equivalents should stay white. |
| Keycaps beside search and in Compact/library footers | Carbon gives even keyboard hints another filled tile. Paper already uses white on a fine line. | In `Badge.module.css`, use the same transparent interior and `--tag-edge` contour as the outlined tags. Keep monospace and 11px weight 600. Do not lighten `--field` globally just to fix a keycap. |
| `editors/2-workflow-editor-dark`, `overlays/2-workflow-overlay-dark` | The rounds NumberField is a grey rectangle; small phase/context tags repeat above it. Stage cards themselves are only `#121315`. | Use technique 4 for NumberField and 3 for tags. Keep stage hairlines, dashed disabled edges, loop bracket and axis. The card tone is already small enough; it needs no new fill or shadow. |
| `editors/3-file-editor-light`, `overlays/3-item-overlay-light` | Broad `#f7f8f9` code fence and tiny inline path strips. Enclosing document blocks are `#fefefe`, not grey slabs. | Technique 8 for code. Keep the enclosing sheet's thin boundary; do not add a shadow to separate its near-white interior. |
| `frame/3-theme-menu-light` | White popover with a grey search strip, highlighted grey option and a wide blurred shadow. Its swatch contours are zero-blur lines, not shadows. | Technique 6. White menu, visible perimeter, same-white search with a rule; a small highlighted-row fill remains an interaction cue. |
| `controls/1-ticket-menu-light` | White Copy link/Copy key menu relies visibly on its shadow over Talk. | Technique 6: remove `--pop-shadow`; retain a continuous perimeter against the page and the text it overlaps. |
| `controls/2-owner-picker-dark` | `#1f2124` popover, `#27292d` filter strip, `#2b2e32` highlighted Ada row, deep cast shadow. | Technique 6. One near-black panel, one perimeter, one active-row step and the existing checkmark. Linear's dark context menu has the same structural cues, even though its palette also contains grey. |
| `overlays/1-peek-light`, `overlays/3-item-overlay-light` | The dimmed Paper ground becomes roughly `#b0b2b9`; the dimmed sheet behind the peek is `#bcbcbf`. This is a broad grey veil, not a card or drop shadow. | `Dialog` already separates the lit sheet through masking. If the veil itself violates the goal, reduce Paper `--tk-scrim` from 28% toward 12–16% and give the dialog a 1px `--pop-edge` inset perimeter. Linear's light modal also greys the entire app (`#bebebf` sampled behind it); copying it would retain this issue. |
| `overlays/2-workflow-overlay-dark` | Dark scrim and black rim around a `#0f1012` full editor. No visible drop shadow. | Keep the current dark masking and sheet boundary. Do not import Linear's glowing/shadowed marketing window frame. Interior controls and chips still need the fixes above. |
| `overlays/3-item-overlay-light` | Agents write off-switch track is `#ceced0`, a small solid grey lozenge. | Keep the existing switch and white knob, but use a near-white track with the existing `--rule-strong` contour in `Form.module.css`; keep on-state indigo. Linear also uses a grey off track (`T/display/linear.png`), so this is another intentional departure. Check that off remains recognisable through the left-positioned knob and enclosure. |
| Both Intake shots | The +5 disc is a neutral fill. The failed-query answer is a broad red-tinted panel, not neutral grey, but it still uses area to separate a group. | Make the count disc transparent with a hairline in `Notice.module.css`. For strict minimal fills, remove `.problem[data-align="item"]`'s background and use the component's existing blocked-edge treatment; retain red glyph and error text. Linear's glyph-led rows show the separation technique, not an identical Jira error widget. |
| Ticket type markers and generic icon tiles, wherever shown | Tiny neutral squares behind type glyphs; muted library kind glyphs lose their existing identity hues. | Technique 9. Bare glyphs, the established kind colours, neutral priority bars. |
| Hover/pressed states in `Row`, `Head`, `Button`, `Select`, `Segmented`, `Frame`, `Menu`; active Everything filter in Compact | `--fill-1/2/3` still produces neutral hover patches; the active Everything patch is indigo `#1b1e2e`, not grey. | Keep one small interaction cue; use stronger contours for enclosed controls, a very faint row wash for bare rows, and retain indigo for the chosen filter. A hover patch must not become the resting panel paint. Linear distinguishes current selection from ordinary containers too. |

The workflows/agents/skills library tables themselves have no resting row slabs and no cast shadows. Their remaining grey comes from Carbon search/action controls and keycaps, not the table interior. The ticket Talk column is likewise on the sheet with a single vertical divider; adding a panel fill there would be a regression.

The only visible cast-shadow dependency in these real shots is the shared popover on the theme menu, ticket menu and owner picker. `Card`, `Surface`, `Form.sheet`, `Composer`, `Select`, chips and stage marks use zero-blur inset strokes or rings despite the CSS property being called `box-shadow`. Removing every `box-shadow` declaration would delete the boundaries the owner actually needs. `Dialog.side` and `.full` have no cast shadow.

## 3. What not to take from Linear

- **Its grey panels as a blanket prescription.** The dark Display reference, lead-team menus, Resources chips and Ash bands all contain grey. They conflict with the stated goal when copied indiscriminately. Paper's sidebar is the clearest case where getting numerically closer to Ash would accomplish almost nothing.
- **Its shadows and presentation framing.** The large light modal has a shadow; the subissues popover does too. Several dark references sit on white or gradient marketing backdrops with window shadows. Those are neither light-theme screens nor evidence that our panels need elevation. In particular, `linear-bar/light/dash-*` is dark UI, despite the directory name.
- **Very dim secondary text or fades baked into promotional images.** Triage's source names/ages and the lower half of several references are extremely subdued. Our queue relies on timestamps, ownership, skipped stages and waiting reasons for decisions. Keep the existing readable ink scale; solve the excess grey with surface changes, not by making facts disappear.
- **More pills around ordinary properties.** Linear sometimes boxes almost every property in a draft or chat. Our ticket's Code and Workflow facts already read as labelled values. Adding pill boundaries there would multiply noise. Borrow the outlined label technique only for things already represented as tags or controls.
- **The project board, issue-page layout, large document spacing or agent-chat widgets.** Our All teams screen is a cross-repo table, our queue puts approvals in rows, and our workflow has executable stages, gates and loops. There is no matching Linear workflow editor. Keep those structures and their semantic rails; take local paint and typography techniques only. Do not replace them with a Linear layout to improve a screenshot resemblance score.
- **Treating the twins as pixel-aligned proofs.** They contain visible differences in scale, spacing, glyphs and wrapping. They are useful for comparing a card fill, tag edge or text hierarchy in context; they do not isolate every variable well enough to infer that one global token change will reproduce Linear.

## 4. Which reads better now

**Paper:** Linear's light issue page reads better as a coherent document: white objects on off-white, fewer competing filled strips, and clear local contours. Our Paper editors are close on surfaces, but the repeated queue bands, self-message bubble, code mats and heavy menu shadows still make the kit's different content types feel less consistent.

**Carbon:** Linear's board and dashboard read better under this brief because perimeter, heading ink and tiny tonal differences establish their objects without large middle-grey patches. Our workflow stage cards are closer to that method than our Compact expansion or Runs view; copying Linear's greyer settings panels or its low-contrast promotional text would move those screens in the wrong direction.

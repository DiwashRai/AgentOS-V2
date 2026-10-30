# Kit budget review

**Verdict: consolidate before another raise. Keep the ceiling at 40 components, 8 props and 7,628 measured lines.** The component count is not the main waste. The kit carries obsolete presentations, repeats its picker and pill implementations, and conceals screen layouts behind generic component names and descendant selectors. Raising the ceiling now would pay for those problems to spread.

## Scope and numbers

Read `AGENTS.md`, the four required design documents, the ledger, kit implementations and CSS, screen compositions, and the measurement tool. Ran the requested `node web/tools/kit.mjs --card --base ed1775b`. This is a source review of the fixture UI; no implementation changes, screenshot updates or test runs were made.

At the initial clean checkout of `web-restyle`, HEAD `73503931cd39febf484aab30b2a6abad3b2404fc`, the card reported:

| Measure | Starting checkpoint at `ed1775b` | Initial reviewed checkout | Change |
|---|---:|---:|---:|
| Components / component budget | 25 | 40 / 40 | +15, or 60% |
| Line budget | 4,068 | 7,628 | +3,560, or 87.5% |
| Measured kit lines | — | 7,628 | No headroom |
| Measured TS / CSS / token lines | — | 3,008 / 4,073 / 547 | CSS is 53.4% of the total |
| Per-component prop ceiling | 8 | 8 | Eight components already have eight props |

All 25 original components remain. The 15 additions are `Card`, `Chip`, `Compare`, `Drag`, `Drop`, `Field`, `FormRow`, `Lane`, `NumberField`, `Override`, `Sortable`, `Strip`, `Swap`, `TextArea` and `Toggle`. This is additive growth with no component retirement.

The working tree changed externally during the review: `Form.module.css`, `Icon.tsx`, `TextArea.tsx`, `ledger.json` and `tokens.css` acquired a text-area pop-out. A later card and `--check --base ed1775b` measured **7,695 lines: 3,048 TS, 4,099 CSS and 548 token lines**. The check failed on the existing 7,628-line limit, by 67 lines. The report distinguishes this later observation from the initial clean snapshot; those edits were not made by this review. The consolidation findings apply to both.

### Read the reuse card as a hint, not a census

The tool scans JSX names and direct imports of `features/shared`; it does not follow the complete component graph or resolve every JSX name to its import. Consequently:

- `Menu` has zero reported screens but is live inside `Frame`.
- `Facts` has one reported screen but is also rendered in Peek through ticket `Properties`.
- `Sortable` is reported only for Library, but `Lane` uses it in the workflow editor, including the ticket overlay.
- `Override` is reported only for Workflow, but the ticket tab uses the shared `StageSummary`.
- `Head` is reported for four folders. Peek and Teams declare local components named `Head`; those are not the kit's `Head`. Its actual direct feature consumers are Compact and Queue.
- The 55 low-use variants include defaults and internal uses. `Avatar.lg` is live in `Frame`'s account popover; count badges and YOU are live inside kit components.

A `single` explanation that promises a future screen is not evidence of present reuse. Conversely, a real interaction primitive does not need two unrelated screens to justify itself. The kit sheet demonstrates an API; it does not independently justify retaining that API.

## Findings that should block another raise

### 1. Must-fix: `Row` is carrying screen code under a generic name

`Row` costs **116 measured TS lines plus 359 CSS lines**. The expensive part is not its table alignment or expansion behavior. It is the implicit contract with the markup in Queue and Teams.

- [Row.module.css:145](../web/src/kit/Row.module.css#L145) assumes the penultimate tile child is the chip strip.
- [Row.module.css:149](../web/src/kit/Row.module.css#L149) absolutely positions a role-bearing child of the last child as the bottom meter.
- [Row.module.css:164](../web/src/kit/Row.module.css#L164) reaches through the first line to restyle a quiet `Badge`, its agent icon and its owner's avatar.
- [Row.module.css:200](../web/src/kit/Row.module.css#L200) manufactures stage dots from a descendant's `data-tone="fill"`. A tone value has become a hidden indication of which piece of Queue data it holds.
- [Row.module.css:349](../web/src/kit/Row.module.css#L349) overwrites avatars inside Teams with a separate size and color recipe.
- [Row.module.css:372](../web/src/kit/Row.module.css#L372) turns a nested `rack` row into a Teams card and styles its last two children by position. The same `rack` elsewhere is a compact run-stage line.

Changing a feature's child order can silently change another component's appearance. This satisfies the location rule that CSS lives in the kit while defeating its purpose that screens share a vocabulary.

**Required direction:** keep `Row` responsible for list cells, row activation, expansion and alerts. Move tile and board-card presentation into the existing `Card` family, with explicit presentation and content slots. A board band may remain a row layout, but it must stop skinning its descendants. Share card surface and activation implementation where the behavior is actually the same; a workflow disclosure and a ticket-opening card still need distinct typed interaction cases. This is a redistribution between existing components, not permission to create three screen-specific card exports.

### 2. Must-fix: there are too many implementations of the same pill

`Badge` is **272 TS-plus-CSS lines**, `Chip` another **114**, and `Mark` contains a further pill renderer. These are not three independent visual systems:

- `Badge.tag`, `Badge.prop`, `Chip.chip` and `Mark.chip` repeat the pill radius, list-chip height, hairline inset shadow, muted ink, small typography and gap.
- `Badge.prop` adds a dot or icon; `Chip` adds an icon and optional remove button; `Mark.chip` adds formatted state words and a quieter count.
- Queue and Teams then override some of these pills from `Row.module.css`.

**Required direction:** `Badge` should retain compact text forms such as keys, counts, keycaps and YOU. Make the existing `Chip` own the actual label-pill family: plain, icon/dot, trailing content and removable. Move `Badge.tag`/`prop` use sites and `Mark`'s neutral chip presentation there. Share the shell and truncation rules, then delete the superseded styles. Keep state-to-caption decisions in the feature/domain composition.

This need not cost another component or a ninth prop. An illustrative eight-prop `Chip` surface is `label`, `icon`, `dot`, `tone`, `title`, `after`, `onRemove`, `flash`; `after` covers a progress count or Queue's agent/owner suffix. Type icon and dot alternatives deliberately. Do not append all `Chip` props to today's already-eight-prop `Badge` and call the resulting union consolidation.

### 3. Should-fix: `Menu` and `Select` duplicate one control

[Menu.tsx:36](../web/src/kit/Menu.tsx#L36) and [Select.tsx:43](../web/src/kit/Select.tsx#L43) both implement a single selected item using the same Base UI combobox, current-item lookup, identity comparison, filter input, empty message, list, indicator, portal layer and spacing. Their primary differences are trigger presentation, opening side and item decoration. Menu is not an action menu at all.

They cost **160 and 151 TS-plus-own-CSS lines**, respectively, before the shared popover CSS. `Segmented.More` implements much of the same popup a third time.

**Required direction:** merge `Menu` into `Select`. Add a sidebar trigger presentation to `Select.look`, derive the above-trigger placement from that presentation, and support the existing item detail/leading artwork in its option shape. `label="Theme"` can supply the visible sidebar label; retaining both `label` and `text` for this case is unnecessary. Share the popup implementation with Segmented's overflow while retaining Segmented's distinct inline interaction. Delete `Menu`'s public export and duplicated combobox code. **Net: one component recovered.**

Also use `Avatar`'s dashed empty-face treatment instead of maintaining Select's separate `.nobody` circle.

### 4. Should-fix: obsolete variants consume a material part of the line budget

These are verified against production feature and kit uses, not inferred merely from the card's zeroes:

| API to retire or replace | Evidence / replacement |
|---|---|
| `Stepper.look="glyph"` | Only the sheet exercises the glyph now. Compact, Peek and Ticket all request `steps`; list rows use `Badge.prop` and `Mark`. Remove the glyph renderer, its width calculator and glyph CSS, then remove `look` when only `steps` remains. |
| `Meter.size="strip"` and `names` | No production consumer. Queue uses the default tile track; ticket `Now` uses `row`. Delete the labelled-strip branch and its CSS. |
| `Row.edge` | The ledger itself says this is for the sheet. Production rows show status through glyphs. Delete the prop and edge selectors. `done` and `quiet` edges even resolve to transparent. |
| `Button.variant="lit"` | Retained for the sheet after Intake moved to `Swap`. Delete it and its row-dependent hover styling. |
| `Button.size="lg"` | No production or internal caller found. Remove until a real use needs it. |
| `Badge.kind="status"` | No production or internal caller found. Intake renders the Jira status as quiet metadata. Delete the ring-pill branch instead of maintaining a hypothetical future use. |
| `Badge.size="lg"` and `Badge.href` | Sheet-only now. Intake already puts the key in a link button. Retire the large kicker and second link implementation. |
| `Age.strong` | Its ledger reason is explicitly the sheet. Production ages use surrounding text roles. Delete it. |
| `Head.level="rack"` | No real kit caller; replace this unused presentation with the plain heading Intake actually needs. |
| `Stack.cols={5}` | No production caller. Replace this obsolete grid value with the two-column form layout currently worked around with nested flex stacks. |
| `Avatar.size="mid"` | Currently unused while Teams overrides `md` from `Row` CSS. Either use the existing team-sized variant explicitly and delete those overrides, or remove it. Do not retain both a named team size and an implicit third-party override. |

The first two removals alone eliminate substantial renderer branches, not just enum members. They are a better source of headroom than suppressing useful new controls. Do not remove `Avatar.lg`, `Badge.count`, `Badge.you`, Dialog's default side presentation, or preview props for drag states: those have real internal use or represent real interaction states that stills need to exercise.

### 5. Should-fix: `Page` makes layout decisions by inspecting content

[FormRow.tsx:20](../web/src/kit/FormRow.tsx#L20) writes `data-setting`; [Page.module.css:189](../web/src/kit/Page.module.css#L189) detects it anywhere in the sidebar, changes sidebar width, and later removes the main column's reading measure. A reusable form row is secretly a page-layout switch.

The workflow Library panel also uses `Page.side`, so a future FormRow anywhere inside that panel could change the whole editor's proportions. This is not a theoretical abstraction complaint: the current three sidebar uses are Talk, item properties and the workflow palette, and they have different sizing needs.

**Required direction:** give the existing `side` prop a typed presentation such as `{ look: "rail" | "panel", content }`; keep the prop count unchanged. Delete the `:has([data-setting])` contract. Keep page framing, sidebar layout and form styling separate in the implementation. Do not add another screen-named Page variant.

## Per-component disposition

The decisions below cover all 40 public components. A split into responsibilities can reuse an existing component; it does not automatically imply another export.

| Component | Decision | Concrete disposition |
|---|---|---|
| `Age` | **Keep; trim** | Unit styling is distinct from ordinary tabular text. Remove sheet-only `strong`; do not make it another date-formatting service. |
| `Avatar` | **Keep; consolidate variants** | Single face, empty slot and face group share a real identity treatment. Keep internally used `lg`. Set Teams' size explicitly and remove Row's face overrides; do not split off an AvatarGroup just to inflate the count. |
| `Badge` | **Split with existing `Chip`** | Retain key/count/keycap/YOU text forms. Move label pills to Chip. Delete unused status, large-key and linked-key branches. Counts/keycaps are not reasons to preserve duplicated pill CSS. |
| `Button` | **Keep; trim** | Centralize action/link rendering and blocked-action descriptions. Remove `lit` and unused `lg`. Type link versus click action cases so supplying both cannot silently discard `onClick`. |
| `Card` | **Keep; absorb Row's card presentations** | A stage disclosure merits a card primitive, but its base surface and hit behavior should not be implemented independently from ticket cards. Add explicit presentation cases, not Queue/Teams descendant recipes. Keep stage summaries and fields in `features/workflow`. |
| `Checklist` | **Keep** | Shared by three real presentations; section heads, completed items and overflow are coherent list behavior. Rename `page`/`peek` to density roles when touching it; these are spacing differences, not screen identities. Do not replace it with a stack of decorated Text. |
| `Chip` | **Keep; merge pill implementations into it** | Own label pills, icon/dot treatment, trailing content, remove and arrival feedback. Absorb Badge's tag/prop and Mark's neutral pill rendering. Arrival scrolling belongs in the shared primitive; remount bookkeeping should not spread to unrelated screens. |
| `Compare` | **Keep** | A synchronized two-column text comparison cannot be honestly expressed with today's independent Stacks or Tables. It receives prepared paired lines; merge decisions remain outside the kit. Its one shared editor serves multiple item kinds and ticket copies. |
| `Dialog` | **Keep; tighten types** | Native modal behavior and side/full framings are one responsibility. Model `foot` as side-only and `ask` as full-only instead of accepting ignored combinations. Keep version/save decisions in features. Do not merge it with Surface. |
| `Drag` | **Keep** | Palette source behavior and keyboard/click alternatives are distinct from a drop target and a reorder list. One workflow editor is enough justification. Its card styling should share surface tokens rather than another independent card design. |
| `Drop` | **Keep** | Nested target arbitration and accepted payloads justify a primitive. Combining source and target into a mode-heavy component would save a name while worsening the API. |
| `Facts` | **Keep** | Read-only definition-list semantics and wrapping property chips differ from editable FormRow controls. It is actually used by Ticket and Peek. Do not merge merely because the reuse card says one. |
| `Field` | **Keep; extend for observed search use** | A single-line input is necessary. Supply a real search presentation for LibraryPanel instead of using a text input that bypasses the app's search affordance. Reuse shared field chrome with Select/TextArea; do not merge all input kinds into one component. |
| `FormRow` | **Keep; repair associations** | Own label, help and error layout plus their programmatic relationships to controls. Stop emitting the Page layout switch. Its current label has to be repeated by every child, and its problem text is not linked to that child. |
| `Frame` | **Keep** | One composition root is legitimate even with one consumer. Move its theme choice to the consolidated Select; do not promote its account popover or theme swatches into more public components. |
| `Head` | **Keep; replace an unused variant** | It currently misses Intake's actual heading. Replace unused `rack` with a plain list-heading presentation, preserving fold state and an interactive summary slot. Keep board column headers with the board's column model, rather than forcing them through this group-heading API. |
| `Icon` | **Keep** | One named glyph registry is preferable to per-screen SVG. Canonicalize duplicated geometry where practical (`workflow`/`workflows`, directional chevrons); do not create an export for each icon or add broad arbitrary sizing. |
| `Lane` | **Keep; narrow its decisions** | Vertical sequence, joints, loop bands and sortable layout are different from both Strip and Stepper. Sharing the editor and ticket view is real reuse. Gate eligibility and its reason should arrive in the presentation model; the kit should not own the workflow rule forbidding a gate inside a loop. |
| `Mark` | **Keep; shed pill rendering** | Own status glyphs and named status presentation. Move the neutral pill shell to Chip. Replace competing `glyph`/`chip` booleans with one presentation choice; type progress for the running case. Make still versus animated glyphs explicit instead of suppressing halos through enclosing Row CSS. |
| `Menu` | **Merge into `Select`; remove export** | It is a single-choice combobox with sidebar styling. Preserve its swatches and detail text as option content and its sidebar trigger as a Select presentation. A future action menu would be a different behavior and is not evidence for this duplicate. |
| `Meter` | **Keep; trim** | Numeric run-step progress differs from workflow-stage execution. Keep tile and inline treatments; remove labelled `strip` and `names`. Do not merge into Stepper and confuse steps of an agent's plan with stages of its workflow. |
| `Notice` | **Keep; simplify** | Loading, empty, failure and capped-list treatments need shared alignment. Replace `kind="status" error` with an explicit error case so severity is not a second independent switch. Keep optional remediation text. Do not treat every empty screen's words as another component. |
| `NumberField` | **Keep** | Range, draft typing, step controls and units are meaningful behavior. Its timeout/round/repair uses justify it despite all living in Workflow. Making these string Fields would move validation and interaction into screens. |
| `Override` | **Keep; remove stage-specific wording** | A 37-line before/after value treatment with strikethrough is not the budget problem. Both editor and ticket summary use it indirectly. Give it neutral replacement wording rather than hardcoding “this stage” and “the agent” into a supposedly reusable value comparison. Do not add a generic styling escape hatch to Text just to delete this small export. |
| `Page` | **Keep; split layout responsibility explicitly** | Keep the shell, bar and page title behavior. Make the existing sidebar shape declare rail/panel sizing and remove FormRow detection. Share actual field/search chrome instead of retaining a private third input design. |
| `Row` | **Split with existing `Card`** | Keep grid cells, activation, expansion and alerts. Transfer tiles and board-card skins to Card, retain only band layout, and delete dead `edge`. Remove child-position, Badge-tone and Avatar-role interpretation. |
| `Segmented` | **Keep; share picker internals** | Inline filters with overflow differ from tabs and a select trigger. Reuse the consolidated choice popup. `fit` should bypass measurement/ruler work as well as hiding overflow; a two-option form field currently still installs the observer and measurement machinery. |
| `Select` | **Keep; absorb `Menu`** | Share identity/filter/list/portal code and add the sidebar presentation. Reuse Avatar's empty face and the form field shell. Item faces, artwork and detail belong in typed option content, not another component per option style. |
| `Sortable` | **Keep; own its gutter** | The existing general reorder primitive is already shared through Lane. Reserve handle space itself and expose reorder affordances consistently so screens stop adding an empty Stack and separate move buttons. Do not merge it into Lane and strand AGENTS.md blocks. |
| `Stack` | **Keep; replace unused grid value** | It is the permitted layout vocabulary. Replace unused five-column support with a useful two-column form treatment and make that treatment responsive. Empty Stack spacers should not be the way to request padding or gutter ownership. |
| `Stepper` | **Keep; remove glyph mode** | Execution stages and gates remain a distinct visualization. All production callers want labelled steps. Delete the abandoned miniature renderer rather than retaining it alongside Strip and the newer row chips. Keep Compact's density and caller-provided `now` content. |
| `Strip` | **Keep** | A workflow definition shows phases, disabled stages and loops; a Stepper shows execution status and gate state. Those are different information models. Forcing both into one public component would create invalid prop combinations and needlessly entangle models. Share small track/gate styling where it truly matches. |
| `Surface` | **Keep** | Background elevation, padding and fill are separate from interactive Card behavior. It is only 42 measured TS-plus-CSS lines. Do not merge it into Stack merely to reduce a count. |
| `Swap` | **Keep** | Intake uses it twice: age/action and group-summary/Jira-link. It handles stable sizing, focus and non-hover pointers in 45 lines. Adding this behavior to the already-full Row API would be a worse trade. Keep its dependency on an enclosing actionable row documented. |
| `Table` | **Keep; tighten column modes** | Shared column sizing across list groups is necessary. Make fixed, fill and hugging column configurations explicit rather than accepting contradictory combinations of `width`, `hug`, `min` and `give`. Keep row presentation out of the column model. |
| `Tabs` | **Keep** | Tablist/panel semantics and roving focus differ from pressed filter buttons. Shared visual tokens do not justify merging it with Segmented. |
| `Text` | **Keep** | Typography, semantic element, tone and truncation are real independent decisions. Do not absorb keys, avatars or every two-value decoration. Repeated title-plus-secondary-text compositions can stay shared feature compositions. |
| `TextArea` | **Keep; share field shell** | Multiline editing, growth and fill are real input behavior. The later pop-out addresses long prompt/content editing using existing Dialog/Page/Button; it is not a reason for another exported editor component. Count its extra 67 lines against savings elsewhere. |
| `Thread` | **Split: thread plus `Composer`** | Peek requests `messages={[]}` solely to obtain the reply box. Expose that independently; Thread should render messages. Replace the fake Send span with the actual button primitive and let the composer expose text/submit behavior when wired. The static fixture stage does not justify implementing network sends in the kit. |
| `Toggle` | **Keep** | A switch has its own state and accessibility semantics. Do not fold it into Button's already-full generic prop surface. Share field associations and prevent its surrounding form from depending on its DOM shape. |

## What screens are working around

### 1. A plain collapsible list-group heading

[IntakeView.tsx:155](../web/src/features/intake/IntakeView.tsx#L155) builds `GroupLabel` out of a clickable Row, its own chevron, prefix, name, count and summary. The existing Head already exposes most of these concepts, but only its banded/rack appearances fit. Intake therefore loses the explicit `aria-expanded` behavior Head supplies: Row only sets expanded state when it has a `more` expansion, and this group hides sibling rows instead.

**Fix:** replace unused `Head.level="rack"` with a plain presentation that aligns to Table columns, accepts the existing summary slot and keeps fold semantics. The query/JQL formatting remains Intake code. No `IntakeHeader` component is warranted.

### 2. A reorder list that owns the full interaction footprint

[library/content.tsx:122](../web/src/features/library/content.tsx#L122) explicitly says the empty first Stack and its gap leave the handles a gutter. Lane reserves its own handle gutter separately. `BlockHead` also creates Move up and Move down buttons while Sortable's handle implements arrow-key moves itself.

**Fix:** Sortable must reserve its own inset and supply a coherent pointer/keyboard reorder treatment. Screens provide ordered items and domain mutations. A general layout primitive should not need a sacrificial sibling to stop clipping its handles. Keep AGENTS.md naming, folding and content in the library feature.

### 3. A usable two-column form layout

[StageFields.tsx:39](../web/src/features/workflow/StageFields.tsx#L39) defines `Pair` and `Half` using row Stacks with growing children. The one grid primitive only offers three or five equal columns. The missing case is the form's actual two-column arrangement, including a narrow-window fallback.

**Fix:** put two-column responsive form layout into the existing Stack vocabulary, replacing unused five-column support. Keep `Pair`/`Half` local if they help name the composition; their existence is not a reason to put StageFields into the kit.

### 4. An independent reply composer

[Peek.tsx](../web/src/features/peek/Peek.tsx) pins `<Thread messages={[]} compose=...>` in Dialog's footer, while Ticket gets its reply box by appending one to a real Thread. This is an API workaround, not evidence that an empty conversation should own input behavior. The current Send is a span, so it does not even exercise the kit's common button states.

**Fix:** extract `Composer` from Thread, with real input/button semantics and a controlled text/submit contract. Placement and ticket identity stay in the screen. Spend the component recovered by the Menu merge here.

### 5. Field labels, help and errors that form one contract

`FormRow label="Prompt"` and `TextArea label="Prompt"` repeat the same label; the problem is separately printed under the control. There is no shared ID/description association between them. StageFields additionally identifies prompt errors with `problem?.startsWith("The prompt")`, so structured validation has already collapsed into prose before the control sees it.

**Fix:** give FormRow/controls a common label, help and error association mechanism. Pass field-targeted issues from the feature model, rather than classify them by sentence prefix. This is an extension of the existing form family, not another wrapper for every field. A multi-control group such as Overrides still needs each control's individual name.

### 6. Search outside a Page header

[LibraryPanel.tsx:135](../web/src/features/workflow/LibraryPanel.tsx#L135) uses Field as a search box. Page's search is private, carries the search input type, glyph, shortcut and Escape behavior, and Frame locates it with `main input[type="search"]`. The palette's text Field does not participate in that mechanism.

**Fix:** make search a reusable presentation of Field or a shared internal field implementation that Page also uses, with a clear focus target for the active screen. Do not hardcode workflow search into Frame or export a new search component just to preserve two input implementations.

### 7. Explicit card slots and sidebar sizing

Queue's `AgentCard` is a four-line composition whose meaning exists in Row's positional CSS; Teams' `Item` depends on nesting a rack inside a band. ItemEditor obtains its wide editing body by putting FormRows in the side column. These are the strongest missing contracts because routine feature composition can change styling elsewhere.

**Fix:** Card owns named visual parts; Page's sidebar model owns width/measure. The implementation should survive adding another Text or field without a hidden layout switch. These repairs use existing components.

### Do not turn every repeated feature composition into kit inventory

Ticket and Peek repeat plan headings, counts, empty text and conversation data mapping. Compact's TitleCell and Library's NameCell both draw a leading item plus truncating primary/secondary text. SaveAsk already shares its confirmation content across two editors. These can be ordinary shared feature functions/components: they select data or arrange existing primitives and need no new raw elements or CSS. They do not justify `PlanSection`, `TicketHeader`, `DriftBadge`, `HistoryPanel`, `LibraryItem` or `SaveDialog` exports in the kit.

## Budget decision and order of work

**Do not approve 45 or 50. Keep 40. Keep the prop ceiling at 8 and the line ceiling at 7,628.** The later 67-line failure is not evidence that the text-area pop-out is excessive; it is evidence that zero headroom plus retained obsolete renderers is an avoidable constraint.

1. Delete production-unused variants and their renderers/styles; update the kit sheet to demonstrate the surviving API. Start with Stepper glyph, Meter strip, Row edge and Button lit. Do not shorten code or remove comments to manufacture a better number.
2. Merge Menu into Select and unify the choice-popup implementation. **Working inventory: 39.**
3. Redistribute pills between Badge/Chip/Mark and cards between Row/Card, then remove superseded CSS. Keep these changes count-neutral. Preserve required remove, blocked, keyboard and disclosure behavior.
4. Replace implicit Page/Row contracts, fix Sortable's gutter, and extend Head/Stack/Field for the observed composition gaps. Do not rename hidden screen selectors as generic variants without removing the coupling.
5. Extract Composer when repairing that seam. **Working inventory: 40**, using the slot recovered in step 2.

Use **7,300 measured lines or less as a cleanup planning target**, not a claimed result of this read-only review or a proposed gate change. The final figure must come from the card after implementation. Deleting substantial dead presentations and duplicate picker/pill code should create headroom; if it does not, inspect the retained CSS before changing the ceiling. Keep all implemented UI work within the existing line checkpoint, including the pop-out.

For a later increase, require a concrete missing behavior after these changes, a comparison with the existing alternatives, and measured component/prop/line cost. Increase by the number of justified primitives in that change, not an allowance for anticipated settings screens. A genuinely different control is a reason to raise a checkpoint. A second combobox or another child-position-dependent card is not.

# Kit consolidation review (Opus, round 1)

Scope: `7350393..f5c5943` (5 commits). `npm run check`, `node tools/kit.mjs --check` (40/40, 7110 lines) and Vitest are all green. I checked the visuals by running the base (`7350393`, extracted to a scratch dir) and HEAD side by side on ports 5251/5252. I took Playwright screenshots in Chrome of My queue, the peek, Compact, Intake, the ticket, All teams, /kit, the workflow editor and the library editors, then pixel-diffed and zoomed them. I also probed the DOM with `elementFromPoint` and keyboard events. Both servers are stopped.

Counts: **2 must-fix, 9 should-fix, 10 nit.**

---

## must-fix

### M1. The Now chip drops who it waits on: " · Review the change" instead of "Cy · Review the change"
`web/src/features/compact/TicketLine.tsx:58-62`

```ts
const who = m.name ?? "";
return m.ask ? ` · ${m.ask}` : who;
```
`who` is never put in front of the ask. Every "waiting on someone else" row in Compact and My queue now shows a chip that starts with a bare " · ". The screenshots show it on NW-11 and NW-9 in /compact: " · Review the change" and " · Plan sign-off". There is a second break. The old `chipLabel` fell back to `WORD[kind]` when there was no name, but the new code falls back to `""`, which draws an empty pill.
**Fix:** `const who = m.name ?? WORD-equivalent; return m.ask ? `${who} · ${m.ask}` : who;`. Also add a Vitest case on `chipWords` for the wait/run/you kinds. This is a pure function in a feature, and it has just shipped a wording bug that no gate caught.

### M2. A tile Meter is now `position: absolute` everywhere, so outside a Card it pins to the viewport
`web/src/kit/Meter.module.css:47-49` (`.tile { position: absolute; inset: auto 0 0; }`). `size="tile"` is also the default (`Meter.tsx:21`).

This trades the old positional rule for a new hidden contract: the Meter assumes its nearest positioned ancestor is an agent Card. The kit sheet already breaks it. `KitSheet.tsx:519` `<Meter done={2} total={5} />` now renders at `x=0, y=898, width=1440, height=2`: a 2px progress bar across the bottom of the whole window. At base it sat inline in its section. Any future `<Meter>` with no `size` does the same.
**Fix:** make the Card own the placement. `Card` with `look="agent"` takes a `progress?: {done,total}` (or a `foot` slot), draws the Meter itself, and positions it with a kit-internal class. Otherwise only absolutely position the meter under `.card[data-look="agent"]`. Then `.tile` is just the hairline track and needs no positioned ancestor. Also make `row` the default size, or remove the default.

---

## should-fix

### S1. The Card hit button covers its contents: tooltips and text selection are gone on the agent and board cards
`web/src/kit/Card.module.css:46-55` (`.hit { position:absolute; inset:0; z-index:1 }`), `Card.tsx` header comment ("under its words so they stay plain text").

`elementFromPoint` at the centre of the title, the agent pill, the repo chip and the "run #42" line of an agent card returns the `BUTTON "Peek at NW-17: …"` at HEAD. At base it returned the text span or chip. Row's hit was visually hidden, and a click handler sat on the presentation wrapper so the cells kept their tooltips. As a result these are no longer reachable on hover:
- "Builder running, for Ada Park";
- "Run #42, running for 6m";
- every Chip `title`;
- the board card's `title` on a truncated title.

Text can't be selected either. For the stage look this was already true, and the code comment is wrong for every look.
**Fix:** use Row's proven pattern. Give the hit button `z-index: 0`, raise the content (`.main { position: relative; z-index: 1; pointer-events: none }` with `pointer-events: auto` on elements that have a title or are controls). Or move the pointer activation to an `onClick` on the summary wrapper as Row does (`openOnClick`) and keep the button visually hidden. Then fix the comment.

### S2. The agent card lost Linear's agent pill and gained height
`web/src/features/queue/QueueView.tsx:94-110, 221`. Compare the screenshots at `/` (light and dark).

- The agent glyph used to sit on a live-tinted disc with the owner's face tucked over it, each ringed in the card colour. It is now a plain grey robot icon and a separate face. The commit message doesn't mention this, and `AgentChip`'s doc comment (lines 91-93) still says "overlapping the face".
- The repo chip lost its fill, so the stage chip is filled and the repo chip is not. At base both were filled.
- `<Stack grow />` is an extra flex child, so it adds one more `--sp-4` gap even when there is no free space. Every agent card is 8px taller (134 → 142 CSS px), the chips sit further from the title, and the lists below shift down 16px.

**Fix:**
- For the gap, wrap `Top` and `Body` in one `<Stack grow gap={4}>` instead of adding an empty child. That still sinks the chips with no extra gap.
- For the pill, either draw it in the kit (an `agent` tone or form on Chip, which owns the disc, overlap and ring) or state the downgrade in the PR and delete the comment.
- Pass `tone="fill"` to the repo chip if keeping the old look was the intent.

### S3. "Nothing in flight" lost its inset on All teams
`web/src/features/teams/TeamsView.tsx:268-271`. The deleted rule `.band:not(.flat) .cell:not(:first-child) > :only-child:not(.row)` was what padded it. The text now sits flush top-left of the lane (x=402 against the cards' key at x=414, and 17px higher). The screen was not updated to say its own layout.
**Fix:** wrap it in a `Stack` with the card's padding, or render it through `Notice kind="empty"` with the card inset. Don't bring back the positional rule.

### S4. Esc in the library search, meant to clear it, also closes the whole workflow overlay
`web/src/kit/Field.tsx:32-36`. At `/t/NW-17?edit=workflow` I typed into "Search agents" and pressed Esc. The overlay closed, `dialog[open]` went to 0 and the URL dropped `?edit=workflow`. The handler clears the field but doesn't `preventDefault()`, so the `<dialog>`'s `cancel` still fires. The commit and ledger promise "Esc to clear (then leave it)", and that is false inside every overlay.
**Fix:** call `e.preventDefault()` (and `stopPropagation()`) when the Esc clears a non-empty value. When the field is already empty, let it bubble.

### S5. Two search fields: Field's new `search` form duplicates Page's `SearchField`
`web/src/kit/Field.tsx:16-45` vs `web/src/kit/Page.tsx:66-86`. Both draw the search glyph, use `type="search"` and carry identical Esc-clears-then-blurs logic, each with its own CSS (`Form.module.css` `.searchWrap`/`.find` against `Page.module.css` `.search`). This is the kind of duplicate implementation the consolidation set out to remove, added in the same PR. It also carries S4's bug in both places.
**Fix:** have Page's `SearchField` render `<Field search …>` and add its `/` kbd hint and shortcut, or give Field a `shortcut` prop. Then fix S4 once.

### S6. Newly dead code the consolidation should have removed
- **Tokens.** 32 tokens that were used at base are referenced nowhere at HEAD (I scanned every `var(--x)` and string reference under `web/src`):
  `--fs-tile-face --h-tile-chip --h-tile-face --h-tile-pill --pending --progress-soft --row-flat --row-flat-edge --row-hover --row-hover-edge --row-raised --row-raised-edge --shadow-halo --shadow-row --teams-badge --teams-badge-edge --teams-face --teams-face-fill --teams-face-fs --teams-face-ink --teams-title --tile-agent --tile-chip --tile-chip-edge --tile-dot-idle --tile-face-overlap --tile-glyph-drop --tk-chip-edge --tk-send --w-glyph --w-tile-agent-glyph --w-tile-dot`.
  Several are defined once per theme. They count toward the gated budget ("549 tokens"), so "7,110 lines" overstates the real size.
- **`Mark.text`.** Only Mark's chip form passed it, so it is now a dead prop (`Mark.tsx:26-27`, `NamedMark`, `Mark.module.css:38 .text`, ledger `Mark.text` at line 500).
- **`edgeOf` and `Edge`** in `web/src/domain/board.ts:88-104`. They existed only for Row's status edge, which is now deleted. `web/tools/kit.mjs:150` still cites `edgeOf(t)` as its example.

**Fix:** delete all of them and re-run `just card`. The budget number drops.

### S7. Chip and Card types let bad states be written (AGENTS.md: "Bad states can't be written down")
- **Chip** (`Chip.tsx:17-19`): `lead` and `dot` can both be set and both render. `lead` is typed `ReactNode`, but every caller passes `<Icon name=…/>`, and the "still Mark glyph" case in the ledger and comment has no caller. The old `icon: IconName` was tighter. Make it `mark?: { icon: IconName } | { dot: Dot }`, or `lead?: IconName` plus `dot?`, as a union. That also gets Chip below the 8-prop gate ceiling it now sits at.
- **Card** (`Card.tsx:15-31`): `look="agent"` or `"ticket"` accepts `face`, `open` and `problem`, which Card then quietly ignores (`opened = stage && …`). A discriminated union on `look`, with `face`/`open`/`problem` only on `stage`, makes those states unwritable and the ledger honest.
- **Select** (`Select.tsx:38`): `icon` only means something with `look="side"`. Fold it into the look: `look?: "chip" | "field" | { side: IconName }`. This one is a nit on its own, but it is the same pattern.

### S8. New hidden contracts that style feature-supplied children
- `web/src/kit/Chip.module.css:77` `.chip:has(> .after > [role="img"]) { padding-right … }`: the chip's padding now depends on whether the screen put something with `role="img"` (an Avatar, or a labelled Icon) inside `after`. That is the attribute contract the brief asks to get rid of, recreated one level down.
  **Fix:** a typed `after` (for example `after?: { text: string } | { agent?: string; face?: Person }`) that Chip renders itself.
- `web/src/kit/Drag.module.css:72` and `Lane.module.css:12`: Lane switches Sortable's gutter off through an undeclared, inherited custom property, `--sortable-gutter: 0`. It inherits into every descendant of an editing lane, so a Sortable inside an opened stage's settings would also lose its gutter.
  **Fix:** a `gutter?: boolean` prop on Sortable that Lane passes.
- `web/src/kit/Card.module.css:117-119` `.card[data-look="ticket"] .main > * { max-width: 100% }`: this styles every child the screen passes. It is harmless today, but it is the same kind of rule. Prefer `min-width: 0` on the flex column.

### S9. The ledger no longer describes the code
- `ledger.json:149, 155, 161, 164`: Card's `label`, `children`, `onOpen` and `off` still describe only a stage ("Edit Implement, Close Implement", "a click on the summary selects the card", "a disabled stage is dimmed"). They now also mean "Peek at …", opening a peek, and a queued agent that recedes.
- `ledger.json:201`: Chip `dot.done` says "the default". There is no default dot; an unset `dot` draws none.
- `ledger.json:192`: Chip `lead` says "or a still Mark glyph". No caller does this.
- `ledger.json:495`: Mark `name` says "(in a chip, in ink on the state's dot)". Mark has no chip form now.
- `ledger.json:803`: Stack `cols` says "Equal columns (run tiles, the rack)". The rack's columns are gone, and `2` is not equal columns but an auto-fit grid (see N6).
- `ledger.json` Composer `onSend`: it has a reason, but no screen passes it. Either say plainly that it is for W-later, or drop it until a screen wires it.

**Fix:** rewrite each of these to match the code.

---

## nit

- **N1.** `web/src/kit/Card.module.css:1-4`: the file header still describes Card as only "a stage as its own object". `TeamsView.tsx:134-137` still calls the chip "a smaller badge". `tokens.css:63-64, 438` still mention "Mark chip, Badge tag" and "Badge prop".
- **N2.** `web/src/kit/Composer.tsx:24`: the box is now a `<div>` where it was a `<label>`. Clicking its padding, or the area around the text that shows `cursor: text`, no longer focuses the textarea. Make the wrapper a `<label>`, or drop `cursor: text`.
- **N3.** The Now chip's tooltip used to be "Builder · 3/5". It is now just "Builder" (`TicketLine.tsx:73`), so the count is lost from the hover. Pass `title`.
- **N4.** `web/src/kit/Head.module.css:111-115`: `.line .toggle { flex: 1 }` stretches the toggle, so the `note` ("didn't answer") lands at the far right beside the summary instead of after the count, and clicking it doesn't fold. The chevron also moved about 12px further out than the base label's chevron, so the project key and name no longer start where they did. Put the note inside the toggle for the line level, and check the inset against the rows.
- **N5.** TextArea pop-out (`TextArea.tsx`):
  - Focus opens on the `<dialog>`, so the user tabs past the close and Done buttons to reach the text (verified). Focus the popped textarea on open.
  - On the `fill` areas, the hidden pop button sits over the textarea's scrollbar corner.
  - `cx(s.areaWrap, fill && s.fill)` applies a textarea class (`field-sizing`, `resize`) to a div.
- **N6.** `web/src/kit/Stack.module.css:36-38`: `cols={2}` is `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`, which gives three or more columns for three or more children. The name says 2. Call it what it is (`cols="fit"`), or clamp it with `minmax(…, 1fr)` in exactly two tracks and a container query.
- **N7.** The repo glyph in list chips shrank from the icon's own size to `--sp-6` (`Chip.module.css` `.lead svg`). It is visibly smaller than at base in Compact and My queue.
- **N8.** The agent and board cards' glyphs moved from `align="start"` plus the deleted `--tile-glyph-drop` to `align="baseline"`. The empty inline-flex glyph now sits on the text baseline, about 2px high against the title.
- **N9.** In the theme Select the theme names dropped from weight 500 (Menu's `.name`) to regular. The commit doesn't say this was meant.
- **N10.** `web/src/kit/Thread.module.css`: `.thread:empty { display: none }` was removed along with the composer. A ticket with no messages now draws an empty `<ol aria-label="Conversation">`, and the Talk column's gap still applies above the Composer.

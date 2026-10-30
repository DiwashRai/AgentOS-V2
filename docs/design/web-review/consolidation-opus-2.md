# Kit consolidation review (Opus, round 2)

Scope: the round 1 fixes, `209457e` ("kit: the consolidation's review round 1"), checked against `consolidation-opus-1.md`, `consolidation-codex-1.md` and `consolidation-r1-fixes.md`.

How I checked:
- I read the full diff.
- I ran Vite on port 5251 and probed it in Chrome with Playwright. Vite is stopped.
- Screens probed: My queue (agent cards, Tab, Enter, Esc, pointer clicks, `elementFromPoint`), the ticket's workflow overlay (`/`, Esc ×3), the standalone workflow editor (stage click, FormRow names and descriptions, a short prompt, an invalid prompt, pop-out focus and return, Tab through the stages at a 560px viewport), Intake, All teams, Compact, /kit, the four library editors, and the ticket Composer (a click on its padding, Ctrl+Enter, the draft across tickets).
- `node tools/kit.mjs --check` passes: 40/40, 7,234 lines.

## Every round 1 finding I checked holds

- **C1, text area width:** a short prompt is 474px inside a 474px slot, and the fill editors fill their column.
- **C2 / M1, waiting chips:** Compact reads "Bea · Plan sign-off" and "Cy · Review the change". The titles are "Builder · 3/5".
- **C3 / S4, Esc in search:** the first Esc clears, the second blurs, and the overlay stays open with `?edit=workflow` kept. The third Esc closes it.
- **M2, Meter:** the sheet's Meters are `static`, in flow.
- **S1, Card tooltips:** under the pointer on an agent card is the run line's own text, with its `title`. A click opens the peek. Tab, then Enter, opens it too, and Esc gives focus back to the card's button.
- **S2, agent pill and card height:** the disc is back and the cards are 134px again.
- **S3:** "Nothing in flight" has its inset again.
- **S5 / C7, `/`:** `/` reaches "Search agents" in the overlay, and the page search on Intake.
- **C6, FormRow:** groups are named by their visible label. The prompt textarea has `aria-invalid` and is described by both the note and the problem. The pop-out textarea keeps the description and gets focus when it opens.
- **N4:** Intake's chevron sits at x=296, where the rows start.

No must-fix. Counts: **0 must-fix, 2 should-fix, 10 nit.**

---

## should-fix

### S1. With Tab, a stage card is only scrolled into view as far as its top-left pixel
`web/src/kit/Card.module.css:47-56` (`.hit`: absolute, 1px, `clip-path`, no inset), `web/src/kit/Card.tsx:51-62`.

The button that takes focus is now 1px, at the summary's top-left padding corner. The browser scrolls a focused element just far enough to show that element, so it shows the corner and not the card.

I measured this at a 560px viewport on `/library/workflows/standard`. Tabbing to "Edit Review" leaves the card at `top=522`, with **38 of its 112px visible**. The summary the person is about to open is mostly below the fold, and so is most of the focus ring round it. At base the stage's button covered the whole summary (`inset: 0`), so the whole summary came into view.

The agent and ticket cards inherit the same corner. They were Rows at base, so that part is not new, but at 162px they are far taller than a Row.

**Fix:** keep one real button, but give it the summary's box and keep it out of the pointer's way. Use `.hit { position: absolute; inset: 0; opacity: 0; pointer-events: none; }` (no `clip-path`, no 1px), with the content above it unchanged. The delegated click still handles the pointer, tooltips still work because the button takes no pointer events, and focusing the button scrolls the whole summary in. Another way is `onFocus={(e) => e.currentTarget.closest(…)?.scrollIntoView({ block: "nearest" })}`, but the box is simpler. Re-check Tab at a short viewport.

### S2. The draft now belongs to the screen, but isn't tied to the ticket: a reply typed on one ticket shows on the next
`web/src/features/ticket/TicketView.tsx:132` (`const [draft, setDraft] = useState("")` in `Talk`) and `web/src/features/peek/Peek.tsx:133` (`Reply`).

C10 asked for a controlled Composer so that "ticket identity and draft decisions remain in the screen". The screens now hold the draft, but neither one keys it by ticket. The `t/:key` route keeps `TicketView` mounted across tickets, so `Talk` keeps its state.

Reproduced:
1. On `/t/NW-17`, type "second draft for NW-17".
2. Navigate client-side to `/t/NW-19`, which is already cached.
3. The composer still holds "second draft for NW-17".

On the first, uncached visit the loading state happens to remount `Talk` and clear it, which makes the bug look intermittent. When sending is wired, that draft goes to the wrong ticket. `Reply` in the peek is the same: it is keyed by nothing, under `foot={key ? <Reply ticketKey={key} /> : null}`.

**Fix:** key the holders by ticket: `<Talk key={t.key} … />` and `<Reply key={key} ticketKey={key} />`. Alternatively, hold a `Record<ticketKey, string>` if drafts should survive a round trip. A one-line Vitest or Playwright check on "switch ticket, draft is empty" would pin it.

---

## nit

- **N1. The visually hidden card button's `title` is dead.** `web/src/kit/Card.tsx:58`. A 1px clipped button never shows a tooltip, so stage cards lost the "Edit Implement" hover they had at base. Either drop `title`, or, with S1's full-size button, it still won't show because of `pointer-events: none`. So drop it.

- **N2. Composer's `<label>` holds a `<button>`.** `web/src/kit/Composer.tsx:19-36`. HTML's content model for `label` allows no labelable descendant other than its labeled control, and Send is a labelable `button`. It works in Chrome, because a click on interactive content inside a label isn't forwarded, but it is invalid markup that validators and some AT flag. **Fix:** keep the `<div>` and focus the textarea from a `mousedown` on the wrapper's padding. Or keep the `<label>` round the textarea only and put Send beside it in the box.

- **N3. `Chip.after` still admits an empty "who".** `web/src/kit/Chip.tsx:19-20`. `{ agent: null, face: null }` type-checks. It draws an empty `.who` span and sets `data-who`, which cuts the right padding to `--sp-1`, so the words run to the pill's edge. Require at least one: `{ agent: string; face?: Face } | { agent?: never; face: Face }`.

- **N4. The kit sheet no longer shows the inert gate slot.** `web/src/features/sheet/KitSheet.tsx:311-319`. The sheet's editing Lane has a loop (build to check), but it passes no `noGate`. So "Build" (inside the loop) now shows a live "Add a gate after Build" diamond where the sheet used to draw the inert one. `Lane.stages.noGate` is in the ledger, and no sheet example draws it. Pass `noGate: "Gates go after a loop's last stage"` for Build on the sheet.

- **N5. `noGateAfter` re-derives the loop span that `problemsOf` already computes.** `web/src/features/workflow/model.ts:101-108`. It uses its own `findIndex` lookups, alongside `span(b, l.first, l.last)` used at `:159`. Two encodings of the same rule ("a gate only on a loop's last stage") can drift. Build both on `span`, or on one `insideLoop(b, k)`.

- **N6. kit.mjs's merging differs between levels, and intersections admit foreign fields.** `web/tools/kit.mjs:77, 84-86, 125-126`.
  - `fieldsOf` now merges `vocab` across a union's cases (`old.vocab ?? p.vocab`), but `readKit`'s top-level merge (`:126`) keeps only the first case's `vocab`. Chip's `lead` is `IconName` in one case and `never` in the other. It reads as `IconName` today only because of TypeScript's union order. If the order flips, the vocabulary check on `Chip.lead` is silently skipped. Use the same merge in both places.
  - `x.types.some(kitShape)` accepts an intersection of a kit shape with any foreign type (for example `& HTMLAttributes<…>`). That would pull hundreds of DOM fields into the ledger check. `every(kitShape)` is stricter, and it still passes `Column`, whose common part is an anonymous kit-declared literal.
  - Nested `items` from a later case are dropped in the merge.

- **N7. A Segmented in a FormRow isn't described by the row; its overflow trigger is.** The "Role" row's note ("Changes the work; a loop repeats…") is read for the "+N" trigger, because `Choice` reads `useDescribed()`. The pressed-or-not pills in `Pills` (`web/src/kit/Segmented.tsx`) don't read it, so the visible choices (Maker, Check) get no description. Either the group carries it (`aria-describedby` on the track `role="group"`), or the pills read it as the other controls do.

- **N8. "First search input in the layer" is a DOM-order contract, and every search draws a "/" keycap.** `web/src/kit/search.ts:15-19`, `web/src/kit/Field.tsx:71-75`. A layer with two search Fields would show "/" on both, while `/` only ever reaches the first. No screen does this today. Draw the keycap only on the search that `activeSearch()` resolves to, or say the one-search-per-layer rule in Field's ledger reason.

- **N9. The ledger says less than the code.**
  - `ledger.json:360-373`: FormRow's reasons don't mention its new contract: it names its group, its note and problem describe the controls in it, and a problem marks them invalid. Field, TextArea, Toggle, NumberField and Select's trigger depend on that, through `described.ts`.
  - `ledger.json:441`: Head's `note` says "after the count". On the line level it is now inside the fold's button, so it becomes part of the button's name ("Platform backlog didn't answer").
  - `ledger.json:421`: Head's `why` still says "a zone, a group or a rack group". The level is `line` now.
  - `Card.tsx:7-8` and the ledger's `Meter.size.edge` say "the card is its containing block". The positioned ancestor is actually `.summary` (`position: relative`). That only works because the agent summary is `height: 100%`.

- **N10. Smaller leftovers.**
  - `web/src/kit/Select.module.css:129-134`: the new `.sideSheet .text` rule was put between `.sideSheet`'s comment and `.sideSheet` itself, so the comment now heads the wrong rule. `--ring: var(--ring-ink)` in `.sideSheet` has no reader anywhere in `src` (nor at base). It is dead, and its comment ("the swatches' ring uses this theme's ink") describes nothing.
  - `web/src/features/teams/TeamsView.tsx:271`: "Nothing in flight" is now a list Notice. It draws a list row's hairline under the Plan column only, and leads with the dashed ring that the page's legend defines as "Queued", in the same view.
  - The commit message and `consolidation-r1-fixes.md` give the kit as 7,212 lines, but `kit.mjs --check` at `209457e` reports **7,234**.

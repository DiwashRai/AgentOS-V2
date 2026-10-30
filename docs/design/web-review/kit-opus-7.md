# Kit review, round 7 (Opus)

Scope: the whole kit at `9e0670a` (`web/src/kit`, `web/tools/kit.mjs`, `ledger.mjs`, and the screens as they use the kit). It also checks that the round-6 fixes (`9e0670a`, `kit-r6-fixes.md`) hold.

How I checked:
- I read the round-6 diff and every kit TSX file again, plus the CSS the findings touch, the ledger entries they touch, `kit.mjs` and `ledger.mjs`.
- Automated checks:
  - `npm run check` passes.
  - Vitest passes 13 of 13.
  - `node tools/kit.mjs --check` passes at 40/40 components and 7,575 of 7,628 lines.
- Screenshots: all 22 tests pass against the baselines. I used a scratch config pointed at port 5221, with its output in my scratchpad, and updated no snapshots.
- I ran Vite on 5221 and probed it with Playwright in Chrome. I took aria snapshots of 14 routes, and Chrome's own AX tree (CDP) for the Facts lists. The sequences:
  - In the workflow overlay: Done and Esc in a popped-out Prompt, clean and dirty; Esc ×2 on the outer; a held Esc (three keydowns, two of them repeats); Tab inside the question; and the close button.
  - In the item overlay (SKILL.md): pop out, Done, and type then Esc. Then Esc on the dirty outer.
- I took screenshots in Midnight, Harbour, Mist, Plum, Carbon and Paper.
- Vite is stopped and the tree is clean.

## The round-6 fixes

- **M1, nested close: holds.**
  - Workflow overlay, clean or dirty, Done or Esc in the popped Prompt: one dialog is left, nothing is asked, the URL keeps `edit=workflow`, and focus is on "Edit Prompt in the whole window".
  - Item overlay: the same, and the URL keeps `edit=skills/tests/SKILL.md`. The tab title goes back to "NW-17's copy of tests v2".
- **N1, a held Esc: holds.** Three keydowns (two of them repeats) ask once, with focus on Keep editing.
- **S1, the five places: hold.**
  - The stage card reads "Plan Done Maker Planner · opus · high Gate: Plan sign-off".
  - The run detail reads the starter's name once.
  - The Now glyph is "Running".
  - The queue chip's glyph is `img "agent"`.
  - The class itself is still open in six more places (S1 below).
- **N2:** editing, the gate's name is hidden and the toggle says it; read only, it is "Gate: Plan sign-off". Holds.
- **N4:** "2 of 5 steps done", which now agrees with "Step 3 of 5". Holds.
- **N5:** "Close (Esc)". Holds.
- **N6:** Compact's and Intake's folding heads are level-2 headings with the button inside. The h2's `display: contents` lays the button out as before (the screenshots are unchanged). Holds.
- **N7, half:** Chrome's tree has `DescriptionList "Properties"`, `"Code"` and `"Workflow"`. Holds. The other half was left as the design's, which is fair.
- **N3, N9, N10, N11 and Codex 2: hold.** N9: Compact reads `img "High priority"` and `img "Low priority"`. N10: an empty `?peek=` opens nothing.
- **N8:** put to the owner. Not reopened.

Counts: **0 must-fix, 1 should-fix, 7 nit.**

---

## should-fix

### S1. A glyph says its state and the words beside it say it again, in six more places. The cause is the kit's default.

`kit/Mark.tsx:33,77`: a glyph Mark with no `name` is named by its state's word (`WORD[kind]`). So every screen that puts state words beside a glyph doubles them unless it remembers `name={false}`. Rounds 5 and 6 fixed this place by place. The aria snapshots show six more:

| Where | What a reader hears |
|---|---|
| My queue's zone heads, `features/queue/QueueView.tsx:239, 260, 282, 295` | Four headings: `heading "Done Done recently 3"`, "Needs you Your move 3", "Running Agents at work 6", "Inbox Ready to start 1" |
| My queue's agent cards, `QueueView.tsx:117` | The chip says "Builder running" or "Queued", then the glyph before the title says `img "Running"` or `img "Queued"` again |
| All teams' legend, `features/teams/TeamsView.tsx:290` | `img "Running"` then "Running", for all five states |
| All teams' cards, `TeamsView.tsx:160` | `img "Blocked"` and the chip "Blocked"; `img "Queued"` and "Queued". The running cards' chip says the agent, so their glyph is the only sign there and is right |
| A run's stage lines, `features/ticket/RunsTab.tsx:194` | `img "Running"` … "running", `img "Pending"` … "pending", `img "Failed its check"` … the chip "Failed". A done stage has no end words, so its glyph is the only sign there and is right |
| A gated run's line, `RunsTab.tsx:150` | `img "Stopped at a gate"` then "Stopped at Plan sign-off" |

The headings matter most: heading navigation on the home screen reads "Done Done recently".

**Fix:** make the choice impossible to skip, which is the core idea. On the glyph form, make `name` required as `string | false`, with no default. `false` means the words beside it say the state; a string is its name where the glyph is the only sign. Each call site above then takes `name={false}`, apart from the running cards on All teams and the done stage lines, which keep a name. Every other glyph call site states its word explicitly: CompactView:107, TicketLine:55, TeamsView:160 (running), and the kit sheet. That is about ten one-word edits, and the class can't come back. Update `Mark.name`'s ledger reason to match. Wanting to keep the default is a fair choice too. If so, fix the six places, and say in Mark's doc comment that a glyph beside state words takes `name={false}`.

---

## nit

- **N1. The Now glyph passes its own default.**
  - Where: `features/ticket/now.tsx:41`, `name="Running"`, which is `WORD.run`.
  - Fix: drop the prop. With S1's required name it stays as it is.

- **N2. The close question asks two different questions.**
  - Where: `kit/Dialog.tsx:90`, `aria-label={`Close ${label}?`}`.
  - Failure: the screen's sheet has its own heading. A reader hears `alertdialog "Close NW-17's workflow?"`, then `heading "Save your changes to NW-17's workflow?"`, then "Closing now loses them."
  - Fix: name the alertdialog by the question it shows. Use `aria-labelledby` on the sheet's heading, found by a ref or passed as an id through a context the way FormRow's description is. Then `aria-describedby` can point at the line under it.

- **N3. Strip's accessible name reads symbols.**
  - Where: `kit/Strip.tsx:38, 44`.
  - Failure: "Plan (plan) → ◆ Plan sign-off → Implement (build)…". Screen readers say "right arrow" and "black diamond".
  - Fix: "then", and "gate: Plan sign-off". The `title` can keep the symbols.

- **N4. The sidebar's Search tooltip still uses the old double-space form.**
  - Where: `kit/Frame.tsx:183`, `title="Search  /"`.
  - Failure: round 6's N5 made the close "Close (Esc)", and the agent pager says "Next agent: Builder (j)".
  - Fix: "Search (/)".

- **N5. A status Notice's `lead` is drawn by nobody, and not as the ledger says.**
  - Where: `kit/Notice.tsx:95`. A status draws `<b>{lead}</b>{children}` with only a gap between them.
  - Failure: `Notice.lead`'s reason (ledger) promises "set off by a dash", which only `empty` and `more` draw (through `Said`). No screen passes `lead` with `kind="status"`.
  - Fix: `lead?: never` on the status case, which also removes the `.status > b` rule. Or draw it through `Said`.

- **N6. The live region is a child of the list.**
  - Where: `kit/Sortable.tsx:171`. The `aria-live` span sits inside the `role="list"` element.
  - Failure: after a move, the list owns a text child that isn't a listitem.
  - Fix: render the span as the list's sibling, returning a fragment.

- **N7. A sidebar section is a group named by its only button.** `kit/Frame.tsx:130` reads `group "Context"` › `button "Context" [expanded]`. This is the same shape as N8, which is with the owner, so it can go to the owner with N8: either drop the group role, or keep it and accept the repeat.

Still the owner's call, as before: Dialog's side sections by position (a slot at 40/40), the empty lane's dashed ring, and N8.

What remains:
- Round 6's fixes all hold. The nested-dialog bug is fixed on both overlays, and the held Esc, the headings and the Facts names are right in Chrome's tree.
- S1 is the double-name class a third time. It keeps coming back because the glyph names itself by default. A required `name` ends it in about ten one-word edits.
- The nits are small, and each is one line or close to it.
- Apart from S1, the kit is in good shape. Checks, gates and screenshots are green, and the visuals hold in all six themes.

Verdict: another round

# Kit review, round 6 (Opus)

Scope: the whole kit at `32afe00` (`web/src/kit`, `web/tools/kit.mjs`, `ledger.mjs` and its tests, and the screens as they use the kit). It also checks that the round-5 fixes (`32afe00`, `kit-r5-fixes.md`) hold.

How I checked:
- I read the round-5 diff, every kit TSX file, the kit CSS that the findings touch, the ledger, `kit.mjs`, `ledger.mjs` and its tests.
- `npm run check` passes. Vitest passes 13 of 13. `node tools/kit.mjs --check` passes at 40/40 components and 7,555 lines.
- All 22 screenshot tests pass against the baselines. I used a scratch config pointed at port 5221, with its output in my scratchpad, and updated no snapshots. The first run had one failure (`compact-expanded (light)`) on a cold server. It passed when run alone and in a second full run, so I count it as a flake, not a change.
- My token scan found no unused token and no `var()` that names nothing. The `--col-*` tokens are reached through `width()`, and the other unmatched names are custom properties the kit sets from TS.
- I ran Vite on 5221 and probed it with Playwright in Chrome. I took aria snapshots and logged focus, `close` events, `cancel` events (with `cancelable`) and whether each Esc keydown was prevented. The sequences I ran:
  - Esc ×4 and a held Esc in a dirty workflow overlay;
  - Esc in an open picker, with the overlay clean and dirty;
  - Esc and Done in a popped-out text area, inside the workflow overlay and inside the item overlay.
- I took screenshots in Carbon, Plum, Paper and Harbour.
- Vite is stopped and the tree is clean.

## The round-5 fixes

- **S1, the bare gate: holds.** The expanded row's knot is `img "Gate: Plan sign-off"`.
- **S2, Esc and the close question: holds for the sequences it names.**
  - Esc ×4 leaves 0 `close` events and 0 `cancel` events. It alternates between asked (focus on Keep editing) and dismissed (focus on Name).
  - Esc in an open Phase or Agent picker closes only the listbox, clean or dirty.
  - The "a nested dialog's Esc is theirs" half of the claim fails: closing a nested dialog also closes the one around it (M1 below). The failure is older than this round.
- **S3, names said twice: holds for the places named.** Compact's heads read "Needs you 2". The owner picker's options read `option "Ada Park"`. Thread says each name once. Five more places still double (S1 below).
- **S4, the ledger: holds for the entries named.** Other entries are still off (N3 below).
- **Nits:**
  - These hold: N1 (the reflows), N2 (`mergeProp` tested in both orders), N3 (`--ground` on `:root`), N4 (the field's invalid edge), N6 (the svg is `aria-hidden`), N7 (a named Mark needs its name), N8, N9 and Codex 2.
  - N5 holds read-only. While editing, it doubles the gate's name (N2 below).

Counts: **1 must-fix, 1 should-fix, 11 nit.**

---

## must-fix

### M1. Closing a nested Dialog closes, or asks to close, the Dialog around it
`web/src/kit/Dialog.tsx:139-146` (`onCancel` and `onClose`).

**Failure:** React dispatches a `<dialog>`'s `close` (and `cancel`) through the React tree as if it bubbled. It is a non-delegated event, but only `scroll` is target-only. So when the popped-out TextArea's inner Dialog closes, the outer Dialog's `onClose` runs too. `wanted.current` is still true there, so the outer reports a close the person never asked for. Measured:
- **Workflow overlay, clean:** Edit Plan, then "Edit Prompt in the whole window", then **Done**. Both dialogs close, and the URL drops `edit=workflow`. Esc in the popped area does the same.
- **Workflow overlay, dirty** (Name edited): Esc in the popped Prompt closes the Prompt window and then raises the outer's "Close NW-17's workflow?" (`closes:1`, `ask:1`). Done does the same.
- **Item overlay:** Context, then Edit tests, then the pop-out, then Done. The SKILL.md editor closes along with the pop-out, and the URL drops `edit=skills/tests/SKILL.md`.

Every popped-out text area inside an overlay is affected: a stage's prompt, and an item editor's body, AGENTS.md's blocks and instructions. The window that promises "Done or Esc brings it back" instead throws the person out of the editor, or asks to discard their work. The handler dates from the spike (`ed1775b`). Round 5's keydown change made the Esc half correct, which is why this probe path was taken as covered.

**Fix:** handle only the dialog's own events:
```tsx
onCancel={(e) => { if (e.target !== e.currentTarget) return; ... }}
onClose={(e) => { if (e.target === e.currentTarget && wanted.current) onClose(); }}
```
Then re-probe Done and Esc in a popped area, in a clean and a dirty overlay. The overlay should stay open with no question asked, and focus should be back on the expand button.

---

## should-fix

### S1. Names are still said twice in five places
Round 5's S3 fixed the patterns it named. The same doubling remains on the workflow screens, on the run line and on My queue's cards:
- **A stage card's face.** `features/workflow/StageCard.tsx:14` draws `<Avatar name=… />` without `beside`, and the card writes the agent's name under it. Every stage, in the editor's lane and on the ticket's Workflow tab, reads `img "Planner": PL`, then "Plan Maker **Planner** · opus · high". Pass `beside`.
- **A stage's last run** on the Workflow tab (`StageCard.tsx:140, 146`). The glyph is named `run.word` and the words after the name repeat it: `img "Done"` then "Plan **Done** …", and `img "Live"` then "Implement Build **Live** · round 2 of 3". Pass `name={false}` when the words say the state.
- **The run detail's starter** (`features/ticket/RunsTab.tsx:246`). The face, then "**Ada Park** started it at 10:13". Pass `beside`.
- **The Now line's glyph** (`features/ticket/now.tsx:41`). It is named `"Builder · run #42, running"`, and the text right after it is "Builder · run #42 · Running the API test suite". Name the glyph "Running".
- **An agent chip's glyph** (`kit/Chip.tsx:93`). `label={`${after.agent} agent`}` after a chip whose words already name the agent: "Builder running", then `img "Builder agent"` on every My queue card. The chip can't know whether its words name the agent. Either label the glyph "agent" alone, or hide it when the label starts with the agent's name. The simplest rule is that the chip's words are the screen's, so the glyph says only "agent".

These are the same class as round 5's S3, on screens a person reads every stage of.

---

## nit

- **N1. A held Esc toggles the question.** `Dialog.tsx:134-138` acts on every keydown, auto-repeats included. Three keydowns (two of them repeats) leave the question shown. Holding Esc flips it at the key-repeat rate and stops wherever the key comes up. Fix: `if (e.key !== "Escape" || e.defaultPrevented) return; e.preventDefault(); if (!e.repeat) onClose();`. It must still prevent the repeats, so none becomes a close request.

- **N2. While editing, a gate's name is said twice.**
  - Where: `Lane.tsx:140-145` adds the unseen "Gate: " whether or not the lane is editing.
  - Failure: editing, the diamond button already says `"Gate after Plan: Plan sign-off. Click to remove it"`, and the name span then says "Gate: Plan sign-off".
  - Fix: write the unseen prefix only read-only, and while editing `aria-hidden` the name (the toggle names it).

- **N3. More ledger words don't match the code.**
  - `IconName.normal` (`ledger.json:1188`) says "an empty slot". The glyph is three dashes (`Icon.tsx:227-238`), as the Icon entry itself says.
  - `Avatar.size.sm` (`:53`) says "a face inside a pill". The run detail draws `sm` outside one (`RunsTab.tsx:246`).
  - The your-move hue is called "blue": `MarkKind.you` (`:1151`), the Stepper gate's `waiting` and `you` (`:841-842`), and `Mark.module.css:90`. It is the theme's accent: indigo on Paper, orchid on Plum, teal on Harbour (`tokens.css:6-8`). `Mark.module.css:76`, eight lines further up, calls it indigo. Say "the your-move accent".
  - `Page.title` (`:615`) says "a list is Linear's breadcrumb". The type is a string or a pair.
  - `Dialog.children` (`:271`) describes only the side look. In the full look it is the one view.

- **N4. A Meter's name contradicts the words beside it.**
  - Where: `Meter.tsx:26`, `aria-label` "2/5 steps" (steps done).
  - Failure: My queue's cards show "3/5" (the step in progress), and the run card says "Step 3 of 5". A reader hears "3/5 … 2/5 steps".
  - Fix: "2 of 5 steps done".

- **N5. The full Dialog's close is named "Close  Esc".**
  - Where: `Dialog.tsx:79`. The icon button's title is its name, so assistive tech reads "Close Esc".
  - Failure: the peek's close reads "Close peek (Esc)", so the two closes differ.
  - Fix: "Close (Esc)", or the label: `Close ${label} (Esc)`.

- **N6. A group head that folds is not a heading.** `Head.tsx:58-67` draws an `<h2>` only when the group doesn't fold. Compact's heads all fold, so heading navigation finds no group on Compact, while My queue's heads are headings. Fix: put the fold's button inside the `h2` (the disclosure pattern).

- **N7. The Facts head names nothing.**
  - `Facts.tsx:62`: "Properties", "Code" and "Workflow" are bare spans, and the `dl` after each one is unnamed. In the peek they read as stray text between the description and the terms.
  - The screen's words double with the unseen terms: "Workflow" then "term Workflow", and "term Opened" then "Opened 1d ago" (`properties.tsx:33, 53-57`).
  - Fix: `aria-labelledby` from the `dl` to its head. For the screen, drop the visible "Opened" from the value, or the term where the value says it.

- **N8. A group in a group.** Every FormRow is a `group` named by its label. Fit's Segmented names its own group with the same label, so the Role row reads "group Role › group Role › Maker pressed" (`Segmented.tsx:197`). Fix: inside a FormRow, Fit takes no `aria-label` and is labelled by the row's label (the DescribedBy context could carry the label id). Every one-control row also reads "Name group, Name edit". That is worth the owner's call whether FormRow needs the group role for a single control.

- **N9. Compact's priority bars are said to no one.**
  - Where: `features/compact/TicketLine.tsx:32`, `<Icon name={t.priority} />` with no label and no tooltip.
  - Failure: high and low priority reach only sighted users, and there is no hover text. Intake writes "High priority" beside the same bars.
  - Fix: `label` for high and low ("High priority"); normal stays decorative.

- **N10. `?peek=` with no key opens an empty panel.**
  - Where: `features/peek/Peek.tsx:147-164`. `params.get("peek")` is `""`, so the dialog opens (`key !== null`) with nothing in it and is named "Peek".
  - Fix: parse the param at the edge, `params.get("peek") || null`, so an empty key is no peek.

- **N11. Two needless exports.** `identity.ts:4-5` exports `HUES` and `Hue`, which nothing outside the file uses.

Still the owner's call, as before: Dialog's side sections by position (a slot at 40/40), and the empty lane's dashed ring on All teams.

What remains:
- M1 is a real behaviour bug in the kit's one modal, on the main editing path. Every popped-out text area inside an overlay throws the person out of the editor, or asks to discard. It is a two-line fix.
- S1 is the double-name class in five more places, the stage cards among them.
- The nits are small, and most of them are one line each.

Verdict: another round

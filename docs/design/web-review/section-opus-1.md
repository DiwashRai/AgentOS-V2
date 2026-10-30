# Section review: Opus, round 1

Commit `d7fd10a` (change `26943ed..d7fd10a`). I read the whole diff, plus `Dialog.tsx`/`.css`, `Head.tsx`, `Page.tsx`, `Text.module.css`, the kit sheet and every screen that changed. Checks: `npm run check` (tsc, eslint, stylelint, prettier) is clean, `node tools/kit.mjs` gives 44/45 components and 8,364/9,000 lines, and Vitest passes 17/17. I ran the app on 5221 with Playwright in Chrome. I took screenshots and ARIA snapshots of the peek, the peek's missing state, the ticket page, its Workflow tab, the workflow overlay, the workflow editor and the skill editor, all in both themes. I also measured the DOM and compared the old and new baselines. The server is stopped.

Summary: the positional `.body > *` rule is gone, and nothing feature-supplied in the kit is laid out by position any more. The rules left are `Section .part:last-child`, Table's `.bleed:first|last-child`, Lane's `.joint > :last-child` and Thread's `.mine > :first-child`. Each one positions the component's own element or the kit's own markup. Region names and headings are correct, and both themes look right. What remains: one latent kit-contract bug, and one spacing regression with two symptoms caused by the single fixed head-to-body gap.

## should-fix

1. **`web/src/kit/Section.tsx:67-71`: `InPanel` reaches every descendant, not just the panel's parts.**
   - **The bug:** `useContext(InPanel)` is true for any Section anywhere under a side Dialog's body, however deep. A Section nested in a Section in the peek, for example a sub-part inside Talk or the head, also gets `.part`. That gives it a second 16/24 px padding and its own hairline, so its content is inset 48 px and ruled off inside its parent part.
   - **A second path:** the same happens to any full Dialog opened from inside the peek's tree. Context flows through the React tree, not the DOM. Kit `TextArea`'s `fill` opens one, and every Section in that full-window view would be drawn as a panel part.
   - **Why it matters:** the types allow both of these states, and the Dialog's own doc says only "its parts are Sections".
   - **Fix:** in `Section`, wrap the children in `<InPanel value={false}>`. Then only the panel's direct parts are parts, and a full Dialog inside a part is covered too.

2. **`web/src/kit/Section.module.css:7` (with `features/ticket/talk.tsx:16-24`): Talk's head now sits closer to the thread than the messages sit to each other.**
   - **Measured (ticket page):** the note "Just people here…" ends at y=135 and the first message starts at y=145, a 10 px gap. Between one author's message and the next the gap is 24 px (246→270, 345→369).
   - **Measured (peek):** the same, 539→549 against 627→651.
   - **Before:** the gap was 24 px on the ticket page (`Stack gap={9}`) and 16 px in the peek (`Stack gap={8}`), so the head read as a head.
   - **Why it went wrong:** `.section { gap: var(--sp-5) }` is one head-to-body gap for every Section. Talk's body is a list with looser rhythm than that gap, so proximity groups the note with Bea's message rather than with "Talk". The new baselines `my-queue-peek-*` and `ticket-*` show it: about 8 px less in the peek, 16 px less on the page.
   - **Fix:** give the head its own larger gap to the body, for example `.head { margin-bottom: var(--sp-3) }` or a `.section` gap of `--sp-8`. Re-check Plan and "The agent reads", which were at 10 px before. Don't add a gap prop.

3. **`web/src/features/ticket/WorkflowTab.tsx:109-114`: the copy's head lost its grouping.**
   - **Before:** the title row, then the drift chips and "Edited by …" 6 px under it (`gap={3}`), then 14 px (`gap={7}`) to "Every stage gets" and to the lane.
   - **Now:** the drift/edited row is a body child, so title → drift → Context → Stages are all 10 px apart (measured 675→685, 707→717, 739→749). The "Edited by" line now reads as the first line of the body, level with "Every stage gets", instead of as the title's subline.
   - **Cause:** this is the same fixed-gap problem as item 2, plus `note` accepting only a string. A head's subline that carries chips has nowhere to go.
   - **Fix:** either let `note` take the drift row (a `ReactNode` subline, with a ledger reason), or fix item 2's gap and accept this. Don't push the row back into a hand-made Stack around the Section.

## nit

4. **`web/src/kit/Section.module.css:36-42`: a third copy of the heading type.**
   - `.title` repeats `Text.module.css:19-24` (`.heading`) and `Dialog.module.css:146-152` (`.question`) value for value: fs-5, 600, 1.35, ink-1.
   - A change to the heading scale now has to land in three places. Share one class, or compose `Text` with `variant="heading" as="h2"`, which supports an `id`.

5. **`web/src/features/peek/Peek.tsx:95`: the head part's region name is just the key.**
   - AT reads `dialog "Peek at NW-17" › region "NW-17"`: the dialog's name with less in it, while the heading inside is the title.
   - The region would be more useful named by its heading, the ticket's title. The ledger already describes it as "its title the heading inside it".
   - That is possible today only by passing the title string as `label` (`label={t.title}`). Fine as is if deliberate.

6. **`web/src/features/workflow/LibraryPanel.tsx:118-121`: the name "Library" is said twice.**
   - AT reads `region "Library" › tablist "Library"`. Before, it was heading plus tablist, and now there is a region as well.
   - Fix: name the tablist for what it switches, for example "Kind", or accept it.

7. **`web/src/kit/Section.tsx:4-5`: every Section is now a region landmark.**
   - The ticket page adds Plan, The agent reads and Talk. Each editor rail adds Properties, Used by and History. The workflow editor adds Library.
   - Region landmarks are meant for a few major areas, and headings already give "list and jump".
   - Not wrong, but the landmark list is getting long. If it grows, consider naming only the panel parts.

8. **`web/src/kit/Section.tsx:58`: the note is not tied to the region.**
   - Talk's note ("Agents don't read this") is the one thing a person must know before typing there. A landmark jump announces only "Talk region".
   - Fix: `aria-describedby` on the `<section>` pointing at the note's id. It costs one id.

9. **`web/src/kit/Section.tsx:20` against `:22`: the optional props are typed inconsistently.**
   - `aside?: string | undefined` but `note?: string`.
   - Only PlanSection's explicit `undefined` needs the first form. Make them the same.

10. **`web/src/features/sheet/KitSheet.tsx:476`: Section is not on the kit sheet.**
    - The kit sheet ("Every component, every variant") doesn't show Section, nor the side Dialog that gives it its part look.
    - Its local `function Section` now shadows the kit's name, and so does `Frame.tsx`'s internal `Section`, which makes grepping for uses noisy.
    - Compare, Strip and Swap are absent from the sheet too, so this is consistent with the rest, not a new gap.

11. **`web/src/kit/Dialog.tsx:26`: nothing stops a side Dialog's children from being something other than a Section.**
    - `children: ReactNode` accepts a non-Section child, which now draws flush to the panel's edges with no padding. The old rule padded anything.
    - The only side Dialog (the peek) is correct in all three states: loaded, loading and missing (checked).
    - React can't enforce this type. The doc comment is the guard, and it is clear.

Verdict: another round

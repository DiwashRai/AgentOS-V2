# Section review: Opus, round 2

Reviewed at `fdb81f1`. I read the round 1 fix diff (`d7fd10a..fdb81f1`) and the whole change again (`26943ed..fdb81f1`).

Checks:
- `npm run check` (tsc, eslint, stylelint, prettier) is clean.
- `node tools/kit.mjs` reports 44/45 components and 8,363 of 9,000 lines.
- Vitest passes 17/17.

I ran the app on 5221 in Chrome (Playwright). I measured the DOM and read Chrome's accessibility tree (CDP) on these screens:
- the peek (light and dark)
- the ticket page and its Workflow tab
- the ticket's workflow overlay (`?edit=workflow`)
- the workflow editor (dark)
- the skill editor (dark)
- `/kit`

The server is stopped and my screenshot folder is removed. The tree is clean.

## The round 1 fixes hold

- **Panel context (Opus 1, Codex 1):** fixed.
  - `Section.tsx:79` wraps the body in `InPanel value={false}`.
  - `Dialog.tsx:187` resets the context for the whole dialog, and only the side body re-provides it (`:154`). The foot is outside it too.
  - In the workflow overlay, the full Dialog's Library Section has 0 padding and no `part` class.
  - In the peek, the three parts are padded `16px 24px` and ruled off. The last one (Plan) has no rule.
- **Head-to-body gap (Opus 2):** fixed in the peek, partly fixed on the page (see nit 1).
  - Every Section now has 16 px between head and body (`--sp-5` gap plus the head's `--sp-3` margin).
  - Peek Talk: note 541, then thread 557. That is back to the peek's original 16 px.
- **Workflow tab's subline (Opus 3):** fixed.
  - Title line 641–675, then the drift/edited subline 679–701 (4 px under it), then the body at 717 (16 px).
  - "Edited by…" reads as the title's subline again.
- **Nits taken:** all correct in the app.
  - The heading now uses Text's `heading` class, and the third copy is gone.
  - The peek head's region is named by the ticket's title.
  - The tablist is named "Kind".
  - The note describes its region. Chrome computes "Talk: Just people here. Agents don't read this." and "NW-17's copy of Standard v3: Library has v4 Changed here Edited by Ada Park · 35m ago", spaced correctly.
  - `aside` and `note` are now typed alike.
  - Section is on the kit sheet, and the sheet's local helper is renamed `Block`.
- **The two declined (Opus 7, 11):** the reasons are sound, and I don't re-raise them.

Looking again at the whole change:
- No positional rule lays out feature content. The positional selectors left in the kit all target the kit's own markup.
- No duplicate region names on any screen I checked. The overlay has: dialog "NW-17's workflow", then regions Library and Every stage gets, then tablist Kind.
- Both themes look right on every screen that changed.

## nit

1. **`web/src/kit/Section.module.css:24` (Talk on the ticket page, `features/ticket/TicketView.tsx:119`): the head is still a little nearer the first message than the messages are to each other.**
   - On the page, the note ends at 137 and the thread starts at 153: 16 px. Messages are 24 px apart (254→278, 353→377). Before Section, the page had 24 px here.
   - The same 16 vs 24 holds in the peek, but that was the peek's original spacing.
   - In the screenshots it reads as a head, thanks to the heading weight and the quiet note, so this is cosmetic.
   - Leave it unless the gauntlet's bar says otherwise. A per-Section gap prop would cost more than it buys.

2. **`web/src/features/sheet/KitSheet.tsx:680-704`: the sheet shows Section only outside a panel.**
   - Missing look: the panel-part look (padded, ruled off) is the reason Section exists, and it isn't on `/kit`.
   - Label-only example: "A part with no head of its own" sits 16 px under Plan's body line with no boundary, so it reads as a second line of Plan.
   - Fix: a framed example, or a short note.

3. **`web/src/kit/Section.tsx:51`: the heading is always an `h2`.**
   - On `/kit`, Talk and Plan are `h2`s beside the sheet's own `h2` "Section" rather than under it.
   - The round 1 fix now explicitly allows "a Section inside a part", whose heading would also be an `h2` under an `h2`.
   - No real screen nests Sections today, so this is negligible until one does.

Verdict: done

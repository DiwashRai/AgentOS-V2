# Patterns layer review (Opus)

**Verdict:** not ready. The layer's rules are enforced by how an import is spelled rather than which module it resolves to, so code can be moved or disguised past every one of them. Separately, `loadOf` breaks how a failed refetch is handled.

## Must-fix

1. **The cross-screen ban can be bypassed by spelling the path differently.** `eslint.config.js:110` matches the raw string, so `import … from "./../compact/model"` and `"../shared/../compact/model"` both lint clean from `features/ticket/RunsTab.tsx` (verified with `eslint --stdin`). `import("../compact/model")` is seen by neither ESLint nor kit.mjs (`kit.mjs:203` only scans declarations). Fix: check layers on resolved files in kit.mjs, which already resolves every import (`placeOf(importer)` against `placeOf(imported)`), and ban `ImportExpression` outside `app/`.

2. **The patterns' import rule is a list of bans, not a list of what's allowed.**
   - The fixtures ban (`eslint.config.js:53`, also `:68` for screens) misses `"../domain/fixtures.js"` and `"../domain/./fixtures"` (verified; `bundler` resolution accepts both).
   - `@tanstack/react-query` is not banned, so a pattern can call `useQuery` or `useQueryClient` (verified). That contradicts architecture.md's "no query hooks".
   - A new top-level folder (`src/ui/`) matches no `LAYERS` block. It gets no import rules and no Base UI ban, and kit.mjs never scans it. A pattern put there escapes the 2-screen and domain-props rules entirely.
   - Fix: per layer, list what each may import, checked on resolved paths; any `src/*` folder that isn't a known layer fails.

3. **The domain-props check can be fooled by disguise.**
   - Lowercase exports skip it (`kit.mjs:312`); `lineEnd` already shows props "-" on the card.
   - `kitTypesIn` sees only type references and alias symbols, so `look: ComponentProps<typeof Checklist>["look"]` passes. So does a copied literal union. `PlanSection`'s `place` is exactly Checklist's `"page" | "peek"`, passed straight into `look` (`ticketHead.tsx:190`).
   - Fix: check every function export's first parameter. Also flag a pattern prop whose value flows unchanged into a kit prop: `setBy` already sees `look={place}`.

4. **The 2-screen credit can be inflated, and `features/shared` has no rules at all.**
   - `reached()` (`kit.mjs:248-257`) credits a screen with every pattern a shared file imports, whatever it actually takes from that file.
   - `namesOf` counts re-exports and `import type`, so a stray `export { Who } from …` in a second screen counts as a use.
   - Moving a one-screen composition with kit-vocabulary props into `features/shared` passes every check.
   - Fix: credit by the names actually used, ignore type-only imports and re-exports, and apply the 2-screen rule to `features/shared` exports too.

5. **`loadOf` throws away data when a refetch fails** (`api/queries.ts:18-24`, `shared/board.ts:11`). TanStack v5 keeps `data` while `status` is `"error"`. The old code checked data first. Now any failed background refetch (a mutation's invalidation, W11's `/changes`) replaces the ticket page, the lists and the editors with "Can't reach the server". This behaviour change wasn't asked for. Fix: return `ready` whenever `data !== undefined`.

## Should-fix

6. **An unowned face has no name.** In `Who`'s `face` place, nobody is an `aria-hidden` dashed ring (`who.tsx:20`). The line end's column label is `""`, so an unowned row's owner cell says nothing; the Runs tab's By cell is the same. Fix: name it "Unassigned". That needs a name on the kit's dashed Avatar (a ledger ask).
7. **Wrong word for a run with no starter.** The Runs tab's starter for nobody reads "Unassigned queued it · …" (`RunsTab.tsx:245`). `Run.by: null` isn't an empty owner. Fix: give the starter place its own word for nobody.
8. **Two author-name rules are still alive.** `authorText` (`format.ts:105`) writes "run #42 on" by its own rule, and `ContextTab.tsx:27` has its own first-name / "run #N". Fix: both go through `nameOf(fromAuthor(…))`.
9. **`useParam` didn't absorb its other copies.** `useSearch.ts` and `ticket/tabs.ts` `useTicketUrl` still write query keys by hand, because `useParam` has no `replace`. Fix: add `useParam(key, { replace })` and use it in both.
10. **`?only=` isn't parsed at the edge** (`IntakeView.tsx:243`). An unknown value lists nothing, says nothing and leaves no chip pressed. Fix: parse it against `data.queries`, as `parseFilter` does.
11. **`stateOf(t, a, me)` can be handed a mismatched pair** (`teams/model.ts:112`). `a` must be `t.attention`, but nothing ties the two together. Fix: narrow inside, or take a row type whose attention is already narrowed.
12. **The tests miss the risky parts.**
    - Only the pure `patternProblems` and `staleSingles` are tested. `screenUses`, `readPatterns` and `kitTypesIn` (where items 1-4 live) are not.
    - Nothing tests `useParam`/`usePeek` keeping the other keys and treating an empty `?peek=` as no peek.
    - Nothing tests Intake's chip and search staying independent.
    - Fix: a small fixture-tree test for the credit and the prop checks, and one hook test for the URL state.
13. **The docs overstate what's enforced.** `docs/architecture.md` › The web says what patterns may import and that "ESLint bans both" (cross-screen imports and shared importing a screen); items 1-2 show neither holds. It also says credit is "directly or through a shared module", leaving out credit through other patterns and the whole-file reach. Fix: correct the docs when the checks are fixed.

## Nits

14. **Tally duplicates `plural`.** Tally restates `plural`'s default rule (`tally.tsx:5` vs `format.ts:41`). Teams bends it with `one="in flight" many="in flight"`, nesting a meta `Text` inside another meta `Text` (`TeamsView.tsx:57`).
15. **Stale header and a misplaced helper.** `itemEditor/model.ts:1` still says "The library screens' pure helpers". The library list imports `sizeText` from the editor's internals; it belongs in `domain/format`.
16. **Styling knobs, and an untied pair.** `StageSummary.show` and `Who.place` are styling knobs dressed as domain words. `LINE_END` and `lineEnd` must agree on four columns, and nothing ties them.
17. **One commit mixes two concerns.** 1d7f2bc (AgeCell) also changes the Runs tab's By face, which is `Who`'s concern.

# Patterns layer review, round 2 (Opus)

**Verdict:** not yet. All of round 1's findings and Codex's 1-7 are closed; I re-ran every earlier bypass and each now fails (eslint --stdin, and the probes in `tools/*.test.mjs`). But the resolved check, which the docs call the one "no spelling gets past" (`docs/architecture.md:85`), can still be passed three ways, and so can the props check. I ran each new probe through `tree()`, `layerProblems` and `readWeb`, and through `eslint --stdin`: none of them produced a problem.

## Must-fix

1. **The resolved layer check misses three ways in.**
   - **A root-absolute glob.** `import.meta.glob("/src/features/compact/*.ts", { eager: true })` in `features/ticket` loads another screen. `globbed` (`reach.mjs:47-55`) runs `globSync` with `cwd` set to the importer's folder, so a `/`-led pattern matches nothing and records no import. ESLint doesn't see globs at all.
   - **Stylesheets outside the kit.** A pattern's `import "./skin.pcss"` (a format Vite reads natively) passes, because `patterns/skin.pcss` is in the patterns layer and `MAY.patterns` includes `"patterns"` (`layers.mjs:42`). A screen's `./q.css` passes the resolved check too; only ESLint's `**/*.css` glob stops it. Stylesheets are never treated as the kit's own.
   - **A `.js` file with a `.d.ts` beside it.** `features/intake/helper.js` imports `../compact/model` and calls `createElement("div", { style })`; `I.tsx` imports it through `helper.d.ts`. `readModules` (`reach.mjs:128-133`) records a non-TS file only by where it sits, and ESLint's layer and raw-tag blocks cover `*.{ts,tsx}` only.
   - **Fix:**
     - Resolve `/`-led glob patterns from the web root, and fail a glob that matches nothing.
     - Make every stylesheet type Vite reads (`css|less|sass|scss|styl|stylus|pcss|postcss|sss`) reachable from the kit alone.
     - Fail any `.js`, `.jsx`, `.mjs` or `.cjs` file under `src/`.
     - Add each case to `layers.test.mjs`.

2. **The props check misses a generic constrained by a kit type.** `export function G<T extends Tone>({ tone }: { tone: T }) { return <Text tone={pick(tone)} />; }` reports nothing. `kitTypesIn` (`props.mjs:127-168`) follows aliases, interfaces, variables and parameters, but not a type parameter's constraint. The knob check doesn't catch it either, because the value goes through a helper (`pick`) rather than straight in. Fix: follow `TypeParameterDeclaration.constraint` in `follow`, and `getConstraintOfTypeParameter` in `walkType`; add `G` to `uses.test.mjs`.

## Should-fix

3. **Code that never runs still earns credit.** Two screens that each hold only `export const keep = [Who, G, styled];` credit `Who`, `G` and `styled` to both screens, and the kit's `Avatar` too. `screenUses` starts from every top-level unit of every screen module (`uses.mjs:239-240`), whether or not anything reaches it. Fix: start reach from what the app routes to and what a screen's reached units name, not from every top-level unit; or fail a screen's export that nothing imports.

4. **The PlanSection knob is still a knob.** The fix turned `look={place}` into an identity map, `PLAN_LOOK = { page: "page", peek: "peek" }` (`ticketHead.tsx:174`). `place` still is Checklist's `look`. The knob check passes it by design: `uses.test.mjs`'s `Mapped` case is expected to pass. That is code disguised to get past a gate, which AGENTS.md forbids. Fix: either name Checklist's looks for how they look, so the map chooses something, or have the knob check also flag a map whose keys equal its values.

## Nit

5. **ESLint's string-bound-tag rule is broader than the gate's.** The selector at `eslint.config.js:139` flags any PascalCase const bound to a lowercase word (`const Mode = "edit"`), not only one used as a tag. The resolved check reads the tag's type and has no such false positive. Fix: match only names used as a JSX tag, or leave tag detection to the gate and `ts_measures`.

Closed and verified:
- Round 1's findings 1-16 (17 is history and out of scope).
- Codex's 1-7; his 8 is history and out of scope.
- `node tools/kit.mjs --check` passes, and so do the tools' tests (26).

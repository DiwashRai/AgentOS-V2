# Patterns layer review, round 3 (Opus)

**Verdict:** ready from my side: no must-fix left. Every round-2 finding (mine and Codex's) is closed, and the bans break no real code.

## What I re-ran
- **My round-2 probe:**
  - The root-absolute glob, `.pcss` in a pattern, `.css` in a screen, and `.js` with a `.d.ts` now each fail with a named problem.
  - `G<T extends Tone>` fails as "typed with the kit's Tone".
  - `export const keep = [Who, G]` now earns no credit: `Who`, `G` and `styled` each show 0 screens.
- **Codex's round-2 probes, in a new tree:** all fail. These were:
  - `const h = React.createElement` ("names createElement");
  - a `"div" | "span"` tag ("may be a string");
  - `Checklist as List` ("by another name");
  - a class component;
  - a namespace import, which is banned outright.
- **The real web, from the repo root (as the hook runs it):** `node web/tools/kit.mjs --check` passes kit, patterns and layers, with no false positives on real code.
- **The looks:** Checklist's are now `bare | roomy | snug`, and PlanSection's map is a real choice (page to roomy, peek to snug). Closed.

## Should-fix

1. **A styling knob still gets through a rest spread.** `function Plan({ items, ...rest }: { items: string[]; look: "roomy" | "snug" }) { return <Checklist items={items} {...rest} />; }` reports no knob. The knob check reads a spread only when it is an object literal (`uses.mjs:147`). The props check can't see it either, because `look` is a copied literal union, not a kit type. Spreading the rest of the props onto a child is the usual React idiom, so this is the one way left to land a knob without trying to hide it. Fix: when a spread's expression is a rest binding of the top function's parameter, treat each field of the rest's type that is also a knob on the kit tag as passed unchanged.

## Nits

2. **A kit component held in an object escapes both credit and the knob check.** `const CELL = { text: Text }; <CELL.text tone={tone} />` reports no knob, and Text isn't credited to the screens that draw it. The const ban covers only an identifier initializer (`reach.mjs:148`), and the kit is recognised by the tag's text (`uses.mjs:186`). It's rare, but a column-to-cell map like that is plausible. Fix: flag a kit binding referenced anywhere outside a JSX tag position or a call argument, or resolve the tag's symbol to the kit's export.

3. **A negated glob pattern would fail by mistake.** Vite accepts `!` patterns inside a glob array (`["./twins/*.tsx", "!./twins/wip.tsx"]`). `globbed` treats each pattern on its own, so the `!` one "matches nothing" and fails (`reach.mjs:68`). No code uses one today. Fix: skip `!`-led patterns when applying the matches-nothing rule.

Probe scripts, which wrote nothing in the repo:
- `C:\Users\diwash\AppData\Local\Temp\claude\C--code-AgentOS-V2-web\6d0fdab0-5ae2-4898-99b9-b3d2c29ccdad\scratchpad\probe.mjs`
- `C:\Users\diwash\AppData\Local\Temp\claude\C--code-AgentOS-V2-web\6d0fdab0-5ae2-4898-99b9-b3d2c29ccdad\scratchpad\probe3.mjs`

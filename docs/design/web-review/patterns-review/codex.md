Request changes: five architectural checks are bypassable; the shared identity and age patterns also leave accessibility and product defects.

1. **must-fix — Screen isolation depends on path spelling.** `web/eslint.config.js:110` exempts anything beginning with `../shared/` without resolving its destination. From Queue, `import { TicketView } from "../shared/../ticket/TicketView"` passes; from shared, `"./../ticket/TicketView"` also passes. Both resolve to the forbidden screen. These passed the configured import rule in memory. The advertised screen/shared separation therefore has a trivial escape.
   Fix: enforce layer membership against resolved, normalized module paths, including re-exports, with regression cases for both spellings.

2. **must-fix — Patterns can read data directly.** `web/eslint.config.js:45` defines a blacklist rather than the promised import whitelist. `import { useQuery } from "@tanstack/react-query"` passes in a pattern, permitting reads without props; `import("../api/queries")` also escapes `no-restricted-imports`. The latter technique bypasses the screen restrictions too. These produced no import-rule diagnostics in memory.
   Fix: enforce the documented allowed modules for static imports, re-exports and dynamic imports; reject unapproved runtime dependencies.

3. **must-fix — Renaming a kit type defeats domain-prop enforcement.** `web/tools/kit.mjs:286` inspects the immediate annotation and resolved alias symbol, but does not follow local type declarations. In-memory compiler probes accepted `type Alias = ChecklistProps["look"];` followed by a component prop `{ look: Alias }`, and accepted `{ appearance: Appearance }` where the local interface contains `tone: Tone`. The same direct `Tone` prop was correctly rejected. Merely disguising the forbidden type makes the gate green.
   Fix: traverse referenced declarations, indexed accesses and nested shapes with cycle protection, and test through the actual compiler/extractor rather than preassembled `kitTypes` arrays.

4. **must-fix — Intrinsic elements can be disguised as components or calls.** `web/eslint.config.js:153` and `tools/gates/ts_measures.mjs:61` recognize only literal lowercase JSX tags. `const Div = "div";` followed by `<Div />` passes the lint restriction and is not counted as a raw tag. React's permitted `createElement("div", { style: { color: "red" } })` likewise introduces elements and CSS outside the kit. Both bypasses passed the lint probes.
   Fix: check resolved JSX element types and intrinsic element factory calls outside the kit, including aliases, and cover both measurement and lint behavior.

5. **must-fix — Type-only imports manufacture two-screen reuse.** `web/tools/kit.mjs:185` and `web/tools/kit.mjs:203` count type-only imports as runtime dependencies. Two screens containing only `import type { Who } from "../../patterns/who"; export type Signature = typeof Who;` gave `Who` two screens and no pattern problems in an in-memory compiler probe, with zero TypeScript diagnostics. Neither screen draws it. Traversing these edges also falsely credits the kit components inside that pattern, defeating reuse and stale-`single` checks together.
   Fix: exclude type-only import/export clauses and specifiers from runtime reachability and reuse credit; add an extractor-level regression.

6. **should-fix — The standalone unassigned face has no accessible name.** `web/src/patterns/who.tsx:20` renders the nobody case as an unnamed dashed Avatar; `web/src/patterns/who.tsx:25` supplies no accompanying text for `place="face"`. Avatar makes that slot `aria-hidden` (`web/src/kit/Avatar.tsx:83`). The owner column and Runs' By column consequently expose nothing for Unassigned, while named people remain accessible.
   Fix: provide an accessible Unassigned label for standalone empty faces while keeping faces beside text decorative.

7. **should-fix — Age tooltips contradict the settled product call.** `web/src/patterns/age.tsx:22` uses abbreviated `ago()` output in the tooltip, yielding “Updated 3h 10m ago.” `.review/patterns-decisions.md:9` explicitly requires the full form, exemplified by “Updated 3 hours ago.” The running tooltip at line 28 has the same problem.
   Fix: add a domain formatter for full duration words and use it in age tooltips; retain compact units in cells.

8. **nit — Every commit carries a forbidden session trailer.** All 14 messages in `2498400..HEAD`, including `7ad712d` and `25f57b3`, include `Claude-Session: https://claude.ai/code/session_...`, contrary to `AGENTS.md:35`.
   Fix: remove session-link trailers before the branch is merged, preserving the permitted co-author attribution.

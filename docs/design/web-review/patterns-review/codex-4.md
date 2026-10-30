Not yet: round-three findings 1–2 are closed; route-credit finding 3 remains partially open.

Verified: memo/forwardRef wrappers and identifier/rest spreads now produce knob findings; the typed-const component counts zero raw tags; named barrels and `await import(...).Component` receive credit. The real web passes `node web/tools/kit.mjs --check` from the repository root.

1. **must-fix — Ordinary lazy routes and star barrels crash the extractor.** `web/tools/uses.mjs:257` drops `t.stars` from the module record, but lines 295 and 299 iterate `target.stars`. Both `lazy(() => import("../features/a/A"))` and a screen barrel containing `export * from "./A"` throw `TypeError: target.stars is not iterable`. These are valid TypeScript and supported routing forms, not contrived bypasses.
   Fix: carry `stars` into every module record and test default-export lazy screens and star barrels through the complete extractor.

2. **should-fix — Promise `.then` is mistaken for a module export.** `web/tools/uses.mjs:215` records `import("../features/a/A").then(m => m.A)` as requesting the export `then`. This is the original round-three lazy-route probe. Restoring the missing `stars` field in memory removes the exception but still credits only one of two consuming screens, incorrectly failing the pattern's reuse requirement.
   Fix: distinguish Promise methods from access to an awaited module; follow the callback's selected export or conservatively credit the imported module's exports.

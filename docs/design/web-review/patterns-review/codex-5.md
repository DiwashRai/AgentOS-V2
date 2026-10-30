**Confirmed — both round-four findings are closed.**

Re-ran the complete extractor against three in-memory probes:

- A default-export screen loaded with `lazy(() => import(...))`.
- A screen reached through an `export *` barrel.
- A screen selected with `.then(m => m.A)`.

Each correctly credited the shared pattern and its kit component to both consuming screens, with no exceptions, architectural findings or TypeScript diagnostics.

The real web also passes `node web/tools/kit.mjs --check` from the repository root: kit, patterns, shared reuse and layers all pass.

No remaining must-fix, should-fix or nit findings in this confirmation scope.

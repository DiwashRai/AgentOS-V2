# W0 review round 2: what was done with each finding

1. **Fixed.** `just gates` passes its arguments to `kit.mjs --check` too, so CI's `--base origin/main` reaches it. The base is the merge base with REF, as `gates.py` uses. A REF that doesn't resolve (or has no merge base) exits 2 with a message. The only quiet case is a base with no ledger (checked with `git cat-file -e`).
2. **Fixed.** Object props are walked as well as arrays, but only the kit's own declared shapes, down to three levels. The probe that adds `paused` and `parked` to Stepper's step and gate states fails the gate: `Stepper.model.stages[].state=paused` and `….gate.state=parked`. Those states now have reasons in the ledger. Stale nested entries fail too.
3. **Fixed.** Variants come from the checker. A literal counts as itself, and an expression counts as its type's literal members, so `look={done ? "flat" : "raised"}` and `edge={edgeOf(t)}` both count. An expression typed as one of the kit's own types (a `ButtonVariant` handed on) counts as passing through. `ActionButton`'s variant is now typed narrowly (`"you" | "ink" | "accent" | "default"`).
   - The list dropped from 65 lines to 50: defaults, the kit's own uses, and real single-screen variants.
   - It also showed dead variants, now removed: `Meter.state` (only ever running), Stack `align` end and stretch, Stack `justify` start and center, and Text `as` code.
4. **Fixed.** The patterns are `\*\s*(?!(?:-1|2)(?![\d.]))-?[\d.]`, `/\s*(?!2(?![\d.]))[\d.]` and `[\d.]\s*\*`.
   - Refused (probed): `* 2.6`, `* -1.5`, `/ 2.5`, `7 * var()`, `* 3`, `* .5` and `2 * var()`.
   - Still allowed: `* 2`, `* -1`, `/ 2`, `1 / -1`, and the kit's own CSS.
5. **Fixed.** The opener isn't stretched over the cells any more:
   - The cells keep normal hit-testing.
   - The wrapper has `role="presentation"` and takes the mouse click. This is jsx-a11y's documented pattern for an element catching clicks that bubble up from its contents; a probe shows the same div without the role is refused.
   - The row's real `<button>` is visually hidden, for the keyboard and assistive tech, and the focus ring goes round the row.
   - A click on a control inside the row, or one that ends a text selection, doesn't open it.
   - Probed in the browser: a titled cell is the hit target again (the stage path's tooltip shows), Approve doesn't open the peek, a click on the title does, a drag-select doesn't (and keeps the selection), and Enter on the row's button does.
   - The screen shots are pixel-identical.
6. **Fixed.** The reason span is `hidden`; `aria-describedby` still reads it. The exact-name query `getByRole("button", { name: "blocked", exact: true })` finds it.
7. **Fixed.** The `web/` row names the ledger and the ESLint layers instead of architecture.md. The `just gates` row mentions the kit gate. The rules say the kit ledger's `raises` are the owner's to add, as the baseline's are. `docs/architecture.md:10` still describes the old plan; that's in the report.
8. **Fixed.** Before the session is known, only the server's `blocked` applies.
9. **Fixed.** Esc in an input stays the input's own. The listener is added once (the latest `collapse` is kept in a ref).
10. **Fixed.** A missing `budget.components`, `props` or `lines` fails the gate.
11. **Fixed** (the header comment).

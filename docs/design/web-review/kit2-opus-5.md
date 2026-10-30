# Kit 2 review, Opus round 5 (`090db35..1aca6e8`)

## How I checked

- I read the round 4 fixes (`9da9cb3..1aca6e8`) and looked again at what they touch: `toast.tsx`, `Dialog.tsx`, `choice.tsx`, `tip.tsx` and `tools/tokens.mjs`.
- I probed in Chrome with the app's own React and kit on port 5221 (`o5-probe.mjs` in my scratchpad), and stopped Vite afterwards. Nothing is left listening on 5221.
- `tsc --noEmit`, `eslint src tools`, `vitest` (17 tests) and `node tools/kit.mjs --check` are clean. The kit is at 43/45 components and 8,249/9,000 lines.

## The round 4 fixes hold

- **A dialog's toasts outlived it (Opus 1):** this holds.
  - On `/?peek=NW-17`, "Copy key" shows "Copied NW-17". Esc twice closes the peek, and no toast is left in the DOM.
  - Opening NW-14's peek shows no toast.
  - The region still docks on a second opening. "Copy key" in NW-14's peek shows "Copied NW-14" inside the dialog's dock, at 268×42.
- **Mount-effect toast (Codex 1 and Opus nit 2), and the hold before effects (Codex 2):** both are fixed.
  - `Raising` raises through the provider's own store, which exists before any effect under it runs.
  - The layout effect sets `holding` before any passive effect under it can raise.
  - The fix brings a new problem with it, which is should-fix 1 below.
- **The picker's tip after Esc (Opus nit 4):** this holds on `/t/NW-17`, Owner.
  - Esc, a keyboard pick and a mouse pick each return focus to Owner with no tip. A mouse pick sets `data-tip-rest`.
  - Tab away and Shift+Tab back shows the "Owner" tip each time.
  - A click outside clears the rest.
- **The tokens check across shared selectors (Opus nit 3):** this holds.
  - It now groups by the normalised selector, so the colour blocks, and the two `[data-theme="mist"]` and `[data-theme="harbour"]` blocks, are covered.
  - It reports nothing on `tokens.css` as it stands, and the new test covers the shared colour selector.

## should-fix

1. **An effect that raises a toast and lists its raiser loops for ever, and the lint makes every such effect list it.** The lines are `web/src/kit/toast.tsx:60` and `:73-77`.
   - **Cause:** `Toast.useToastManager()` subscribes `Raising` to the toast list, because Base UI's hook reads `store.useState('toasts')`. So `Raising` renders again on every add and every removal. Each render makes a new `raise` and passes it as the `Raiser` value.
   - **The loop:** a consumer whose effect depends on `raise` runs again after each toast it raises, and raises again.
   - **Why it will be hit:** `react-hooks/exhaustive-deps` is an error in `web/eslint.config.js:77`. Any `useEffect` that calls `useToast()`'s result has to list it, so this is the only way the lint allows such an effect to be written.
   - **Regression:** at `9da9cb3` the raiser changed only when the frame or dialog rendered again, not on its own toasts.
   - **Measured:**
     - The probe puts `useEffect(() => { raise("Hello") }, [raise])` inside a full Dialog, capped at 40 raises.
     - In 1.5 s the effect ran 80 times and 39 toasts were added to the list.
     - Without the cap, it doesn't stop.
   - **Smaller cost of the same cause:** every `useToast()` consumer (`TicketMenu`, which is on the ticket page and in the peek) renders again on every toast anywhere under its region.
   - **Fix:** make `raise` stable. `store.addToast` is the same function on every render, so wrap `raise` in `useCallback(…, [add])` with `const { add } = Toast.useToastManager()`. `waiting` and `holding` are already refs. Alternatively, keep `add` in a ref and create `raise` once with `useState(() => …)`. One seam test would pin it: a child whose effect depends on its raiser shows one toast.

## Look

- No change from rounds 1 to 4.

Verdict: another round

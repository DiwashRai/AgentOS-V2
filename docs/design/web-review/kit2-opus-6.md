# Kit 2 review, Opus round 6 (`090db35..96698fe`)

## How I checked

- I read `96698fe` and the whole of `web/src/kit/toast.tsx` as it now stands.
- I checked that `add` really is stable in Base UI:
  - `useToastManager` returns `add: store.addToast` (`node_modules/@base-ui/react/toast/useToastManager.mjs:11-17`).
  - `store` comes from `useRefWithInit` in `ToastProvider.mjs:23`.
  - `addToast` is a class-field arrow in `store.mjs:113`.
  - So `add` keeps the same identity for the provider's lifetime. Prop changes (`timeout`, `limit`) are synced into the same store and don't replace it.
- I probed in Chrome with the app's own React and kit on port 5221, using an installed clock. The probe is `o6-probe.mjs` in my scratchpad. Vite was stopped afterwards, and nothing is listening on 5221.
- From `web/`, all of these are clean:
  - `tsc --noEmit`
  - `eslint . --max-warnings 0`
  - `stylelint "src/**/*.css"`
  - `prettier --check .`
  - `vitest` (17 tests)
  - `node tools/kit.mjs --check`: 43/45 components, 8,256/9,000 lines, at most 8 props.

## The round 5 fix holds

**The raiser changed with every toast (Opus and Codex should-fix 1):** this holds. The probe uses a `React.memo` child inside a full Dialog whose effect lists its raiser, `useEffect(() => raise("Hello", …), [raise])`. It counts the raiser's distinct identities, the child's renders and the effect's runs. The result was one identity, one render and one run at every step:

- **Mount:** one toast, "Hello / from an effect".
- **Two more raised by the captured function:** three toasts.
- **9 s on the clock:** all three timed out and were removed.
- **Question open and a raise:** nothing was shown.
- **Answered:** "Held" was shown.

The smaller cost is gone too: a `useToast()` consumer no longer renders again on toasts elsewhere in its region, because the context value no longer changes.

**The app:** on `/t/NW-17`, "Copy key" then "Copy link" from the bar's menu shows both toasts, and focus is back on "More on NW-17". There are no page errors. The only console error is the browser's `/favicon.ico` 404, which predates this change.

## nit

1. **The stability `useToast` now promises is a Base UI internal, and nothing pins it.** The lines are `web/src/kit/toast.tsx:61-63` and `:79-85`.
   - **The assumption:** `add`'s identity being stable is not in Base UI's documented API. It holds today only because of `useRefWithInit` and a class-field arrow.
   - **The risk:** if an upgrade made `useToastManager` hand back fresh methods per render, the round 5 loop would come back silently. Any effect that lists the raiser would raise once per toast.
   - **Why it isn't caught:** the fix's notes declined a Vitest seam test because there is no DOM. `just shots` already drives Chrome, though, so a single Playwright case there could pin it: a child whose effect lists its raiser shows one toast.
   - **Alternative:** hold `add` in a ref, and create `raise` once with `useState(() => …)`. That removes the dependency on Base UI's identity altogether.
   - **Why only a nit:** the behaviour is correct as it stands.
2. **A layout effect under a dialog that raises as its question opens isn't held.** The line is `web/src/kit/toast.tsx:74-78`.
   - **Cause:** React runs child layout effects before the parent's. So in the commit where `held` turns true, a child's `useLayoutEffect` still sees `holding.current === false`. Its toast is shown at once under the inert region, rather than queued.
   - **Scope:** passive effects (the round 4 case) are held correctly. Raising a toast from a layout effect is not a pattern anyone in the app uses or should use.
   - **Verdict:** negligible, and it is fine to leave.

## Look

- No change from rounds 1 to 5.

Verdict: done

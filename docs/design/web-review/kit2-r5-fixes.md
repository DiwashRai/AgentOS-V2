# Kit 2, round 5: what was fixed

`kit2-opus-5.md` and `kit2-codex-5.md` each had one should-fix, the same one, and nothing else.

- **The raiser changed with every toast:** `useToast()`'s function now comes from `useCallback` over Base UI's stable `add`, with the existing holding and waiting refs. An effect that lists it (as `react-hooks/exhaustive-deps` requires) runs once, not once per toast.
  - Probed at the seam with `k11-probe.mjs`: a child's effect `[raise]` raising on mount ran once and showed one toast.
  - The round 4 cases still hold: a toast raised as the question opens, and one from a callback taken before it, both wait and show once the question is answered.

No seam test was added to Vitest. The web suite runs in Node without a DOM, and adding one (jsdom) is a dependency change beyond this fix; the Chrome probe covers it.

Checks, 17 web tests, gates and 22 screenshots pass. Kit: 43/45 components.

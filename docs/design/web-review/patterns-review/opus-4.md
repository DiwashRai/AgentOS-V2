# Patterns layer review, round 4 (Opus)

**Verdict:** confirmed. Nothing is left open: no must-fix, no should-fix.

- **My earlier probes still fail as they should.**
  - `probe.mjs`: the root glob, `.pcss`, `.css` in a screen, `.js` with `.d.ts`, `G<T extends Tone>` and the dead-code credit.
  - `probe3.mjs`: the alias, `createElement`, the string-union tag and the class.
- **Round 3's two open findings are closed.**
  - The rest spread now reports "Plan.look handed unchanged to Checklist.look".
  - `const CELL = { text: Text }` fails as "holds the kit's Text outside a tag".
- **Codex's round-3 cases are closed (`probe4.mjs`).**
  - `memo(function M…)`, `forwardRef(…)` and `<Text {...props}>` each report a knob.
  - `const Label: (p: { name: string }) => ReactNode` counts 0 raw tags in `ts_measures.mjs`.
  - A screen behind its own `index.ts` barrel, and one the app loads with `import()`, are both credited: M, R, S, Label and Text show `e,f`.
- **No false positive on memo or forwardRef with React's real types.** `probe4.mjs`'s tree has no React types, so `<M>` and `<R>` came out as "may be a string" there. Re-run against `@types/react` (`probe5.mjs`), the resolved check reports nothing. The flag only appears when React's types fail to resolve, and then tsc fails too.
- **The real web passes from the repo root.** `node web/tools/kit.mjs --check`: kit, patterns and layers are all ok.

## Nit

1. **The "may be a string" check counts an `any` tag as a string** (`reach.mjs` `stringTag`). In a tree without React's types, the message blames the tag rather than the missing types. Fix: when a tag is `any`, say its type didn't resolve.

Probe scripts are in `C:\Users\diwash\AppData\Local\Temp\claude\C--code-AgentOS-V2-web\6d0fdab0-5ae2-4898-99b9-b3d2c29ccdad\scratchpad\` (`probe.mjs`, `probe3.mjs`, `probe4.mjs`, `probe5.mjs`); none wrote in the repo.

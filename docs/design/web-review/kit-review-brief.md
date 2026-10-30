# Review brief: the web kit as it stands (round 3 onwards)

Repo `C:\code\AgentOS-V2-web`, branch `web-restyle`, at HEAD. Read only: don't edit, commit or stash. Write your findings to the file named in your prompt.

## The aim

The owner wants the base kit (`web/src/kit`) to be really good before it is used for real. Review rounds continue until reviews return only negligible details. Judge the kit as a whole, not just the last diff.

The history so far:
- **The consolidation:** commits `f5ba539..f5c5943`, briefed in `consolidation-brief.md`.
- **Round 1:** `consolidation-*-1.md`, with the fixes in `209457e` and `consolidation-r1-fixes.md`.
- **Round 2:** `consolidation-*-2.md`, with the fixes in `1e873bd` and `consolidation-r2-fixes.md`.
- **Round 3:** `kit-opus-3.md` and `kit-codex-3.md` (the whole kit), with the fixes in `f05653f` and `ed55a8b` and `kit-r3-fixes.md`. The screenshot baselines were refreshed in `fb8f3e4`.
- **Round 4:** `kit-opus-4.md` and `kit-codex-4.md`, with the fixes in `13b95fc` and `kit-r4-fixes.md`.
- **Round 5:** `kit-opus-5.md` and `kit-codex-5.md`, with the fixes in `32afe00` and `kit-r5-fixes.md`.
- **Round 6:** `kit-opus-6.md` and `kit-codex-6.md`, with the fixes in `9e0670a` and `kit-r6-fixes.md`. Items marked as the owner's call are waiting on the owner: don't reopen them.
- **Round 7:** `kit-opus-7.md` and `kit-codex-7.md`, with the fixes in `ccc6f25` and `kit-r7-fixes.md`.
- **Round 8:** `kit-opus-8.md` (Codex's round 8 was cut off), with the fixes in `2eed3c1` and `kit-r8-fixes.md`.
- **Round 9:** `kit-opus-9.md` (Verdict: done), with its nits in `29fb1db` and `kit-r9-fixes.md`.

Check that the latest round's fixes hold: they were not reviewed. Where a fix was changed or declined, the latest `kit-r*-fixes.md` says why; judge the reason.

## Rules

- `AGENTS.md`:
  - layers, gates, and the kit ledger (every component, prop and variant has a reason);
  - the budget is the owner's checkpoint;
  - the core idea: bad states can't be written down.
- Only `web/src/kit` renders elements or holds CSS, and there are no raw values outside `tokens.css`.
- The app is static, on fixtures. W0 buttons do nothing.
- You may run the app: from `web/`, `node node_modules/vite/bin/vite.js --port <yours> --strictPort`, with Playwright from `web/node_modules`, channel `chrome`. Stop what you start, and never use ports 8000, 5173 or 5174.

## What to look for

- **Correctness and behaviour:** keyboard, focus, accessibility (names, descriptions, roles), and the states each component draws.
- **API design:**
  - types that let bad states be written;
  - props that duplicate each other;
  - components that should merge or split;
  - screen code hiding in the kit;
  - kit CSS that styles feature-supplied children by position or attribute.
- **Consistency across components:** sizes, tokens, focus rings, hover and disabled states.
- **Visual craft in both themes,** on the screens that use the kit.
- **Accuracy:** the ledger's reasons and the code's comments against the code. Also `web/tools/kit.mjs`'s correctness.
- **Dead code** and unused tokens.

## Format

Label each finding **must-fix**, **should-fix** or **nit**. Give `file:line`, the concrete failure, and the fix. Be harsh, but say plainly when what remains is negligible. End with one line: "Verdict: done" (only nits left that don't matter) or "Verdict: another round".

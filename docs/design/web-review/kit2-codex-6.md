# Codex review: kit additions, round 6

Reviewed `090db35..96698fe`, the Round 6 brief, the round 5 reports and `kit2-r5-fixes.md`. No must-fix, should-fix or nit findings remain to report. The change is ready to finish this review loop.

The round 5 fix holds. In a Chrome harness using the public `useToast()` hook inside a full Dialog, an effect with `[say]` ran exactly once and produced one notification. The callback retained one identity through notification creation, expiry, opening the confirmation question, answering it and subsequent expiry. Base UI 1.8.0 supplies the same `store.addToast` method throughout the provider's lifetime.

The queue still works: a passive effect running as the question opens and a callback captured beforehand both wait. After eight seconds held, neither had created a toast node, and F6 stayed inside the question. Answering displayed both notifications with their accessible names in Chrome's AX tree. F6 then entered the region; after moving focus out, both notifications expired normally. No browser errors occurred.

Regression checks also passed:

- Copy key writes `NW-17`, shows its toast and returns focus to the ticket menu trigger. Escape closes the menu and returns focus.
- Owner's tooltip stays quiet after Escape, then returns after Tab away and Shift+Tab back.
- Closing NW-17's peek clears its notification; opening NW-14's peek shows none of the previous notification.
- Space toggles the checkbox, ArrowDown selects the next radio, and ArrowDown on the Plan grip moves it after Implement. Labels and note descriptions remain separate.
- Light and dark kit screenshots show no further visual issues. The earlier API decisions remain appropriate.

TypeScript's in-memory diagnostic check passed against the committed toast source, with no emitted files. Stylelint and the kit gate passed. Direct assertions exercised all four token-test cases and the actual stylesheet; all passed. The attempted Node test-runner invocation was unsuitable for the Vitest test file, so it is not counted as a passing suite run.

During this review, another working-tree change appeared in `web/src/kit/toast.tsx`. I left it untouched and excluded it from this verdict: the browser intercepted only that module and served an in-memory compilation of its exact `96698fe` contents; TypeScript likewise read the committed version. The kit gate ran on the working tree and reported 43/45 components and 8,252/9,000 lines.

No source edits, commits or stashes. Only this report was written in the repository. Chrome was closed, Vite on port 5231 was stopped, and the port was confirmed closed.

Verdict: done

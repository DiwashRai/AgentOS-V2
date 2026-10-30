# Codex review: kit additions, round 4

Reviewed `090db35..9da9cb3`, the round 3 reports and `kit2-r3-fixes.md`. Locations below refer to `9da9cb3`. No source edits, commits or stashes.

1. **should-fix** - `web/src/kit/toast.tsx:64`, with `web/src/kit/toast.tsx:82`: the new external manager drops notifications raised by a descendant's initial effect. Base UI subscribes to this manager in the provider's passive effect, which runs after descendant effects. A child's call to `useToast()` therefore emits to an empty listener set at that point; nothing buffers or replays it. Reproduced in Chrome with a child that saves its initial raiser and calls it once from an effect with complete dependencies: the kit's toast list stays empty, while the same mount-effect notification through Base UI's provider context reaches its list. The later portal mount does not recover the dropped notification. Use the already-initialized provider context to deliver notifications, or buffer manager emissions until the provider is subscribed. This is a component-seam regression; today's fixture consumers raise from click handlers.

2. **should-fix** - `web/src/kit/toast.tsx:70`: the held flag is synchronized too late for notifications raised by descendant effects during the transition into a question. After `held` changes from false to true, the DOM region is already inert, but the child's effect runs before this parent effect updates `holding.current`. A notification from that effect takes `show()` instead of entering the queue, so it is inaccessible and its dismissal clock starts immediately. Reproduced with a descendant effect depending on both `held` and the current raiser: on the transition, "Effect held result" immediately appears in the provider's list under the inert region. Advance the injected clock eight seconds and release the hold: the list is empty and there is no announcement. Synchronize the held state before descendant notification effects can run, while preserving the latest-state behavior for callbacks captured earlier.

The intended queue path now works: a callback captured before the hold queues its result when invoked after the transition has settled. After eight seconds held, the result remains absent from the DOM; releasing the hold adds it to the dialog and Chrome's AX tree, with its own dismissal lifetime. A further eight seconds removes it. F6 stays in the confirmation question. The two findings above concern effect ordering around that path.

The other round 3 fixes hold:

- On the ticket page and peek, Tab out of the menu leaves no `data-tip-rest`; Shift+Tab back shows "More on NW-17", rather than the previous control's tooltip. Escape returns focus with rest set and no tooltip.
- The new tokens check finds the original cross-block `--h-check` collision, ignores commented declarations, and permits theme overrides. It reports no duplicates in the current tokens file and is wired into the kit gate.
- Checkbox Space, Radio arrows, and Sortable keyboard movement still work. The unchanged visual treatment and earlier API decisions need no further findings.

TypeScript's in-memory diagnostic check passed without emitting files. The kit gate passed at 43/45 components, 8,224/9,000 lines, with at most eight props. Chrome probes used port 5231 and in-memory harnesses; expiry checks used an injected clock and reduced motion. The working tree remained clean apart from this ignored review report.

Verdict: another round

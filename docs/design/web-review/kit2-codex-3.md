# Codex review: kit additions, round 3

Reviewed `090db35..212584d`, the round 2 reports, and `kit2-r2-fixes.md`. Locations below refer to `212584d`.

1. **should-fix** - `web/src/kit/toast.tsx:57`, with `web/src/kit/toast.tsx:70`: making the entire live region inert still loses held notifications for screen-reader users. The new version displays the toast visually, but `inert` removes the Notifications region and its contents from the accessibility tree, including its polite live announcement. The provider still starts the normal five-second dismissal timeout. Consequently a notification raised while the confirmation question is active can expire without ever becoming accessible.

   Reproduced with an in-memory composition of the existing full Dialog and useToast: show `ask`, invoke the child's notification callback, and inspect Chrome's AX tree. The toast is visibly present under an inert Notifications ancestor, but its title, "Held result", has no AX node. Advance the injected clock by six seconds: the public toast manager reports `transitionStatus: "ending"` and the toast has computed opacity zero. Answer the question: it is already expired. This retains round 2's lost-notification failure for people relying on the live announcement, despite fixing the visual case. No existing fixture screen exercises this combination, so it was tested at the component seam.

   Preserve both the announcement and the usable lifetime: defer held notifications until the question is answered, or keep an accessible announcer while disabling only the interactive toast surface. Keep F6 and Tab within the question.

The other round 2 fixes hold:

- Plan rows on `/t/NW-17` measure 36px in both themes. `--h-check` is 36px and the new `--h-box` is 14px.
- The new stylelint rule rejects a duplicate custom property in one declaration block and permits the same property in separate theme blocks. The complete CSS lint passes; the tokens override does not disable the new rule.
- At 1000 by 800, the peek's toast occupies x=380..648 and y=671.75..713.75, inside its panel and eight pixels above the foot. F6 and Tab reach it. Light and dark screenshots were inspected.
- Choosing the external Jira link closes the menu. Focus return after Escape suppresses the tooltip; Tab away and Shift+Tab back restore it.
- The composed-text fix removes descriptions equal to their displayed text on the four library lists, the workflow editor, Compact, My queue and All teams. Nonempty group tuples fix the separator edge case.
- Checkbox and Radio retain distinct names and descriptions, and Space/arrow-key behavior works in both themes. Earlier API decisions and the declined sidebar-description nit remain reasonable.

TypeScript, CSS lint and the kit gate passed. The kit is at 43/45 components and 8,198/9,000 lines, with at most eight props. Browser probes used Chrome on port 5231 and an injected clock for expiry; their harnesses stayed in memory and screenshots were saved outside the repository. No source edits, commits or stashes were made. A temporary type-check cache observed during verification was removed, restoring the clean working tree.

Verdict: another round

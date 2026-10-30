# Codex review: kit additions, round 5

Reviewed `090db35..1aca6e8`, including the round 4 reports and `kit2-r4-fixes.md`. Locations below refer to `1aca6e8`. No source edits, commits or stashes.

1. **should-fix** - `web/src/kit/toast.tsx:73`, with `web/src/kit/toast.tsx:60`: the returned notification function changes whenever the toast list changes, creating a feedback loop for an ordinary effect consumer. `Raising` subscribes to the list through `Toast.useToastManager()`, recreates `raise` on each render, and publishes that new function through context. This valid usage therefore repeatedly adds the same notification:

   ```tsx
   const say = useToast();
   useEffect(() => {
     say("One completed operation");
   }, [say]);
   ```

   Adding the toast changes the list, which changes `say`, which reruns the effect. Toast measurement and removal also change its identity. Reproduced in Chrome using only the public `useToast` hook in a child of a full Dialog: with emissions capped at four to keep the probe bounded, the effect ran ten times and four identical toasts were created. The consumer did not subscribe directly to the Base UI manager, and StrictMode was not enabled. Without the cap, the effect keeps generating notifications. Today's fixture callers notify on clicks, so they do not trigger this loop.

   Keep the raiser stable across toast-list updates. Memoize it using the provider's stable `add` method and the existing holding/waiting refs; depending on the whole manager object would retain the problem. Consumers should be able to include the returned action in effect dependencies without copying it into state or a ref.

The round 4 fixes hold in the browser:

- A child's captured mount-effect callback now shows "Mount result".
- The effect that runs as the question opens and a callback captured earlier both queue. Neither creates a toast DOM node while held. After eight seconds held, answering shows both results in the dialog and Chrome's AX tree; a further eight seconds removes them. F6 remains in the confirmation question.
- Closing NW-17's peek removes its "Copied NW-17" toast. Opening NW-14's peek shows no leftover notification.
- Escape from the Owner picker leaves its tooltip quiet. Tab away and Shift+Tab back show "Owner" again. Menu Tab/Shift+Tab still restores the correct tooltip.
- The token check detects repeated shared-colour tokens, permits different theme selectors, and passes on the current stylesheet.

TypeScript's in-memory diagnostic check and the kit gate passed. The kit is at 43/45 components and 8,249/9,000 lines, with at most eight props. Light and dark screenshots were inspected; no additional visual findings. Earlier API decisions remain appropriate.

Chrome probes used port 5231, in-memory harnesses, and an injected clock for notification lifetimes. Screenshots were saved outside the repository.

Verdict: another round

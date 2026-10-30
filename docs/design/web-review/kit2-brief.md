# Review brief: the kit's new pieces (tooltips, menus, toasts, checkboxes, radios)

Repo `C:\code\AgentOS-V2-web`, branch `web-restyle`, commit `6e058ac` (the change is `090db35..6e058ac`). Read only: don't edit, commit or stash. Write your findings to the file named in your prompt.

## What changed and why

The owner wants Tooltip, Menu, Toast, Checkbox and Radio in the kit, built on Base UI wherever it can carry them. The owner raised the budget to 45 components and 9,000 lines (see the `raises` entries in `web/src/kit/ledger.json`). The base kit before this change was reviewed for 9 rounds, ending "done" (`kit-review-done.md`). Review this change, and anything it breaks in what was there.

- **Tooltips:** `web/src/kit/tip.tsx`, internal and not a slot.
  - Every `title` the kit already took is now drawn through `Tip`, a detached Base UI tooltip trigger, in about 15 components.
  - Frame has one tooltip root, and each Dialog has its own, in the top layer.
  - Words that are not already the element's name go into `aria-description`. Tips marked `said` add nothing.
  - A tip marked `cut` (the element's own words) opens only while an ellipsis is showing.
  - Esc closes a tooltip and propagates (`details.cancel()` and `allowPropagation()`, then `handle.close()`), so one Esc still closes the menu or dialog under it.
  - With no frame around it (a component rendered on its own), `Tip` falls back to the native `title`.
- **Toasts:** `web/src/kit/toast.tsx`, internal and not a slot.
  - `useToast()` is exported. Frame and each Dialog hold their own Base UI `Toast.Provider` and region.
  - A dialog's region mounts after the first effect, so its portal finds the `<dialog>` element.
- **Menu** (`Menu.tsx`, a slot): a "…" button with a Base UI menu. Its items are something to run or a link; `"|"` is a separator.
  - Used by `features/shared/TicketMenu.tsx`: copy the link, copy the key, open in Jira, open the PR.
  - It sits on the ticket page's bar and in the peek's head.
- **Checkbox and Radio** (slots, Base UI): they have no screen yet; they're for the admin's intake settings in W8. The kit sheet shows them, and the ledger has `single` reasons.
- **Also new:** the Icon `more`, and the tokens `--h-check` and `--h-pip`.

## Rules

As in `kit-review-brief.md`, which sets out the layers, the gates, the ledger, the budget being the owner's checkpoint, the core idea, and no raw values outside `tokens.css`.

You may run the app: from `web/`, `node node_modules/vite/bin/vite.js --port <yours> --strictPort`, with Playwright from `web/node_modules`, channel `chrome`. Stop what you start, and never use ports 8000, 5173 or 5174. Opus uses port 5221 and Codex uses 5231.

## What to look for

- **Behaviour:**
  - tooltips on hover and on keyboard focus;
  - tooltips inside dialogs, and inside Select or Menu triggers;
  - Esc order across a tooltip, a menu, a peek, a full dialog and its question;
  - focus return after a menu;
  - toasts over a dialog, their announcement, F6 into them;
  - checkbox and radio keyboard and labelling.
- **Accessibility:**
  - is `aria-description` right everywhere a tip says something new?
  - is anything said twice, or lost compared with the old native title?
- **Regressions** in components that now wrap their element in `Tip`: refs (Chip's arrival flash), ids (Base UI sets the trigger's id), event handlers merged by Base UI's `render`, drag (Drag, Sortable's grip), and many triggers on one page.
- **API design:**
  - can a bad state be written?
  - should Tooltip or Toast be public components rather than internal?
  - should Menu take icons, a disabled or blocked item, or nested menus now, or is it right to wait?
- **Look:** compare against Linear's tooltips, menus, toasts and checkboxes: size, type, spacing, motion, both themes.

Label each finding must-fix, should-fix or nit, with `file:line` and a concrete failure. End with "Verdict: done" if there is nothing above nit.

## Round 2

Round 1's findings are in `kit2-opus-1.md` and `kit2-codex-1.md`; the fixes are in commits after `6e058ac` up to `195911b`, listed in `kit2-r1-fixes.md` (its 'Not taken' section says why two nits were left). Review at `195911b`: check the fixes hold, judge the declined ones, and look again at the whole change `090db35..195911b`.

## Round 3

Round 2's findings are in `kit2-opus-2.md` and `kit2-codex-2.md`; the fixes are in `212584d`, listed in `kit2-r2-fixes.md`. Review at `212584d`: check the fixes hold (the new stylelint rule included) and look again at the whole change `090db35..212584d`.

## Round 4

Round 3's findings are in `kit2-opus-3.md` and `kit2-codex-3.md`; the fixes are in `9da9cb3`, listed in `kit2-r3-fixes.md`. Review at `9da9cb3`: check the fixes hold (the toast queue and the new `tokens` gate check included) and look again at the whole change `090db35..9da9cb3`.

## Round 5

Round 4's findings are in `kit2-opus-4.md` and `kit2-codex-4.md`; the fixes are in `1aca6e8`, listed in `kit2-r4-fixes.md`. Review at `1aca6e8`: check the fixes hold and look again at the whole change `090db35..1aca6e8`. The owner wants this to end when only negligible details remain: say so with 'Verdict: done' if that is where it is.

## Round 6

Round 5's findings are in `kit2-opus-5.md` and `kit2-codex-5.md` (the same one); the fix is `96698fe`, in `kit2-r5-fixes.md`. Review at `96698fe`: check it holds and look again at the whole change `090db35..96698fe`. The owner wants this to end when only negligible details remain: say so with 'Verdict: done' if that is where it is.

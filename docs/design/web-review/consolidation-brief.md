# Review brief: the kit consolidation (5 commits)

Repo `C:\code\AgentOS-V2-web`, branch `web-restyle`. Review the five commits `7350393..f5c5943` (`git log 7350393..HEAD`, `git diff 7350393..HEAD`). Read only: don't edit, commit or stash. Write your findings to the file named in your prompt, as Markdown.

## What the change is

Codex's kit-budget review (`.review/kit-budget-codex.md`) found the web kit's 40-component budget spent partly on dead variants, duplicate implementations and hidden contracts. These commits act on it, one step per commit:

1. **Removed variants only the /kit sheet drew:** Stepper's glyph, Meter's strip, Row's edge, Button's lit and lg, Badge's status, large key and linked key, and Age's strong. Also, any TextArea can now pop out to the whole window (the owner's request for long context).
2. **Folded Menu into Select:** the theme picker is now a Select with a "side" look.
3. **One pill and one card:**
   - Chip is the one pill. Badge's tag and prop forms and Mark's chip are gone.
   - My queue's agent cards and All teams' tickets are Cards with an "agent" or "ticket" look, instead of Rows skinned from Row's CSS by child position.
   - Mark gains `still`.
4. **No hidden layout contracts:**
   - Page's side column is typed (`{look: "column" | "rail", content}`) instead of `:has([data-setting])`.
   - Head's level "rack" becomes "line", used by Intake.
   - Stack's `cols` is now 2 or 3, where it was 3 or 5.
   - Field gains a `search` form.
   - Sortable owns its handle gutter.
5. **Composer split out of Thread.**

## Rules that apply

- `AGENTS.md`: layers, gates, the kit ledger (every component, prop and variant has a reason), and the budget as the owner's checkpoint.
- Only `web/src/kit` renders elements or holds CSS.
- No raw values outside `tokens.css`.

The app is static, on fixtures. W0 buttons do nothing.

## What to look for

- **Regressions in behaviour or accessibility:**
  - keyboard and focus;
  - accessible names: the Card hit button, the theme Select trigger, Head line's fold, the Composer;
  - Swap inside Head line, which sets `data-row`.
- **Visual regressions.** You may run the app with `node node_modules/vite/bin/vite.js --port <5250-5260> --strictPort` from `web/` and screenshot it with Playwright from `web/node_modules`, using channel `chrome`. Stop what you start, and never use ports 8000, 5173 or 5174.
- **Hidden contracts still in place,** or new ones introduced: kit CSS that styles feature-supplied children by position or by attribute.
- **Ledger accuracy:** stale reasons, and reasons that no longer describe the code.
- **Anything the consolidation should have removed but didn't,** or code now dead.
- **Over-engineering or under-engineering** in the new APIs: Chip's 8 props, Card's 3 looks, Page.side.

Label each finding **must-fix**, **should-fix** or **nit**. Give `file:line`, the concrete failure, and the fix. Be harsh; praise is not useful.

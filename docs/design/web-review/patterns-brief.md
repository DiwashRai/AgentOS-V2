# Brief for an implementer on the patterns layer

You build some of the PRs in `.review/patterns-plan.md`, as settled by `.review/patterns-decisions.md` (it wins where they differ). Read both first, then AGENTS.md's rules apply as always.

- **Where:** `C:\code\AgentOS-V2-web`, branch `web-patterns` (already checked out). Never switch branches, never push, never merge, never `git stash` (bare or not), never `--no-verify`.
- **Shell:** PowerShell 7. Files are LF; write with the Edit/Write tools.
- **One commit per PR**, its message from a file in your scratchpad (`git commit -F <file>`), subject `web: <what>` (under 72 chars), a short body saying what and why, and exactly this one trailer (AGENTS.md: never a session link):
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```
- **Before each commit:** `just fmt`, then `just shots` (Playwright on its own port; never start a server on 8000, 5173 or 5174, and stop any server you start). If a screenshot changes and the plan/decisions say it should, rebaseline with `just shots --update-snapshots=all`, run `just shots` again, look at the changed images, and say in the message which changed and why. If one changes that shouldn't, fix the code. Remove `web/tsconfig.tsbuildinfo` if present, then `git add -A web tools docs AGENTS.md` (only what you changed) and commit. The hook runs `just check`, `just test`, `just gates`.
- **Never weaken a check or a gate** to pass (no new suppressions, no loosened lint, no raised baseline). A failing gate means simpler code. The kit budget's `raises` entries are the owner's: if a PR truly needs a kit raise, stop and report what and why instead.
- **Read like the code around it:** its comment voice (plain, the domain's words), naming and idioms. Tests: behaviour at the seams, one per behaviour (AGENTS.md › Tests).
- **A behaviour change updates the docs it contradicts** in the same commit.
- If the plan is wrong about the code (a file moved, a count is off, a step can't work as written), do the sensible thing that keeps its intent and say so in your report.
- **Report** (your final message, under 300 words): each commit's hash and subject, what changed on screen (if anything), anything you did differently from the plan and why, and anything left for a later PR.

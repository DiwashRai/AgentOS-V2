# Review: docs/tickets.md (Opus, 1)

## What's good
Most tickets are real vertical slices: one behaviour from the types through to an endpoint, kept in neighbouring packages (2, 5, 6, 10, 12, 13, 14, 25, 26, 39). The verify lines for 1, 18, 29, 33 and 37 are excellent: one run proves the slice. The order follows the module map from the bottom up, ticket 18 does what the brief asks of it, and leaving the web to its own track after 26 is right. The format is tight.

## Must-fix
1. **21 depends on 24.** 21 launches "the oldest unfenced queued run", but the fence only arrives in 24. Move the fence (setting it, and lifting it on a result or the deadline) into 21, or into a ticket of its own before 21.
2. **20 depends on 35.** "Only the owner may target their client" and its rule that the client must exist need client tokens, which arrive in 35. The client run-lock scopes (owner, title, description and type, plus context locked from the queue) are also missing. Move all of these to 35, next to "Dispatch defaults to my online client".
3. **18, 20, 21 and 24 depend on 37.** The deadline formula and the never-started rule read the start allowance, which is a `runner` setting. The route (runner or mailbox) is stored at dispatch and depends on the runner config. The `runner` area only arrives in 37. Bring the area forward to 20 or 21, with its start allowance and mode, and store the `Route` at dispatch (20 never mentions it).
4. **The mailbox worker is missing.** Writing the outbox instead of posting, with no `started` and no `output`, is in no ticket. 38 is server-side only.
5. **The protocol version rules are missing** (rules.md › Worker protocol). Nothing covers storing each job's version, failing other-version runs at startup (and cancelling their CI runs), or the fixed-shape refusal every worker reads as "run ended". These belong in 22, with the worker side in 28.
6. **The CI hardening is missing** (rules.md › Access). Add `::stop-commands::` before agents run, control characters stripped from the echo, and no `${{ }}` inside `run:`. 37's "workflow template" only implies the last one. Put them in 37 and 32.
7. **The `defaults` area is half done** (R49). 11 adds default items only. The default runtime, model and effort, the "prompt defaults", and changing the default workflow are in no ticket.

## Should-fix
- **Too big:**
  - 20 (dispatch rules, the run lock, request changes, two GETs, plus the run and job rows with their CHECKs): split into dispatch with the rows and GETs, then the lock and request changes.
  - 24 (cancel, fence and an 8-rule reaper): the fence moves to 21, and cancel and the reaper stay.
  - 38 (upload, workflow, loop, every mailbox rule, the sweep): split into hand-out and upload, then loop and replay with its rules.
  - 30: split clone and push safety from "context never committed" and hooks.
- **Horizontal:**
  - 42 checks every area at the end. Put each area's check and in-use refusal in the ticket that adds the area: repos in 3, runtimes in 13, defaults in 11.
  - 8 retrofits "every write so far". Move the stream to right after 2, so that each later ticket emits its own change.
- **Ownership:** architecture.md gives `PATCH /tickets/{key}` (edits) to `board`, but 7 lists only `tickets`. 35 changes dispatch's default but doesn't list `runs`. 37 adds a settings area but doesn't list `settings`.
- **Missing rules:**
  - workspace deleted after success or cancel and kept on failure; read-only flags cleared with retries; cleanup only of folders the client owns (33 or 36)
  - 409 `workspace_pinned` on PATCH; the mailbox pin set at hand-out (23, 38)
  - changed stage ids at launch fail the run (21)
  - a disabled user's client tokens stop at once (5 or 35)
  - commits as the user locally, the AgentOS identity only in CI; the gone/deadline check before every publish and API ref write (30, 34)
  - library DELETE 409 `in_use` for a default item or an agent a workflow uses (16)
  - the client's 30 s check-in and its transient-error backoff (36)
  - no links at any path component, regular files only (31)
- **R34:** nothing says how the run and ticket get the PR URL on the server (23).
- **Vague verify lines** on 27, 34, 39, 41 and 42 ("fast tests", "API tests"). Name the behaviours the way 4 and 13 do.

## Nits
- 6: the rule that a key prefix can't be a Jira key is checked when `space` is saved (3 or 42), not when a ticket is created.
- 22: the event limits leave out "1k kept for non-log events" and the 256 KiB and 8 KiB line caps.
- 40: Data Center search (v2 with a total) and `approximate-count` are missing.
- 34: a GitHub 401 is never "run gone", and redirects are refused.
- 12: promoting a workflow whose agent the library lacks should be 422.
- 32 or 33: turning off the console echo and the PR lookup is missing.
- 15 is thin; it could fold into 16.
- R14 sits only in the web track. Say so in the milestone table.

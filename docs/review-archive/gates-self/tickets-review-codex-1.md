# Review: docs/tickets.md (Codex, 1)

Reviewed the current 46 tickets against the `docs/api` context and merged skeleton.

The revision is substantially clearer: early change events, settings delivered with their features, launch-time snapshots, and separate client/mailbox work all help. Tickets 10–12 and 17 are coherent slices. Ticket 18 is the agreed states-first exception. Most verification lines name observable behaviour.

1. **must-fix — Ticket 20 excludes no-repo runs.** Its dispatch prerequisites unconditionally require a catalog repo and base branch. R8 and rules.md require these only in repo mode. Add a successful no-repo dispatch test alongside the repo refusals.

2. **must-fix — Ticket 19's API precedes its storage.** It exposes actions derived from run history before ticket 20 introduces run/job tables and reads. Keep the pure rules before dispatch, but put API wiring and history-based verification with ticket 20; otherwise ticket 19 needs a temporary empty-history implementation.

3. **must-fix — Tickets 27–28: complete, self-checking worker distribution.** Ticket 27 names only `agentos_worker`, whose existing entry point already imports `agentos_protocol`. Explicitly include both packages. Server-side hash refusal does not cover the required worker-side unpacked-file check; assign that to 28 and reuse it in 38/41. Verify an extracted archive starts under clean Python 3.11 outside the checkout, and tampering prevents job execution.

4. **must-fix — Tickets 44–45 lack service-account setup.** Intake and field discovery require an environment-configured Jira service account (rules.md › Jira). Neither ticket assigns that boundary/configuration work; ticket 5's transient sign-in credentials cannot supply it. Add fake-Jira verification that both operations use the service account.

5. **must-fix — Unassigned credential rules (22, 28, 35, 39).** Stripping AgentOS environment variables and masking CI output cover only part of R43. Assign secret-free job packages, keeping tokens off argv/logs, scrubbing before clipping and credential-free exception chains, and using the job's own `GITHUB_TOKEN` for runner repo access. Verify with sentinel credentials.

6. **must-fix — Unassigned file/git protections (9, 32, 33).** “ASCII names” omits the allowed-character whitelist; test ASCII punctuation outside it and `CON .txt`. Ticket 32 omits protected paths, `.agentos/` and build-junk exclusions. Ticket 31 should preserve the permitted `git@` SSH form rather than prohibit all userinfo. Ticket 33 preserves only `AGENTS.md`: every instructions item must preserve an existing same-name file; reject embedded block markers and test case-insensitive collisions/junctions.

7. **must-fix — Unassigned transport isolation (24, 40).** Add upload authentication before body consumption, unread rejection of oversized Content-Length, and handling unencodable filenames to 24. Add separate or ephemeral mailbox runner pools to 40; separate workflow jobs alone do not establish secret isolation.

8. **must-fix — Ticket 38 omits the client's credential env file.** This is explicitly required by rules.md › Client. Include loading it and supplying the intended agent/git environment without forwarding AgentOS credentials.

9. **should-fix — Important rules are only implied.** Make these acceptance cases explicit: unbound-job fence release (22); startup protocol-mismatch CI cancellation while retaining the fence (23); bounded alive/gone lists, idempotent gone retries, disconnect detection before the lease write lock (37–38); version-folder reuse, hash-race refusal and safe upgrade cleanup (38); maker/check session and final-round semantics, summarised agent output (34); helpers without Windows consoles and fallback tree killing (30).

10. **should-fix — Size and focus.** Split 8 into edit/resolve and conversation; 24 into result/pin, context sync, and output transfer; 34 into basic stage execution and loops/verdict repairs. Each has independently demonstrable behaviour; the current bundles strain “a few hundred lines.”

11. **should-fix — Verification and ownership clarity.** Replace 29's generic “tests” with lost-ack/resend and stop-reply scenarios; add gate/continue/retry and loop-exhaustion demonstrations to 34–35. In 24, pinning belongs in `runs`; in 42, Artifactory access belongs behind `targets`, since `journal` cannot import either `tickets` or `artifactory` directly. Link the separate web backlog: R14's screens and three-second freshness remain deferred, not verified by these tickets.

12. **nit — Clarify “prompt defaults”.** R49 uses that term; api.md and tickets 11/13/16 instead define default items, workflow, runtime, model and effort. State whether those fulfil it or whether editable prompt text is still required.


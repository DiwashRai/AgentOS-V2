# Review: docs/tickets.md (Codex, 2)

Reviewed the current 50 backend tickets and W1–W11 against the `docs/api` context, applying the Round 2 note.

The Round 1 must-fixes are resolved. No-repo dispatch and history-backed actions are in 21; complete archives and self-checking workers in 30–31; service-account setup in 48–49; credential protections in 2/23/31/43; path/git protections in 10/34–36; upload and mailbox isolation in 27/44; the client's env file in 42. Opus's fence, runner-setting, client-scope, mailbox-worker, protocol, CI-hardening and defaults findings also have owners now.

The splits make the backend easier to review: results, synced context and output each have a seam to test (25–27), as do stage execution and loop control (37–38). Rule references count as scope without repeating their full wording. R1–R50 have identifiable owners, including R14 in the web track. I found no required module-map violation: pinning goes through `runs`, and mailbox storage through `targets`.

1. **must-fix — Tickets 8–9 leave a forward dependency for resolve notes.** Ticket 8 promises resolve “with a note,” but ticket 9 introduces the conversation and posting that note. At ticket 8 there is nowhere to deliver the promised message. Either introduce the conversation first, or make ticket 8 resolve without a note and introduce the note parameter with ticket 9. Verify that resolving with a note produces a readable conversation message.

2. **should-fix — Ticket 32:** verify stop signals and publication permission here; demonstrate actual stage termination and offline pushing in 37/39, where those effects exist.

3. **should-fix — Tickets 37/39:** R32's summarised agent output remains implied by streamed logs; name a fake-CLI verification that structured output becomes readable progress events.

4. **should-fix — Tickets 50/W11:** assign the production web build/serving handoff; “the web joins later” currently has only implicit ownership in the API-integration ticket.

5. **should-fix — W1:** keep the initial kit limited to Intake's needs; tooling, themes, thirteen components and a screen make this the largest apparent web PR.

The web track otherwise follows sensible screen slices, with shared components introduced alongside their users. Fixtures make its ordering workable, and W11's cross-tab three-second check gives R14 a concrete completion test.


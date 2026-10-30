# Review: docs/tickets.md (Opus, 2)

## Round 1
All seven of Opus's round-1 must-fixes are resolved. The fence and launch are together in 23. The client-target rules are in 41. The `runner` area and the route are stored at dispatch (21), and 19's formulas take the start allowance as an input. The mailbox worker is 45. The protocol version is covered in 23, 24, 31, 32 and 42. The CI hardening is in 37 and 43. The `defaults` area is complete across 12, 14 and 17.

Codex's eight are resolved too: no-repo dispatch (21); the actions as pure rules in 20, wired to the API in 21; the worker's self-check (30, 31); credentials (23, 31, 43, 2); the path and git rules (10, 34, 35, 36); uploads and runner pools (27, 44); the env file (42). The one exception is the service account, below.

## What's good
The stream comes early (3), and each settings area arrives with its check, so the earlier horizontal retrofits are gone. 19 and 20 are clean pure tickets with a review gate. Most verify lines name observable behaviour, and 1, 10, 33, 35, 39 and 41 are exemplary. Every package list obeys the module map. 25 now routes the pin through `runs`, and 46 keeps Artifactory behind `targets`.

## Must-fix
1. **47 depends on 48.** Taking in from Jira needs a Jira credential. Sign-in credentials are never stored, and the only stored credential is the service account, which arrives in 48. Move "the Jira service account from the environment" into 47, or say which credential 47 uses.
2. **22 depends on 25 and 28.** Request changes needs a gated run, and "allowed after" needs a run that has ended. Neither can happen through the API until results (25) or cancel (28) exist. Move 22 after 25. The order 21 → 23 → 24 → 25 → lock and request changes works: nothing in 23–25 needs the lock, and the context lock is set at launch anyway.
3. **Rules in no ticket:**
   - The reaper's `clients` change when a client passes 60 s without a lease (rules.md › Runs and jobs reaper table; api.md › Live updates). Put it in 41.
   - A CI run counts as ended only when all its CI jobs are done (rules.md › Runs and jobs). Put it in 43, and it matters most in 46.
   - Environment names are case-insensitive on Windows (rules.md › Processes). Put it in 31's credential strip.

## Should-fix
- **Too big:**
  - 23 holds the package types, the build, the renders, placing context, the dispatcher, the fence, `Target` and `GET /package`. Split it into building the package (types, renders, placement, `GET /package`) and launching (the dispatcher, the fence, `Target`, launch failures).
  - 24: split the protocol-version rules and the limits out of binding and ingest.
  - 41: split client tokens (`people`) from the lease and client targets.
  - W1: split the tooling and the kit from the Intake screen.
- **32's verify claims later behaviour.** "A stop reply stops the stage" is 37's, and "still leads to a push" is 39's. In 32, prove only that the stop reaches the caller and that the client gives up in time for the deadline.
- **R46 on the worker end is only implied.** Ticket 10 says the table is "used by the worker later", but no worker ticket says it uses it. Name it in 36, and in 31's parser if 31 checks names.
- **Package lists:**
  - 12's 422 for a default naming a missing item, and 17's choice of default workflow, are cross-feature save checks, so they need `admin` (`settings` can't import `context`).
  - 28's stop reply and 44's token refusal touch `journal`.
  - 46 ends runs through `runs`.
- **40:** say what selects API publishing over `git push`: a `runner` field carried in the package.

## Nits
- 3: closing streams on disable or a return to pending can't be exercised until 6, which repeats it. Keep it in 6 only.
- 18's "changing the repo resets the base branch" is a field rule, so it belongs in 8.
- 23: say where the job token is minted. 24 only checks it.
- 23: say the package records the workflow version, which D18 needs and 20 reads.
- 28: name `POST /api/runs/{id}/cancel`.
- 29: say that `waiting_on` carries R12's seven attention values.
- 50's verify doesn't show that installs came only from Artifactory.
- Web: no ticket creates `count.mjs`, so put it in W1. W11 bundles sign-in, the SharedWorker stream and the swap from fixtures. It's fine as the last ticket, but it's large.
- The web track covers every R14 view and every R49 settings screen.

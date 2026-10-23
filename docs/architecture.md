# Architecture

## Parts

| Part | What |
|---|---|
| Server | Python 3.11+, FastAPI. The API, the run state machine, the dispatcher and the worker protocol. |
| Database | Turso, behind one boundary module, so SQLite can replace it without touching anything else. |
| Worker | Python 3.11, standard library only (runners have plain Python). Served by the server as one file. |
| Web | TypeScript and React on our own component kit, on fixtures until V2's API exists (plan step 10); its layers are under The web. |

## Core, shell, boundary

Every feature (tickets, context, runs, workers, ...) is split by role:

| Role | Holds | Rules |
|---|---|---|
| **Boundary** | Everything touching the outside: HTTP routes and their models, database rows, Jira, GitHub, git, processes, files, config | Input is parsed here, once, with a library (Pydantic on the server, a small parser in the worker), into our own types. Anything that doesn't fit is refused whole, saying why. |
| **Shell** | Use cases: open the transaction, load, call the core, apply its decision, save | Thin. Decisions belong in the core. A use case spanning features (dispatch, the journal) is its own module, not part of one feature's. |
| **Core** | Domain types and rules, pure | No I/O, no clock (time is passed in), no `Any`, no defensive checks: values are already the right type. |

- A feature is a package; its files say their role by name: `model.py` and `rules.py` (core), `service.py` (shell), `routes.py`, `rows.py` and adapters (boundary). The gates and import-linter read the same names.
- One module, one job, readable in a sitting: most a few hundred lines, none over 1,000.
- import-linter enforces the direction: boundary and shell may use the core; the core uses nothing else; features use each other only through their public modules; no cycles.

## States first

Bad states can't be written down. A value's type says which state it's in, so code matches on it once. The full set of states and transitions is designed before the API (plan step 2); the sketch:

```python
Run       = Queued(reason) | Launched(UnboundJob) | Running(BoundJob | HandedOutJob, started_at, stop: Stop | None)
          | Gated(started_at, at, EndedJob) | Succeeded(started_at, at, EndedJob)
          | Failed(why, Started(at, job) | NeverStarted(job | None))
          | Cancelled(Started(at, job) | NeverStarted(job | None))
Stop      = Cancel(at) | OverBudget(at)                         # asked, not yet acted on
Launch    = Starting(at) | Ref(provider_id)                     # runner and mailbox jobs: the CI run's reference
job       = LiveJob(deadline) | EndedJob(why)                   # after the run ended: the fence reads it
HandedOutJob: mailbox, no binding.  A job exists only inside its run, and its kind follows the run's route.
Route     = Runner(provider) | Mailbox(provider) | Client(owner)  # stored at dispatch
StageRun  = Pending | StageRunning(round) | StageDone(round, status, verdict | None)
Workspace = NoRepo | Repo(url, base_branch: BaseBranch | None, branch)
Stage     = AgentStage(agent, prompt, resume, check: AgentCheck(repairs) | None)
          | ShellStage(command, is_check)
Item      = an owned copy (version, copied_from: library version | None)
```

- An honest optional is fine where absence is one real case and is checked once (`owner: Person | None`). One `None` meaning several things, or fields only valid together, is a missing type.
- Each variant maps to rows with CHECK constraints tying columns to the status, so the database can't hold a state the types can't.
- One shape per entity, in the core. The boundary converts it to and from rows (its decoders) and API models (Pydantic, generated from or checked against the core type), so an entity never grows separate shapes per layer.

## Errors

- Expected outcomes are values: a refused dispatch, an invalid workflow, a rejected journal record. The API turns them into one error shape with a closed set of codes and every issue listed.
- Everything else propagates to one handler per entry point (the API, each background loop, the worker's main).
- Cleanup uses `with`; a `try` belongs at the boundary or inside a context manager.

## Database

- Schema in one file: CHECK constraints for every enum and state, foreign keys on, the one-active-run rule as a unique index.
- One typed decoder per query: the only place a raw row is read.
- The run state machine is a table of allowed transitions; every state write is a guarded update generated from it, in one transaction; one function ends a run.
- A contract test suite runs against the real database engine (transactions, concurrent dispatch and leases, constraints), so fast in-memory tests elsewhere don't hide engine behaviour.
- No migrations while one person uses it: a schema change means a fresh database.

## Events over timers

Anything that doesn't have to be a timeout isn't. Normal paths run on explicit messages: a result lifts the fence, a cancel rides the worker's next journal reply (runners take no inbound calls), a client reports a finished worker. Timers only detect a party that died and can't say so.

## The worker

- A package with the same three roles, enforced the same way; built into one deterministic file the server serves and hashes.
- Git, processes, HTTP and the clock sit behind small interfaces, so tests use fakes.
- Process handling for Windows and Linux (rules.md › Processes) is part of the process boundary from the first version.

## The API

- Designed from the requirements, as small as it can be: the resources and actions the requirements need, nothing per screen.
- Models are discriminated unions where the domain is; the web's types are generated from the server's schema.
- Writes that can conflict carry a version and get `stale_version` back.

## The web

The web (`web/src`) is layered like the server: every file under `src/` is in one of these layers, each layer imports only what its row names, and only the kit renders elements. Two checks hold it:

- `web/tools/kit.mjs` (`just gates`) is the one no spelling gets past. It resolves every import as the bundler would (a static import, a re-export, a type-only import, an `import.meta.glob`, its `/`-led patterns from the web's root, a lazy `import()`) and checks the file it reaches against the importer's allow-list, local modules by layer and packages by name (`web/tools/layers.mjs`). A file in no layer fails, a glob that matches nothing fails, and a lazy `import()` is the app's alone. Where a construct could carry code past the checks it is banned outright, not read more cleverly:
  - code under `src/` is `.ts` or `.tsx`: a `.js`, `.jsx`, `.mjs` or `.cjs` file, or a bare `.d.ts`, fails;
  - a stylesheet of any language Vite reads (`css`, `less`, `sass`, `scss`, `styl`, `stylus`, `pcss`, `postcss`, `sss`) exists, and is imported, only in the kit;
  - outside the kit nothing renders an element itself: an intrinsic tag, a tag whose type is or may be a string (`const Div: "div" | "span"`), any mention of `createElement` (an import, `React.createElement`, `const h = React.createElement`);
  - outside the kit a kit component is taken by its own name from the index: no renamed or default import of the kit, no re-export of it, no kit component held in a `const`; and no module is imported whole as a namespace (`import * as`);
  - the layers that draw (patterns, `features/`, the app, `main.tsx`) declare no class: a class component would skip the props checks.

  It also checks the kit's ledger and budget and the patterns' rules.
- ESLint (`web/eslint.config.js`) is the fast first line in the editor, mostly on how an import is spelled: each layer's bans by path, a path that climbs only at its start (so `../shared/../ticket` fails), the fixtures however their path ends (`fixtures.js`), a stylesheet of any of those languages outside the kit, no scoped package (TanStack Query, Base UI) in a pattern or a screen, no `import()` outside the app, and, as the gate, the bans above: an intrinsic tag, a tag typed as a string (a typed rule, so only names used as a tag), `createElement`, the kit by another name, a namespace import, a class where the layers draw, a JavaScript or declaration file under `src/`. The raw-tag gate (`just gates`) counts the elements in each of `features/` and `patterns/` against a cap of 0: an intrinsic tag, a tag bound in the file to what may be a string, any mention of `createElement`.
| Layer | Holds | May import | Draws |
|---|---|---|---|
| `domain/` | Pure rules and words over the API's types: a ticket's group, stage and line (`board`), plain English for ages, times and names (`format`), a workflow's edits and problems (`workflow`), a plan's steps (`plan`), where a read stands (`load`) | `api/types` | Nothing: no React |
| `domain/fixtures`, `library-fixtures` | The W0 data the fixture source serves | `domain`, `api/types` | Nothing |
| `api/` | The one data module: the `DataSource` (fixtures until the API exists; a read of one thing that isn't there rejects with its `NotFound`, any other failure is the server out of reach), the query hooks and `loadOf`, which turns a query into its data whenever it has some (a failed refetch keeps it) or else a `Load`, the types | `domain`, the fixtures, React, TanStack Query | Nothing |
| `kit/` | Every element and all the CSS. Each component, prop and variant has a reason in `kit/ledger.json`, within its budget | itself, React, React Router, Base UI | Elements |
| `patterns/` | A composition of the kit over domain values that two or more screens draw (a person's face and name, a ticket's key cell), one file per family, no index | the kit's index, `domain`, `api/types`, other patterns, React for local state | Kit components only |
| `features/shared/` | What two or more screens use that reads the session, the URL or the data: hooks (`useBoard`, `useSearch`, `useParam`, `useLibrary`), parts like `ActionButton`, and the editors two screens frame (`itemEditor/`, `workflowEditor/`) | as a screen, but no screen | as a screen |
| `features/<screen>/` | One screen: its view, its own model, its parts | the kit's index, patterns, `domain`, `api/queries`, `api/types`, `features/shared`, its own folder, React, React Router | Kit components and patterns |
| `app/` | The routes and the frame: the composition root | what a screen may, every screen, all of `api/`, TanStack Query; the only lazy `import()` | Kit components |
| `main.tsx` | The entry: mounts the app | `app/`, the kit's index, React, `react-dom/client` | Nothing of its own |

A test may also import the fixtures and Vitest.

- A pattern's props are domain values (`TicketRow`, `Person`, an ISO time) or `ReactNode` slots, never the kit's own types (`Tone`, `MarkKind`, a kit prop's type, a kit shape like `Fact`), and at most the kit's `budget.props`. The check reads every function a pattern exports (a lowercase one too; its first parameter's fields are its props, and a later parameter is checked the same) and follows the types through local aliases and interfaces, indexed access (`ChecklistProps["look"]`), `typeof` a kit component, a type parameter's constraint (`<T extends Tone>`) and nested shapes. A prop handed unchanged to a kit variant (`look={place}`, or spread onto a kit component with the props or their rest, `{...props}`, `{...rest}`; in a component wrapped in `memo` or `forwardRef` too) is a styling knob by another name and fails: the pattern chooses the variant from a domain word. Its data comes in as props: no query hooks, no router.
- Each pattern export, and each `features/shared` export, is used by at least two screens (the app's frame counts as one); one screen's part stays in that screen. A screen is credited by the names it uses, through what each one reaches in shared modules and other patterns, not with everything a module it touches imports; a type-only import, a `typeof` in a type and a re-export give no credit, and only code that runs counts: reach starts from what `main.tsx` and the app route to, so a screen's export nothing imports earns nothing. The kit's reuse count credits a screen the same way, with what the code it reaches draws.
- A screen doesn't import another screen, and `features/shared` imports no screen: what two screens share goes down a layer. The resolved check fails both, however the path is spelled.

Where a new piece goes:

1. Text or a rule over domain values, with no drawing: `domain/`.
2. A new look (an element, a variant, CSS): the kit, with its reason in the ledger, after trying the components it has.
3. The same kit composition over the same domain values on two screens: a pattern.
4. State, a URL parameter, the session or a data read that two screens share: `features/shared/`.
5. Anything only one screen draws: that screen's folder.

## Tests and gates

The test rules are in `AGENTS.md`. The gates come over from V1 with an empty baseline (the `code-gates` skill).

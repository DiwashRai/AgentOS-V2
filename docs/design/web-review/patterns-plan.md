# The patterns layer: plan

Line numbers as of 64c804d. The plan names components, not variants, since the kit cleanup is renaming those.

## 1. The layer

**Where:** `web/src/patterns/`, one file per family, **no index barrel**. Screens import each file by path, which keeps the reuse credit exact (a barrel would look like every screen imports every pattern).

**Layers:** kit, then patterns, then features (screens plus `features/shared`), then app. `domain` and `api/types` sit below patterns.

**Rules**
- A pattern draws kit components only: no raw tags, no CSS.
- It may import the kit index, `domain/*`, `api/types`, other patterns, and React for local UI state (a "+N" expand). It may not import `api/queries`, `features/**`, `app/**`, `react-router`, `react-dom` or `@base-ui/*`. Data comes in as props; hooks stay in `features/shared`.
- Props are domain values (`TicketRow`, `Person`, `Iso`) or `ReactNode` slots, never kit vocabularies (`MarkKind`, `Tone`, `ChecklistProps["look"]`, `Fact`). At most 8, the kit's `budget.props`.
- Each export is used by at least 2 screens, with no `single` escape hatch. Screens don't import screens, and neither does `features/shared`.

**What changes**

| Where | Change |
|---|---|
| `web/eslint.config.js` `LAYERS` | Add `"src/patterns/**": [CSS, KIT, {group: ["**/features/**", "**/app/**", "**/api/*", "!**/api/types", "react-router"]}]`. Ban `**/patterns/**` from the kit, domain and api. Add patterns to `SCREENS` so the `DRAWS` bans apply. |
| Same file, `src/features/**` block | `{regex: "^\\.\\./(?!shared/)[a-z]+/", message: "Screens don't import screens"}` (ESLint 9.39 has `regex`). It passes `../../kit` and also catches a re-export shim in shared. Lands last (PR 12). |
| `web/tools/kit.mjs` `screenUses()` | Today it credits one level into `shared`, `.tsx` paths only. Make it a memoized transitive closure over `shared/**` and `patterns/**` (`.ts` too), and scan `src/patterns`. Side effect: the ticket screen gets credit for `Drag`, `Drop`, `NumberField`, `Override`, `Compare`, `Sortable` and `Tabs`, which it already draws through the editors. |
| New `web/tools/patterns.mjs` plus a test, called from `check()` and `card()` | `patternProblems()`: (a) each export imported (directly or through shared) by at least 2 screens, counted per named import in `scan()`; (b) no prop type refers to a kit-declared symbol (`inKit`); (c) at most `budget.props`; (d) a `single` reason on a component 2 or more screens now draw. |
| `kit.mjs --card` | A **Patterns** table: each export, its screens, its prop count. |
| `tools/gates/measures.py:101`, `common.py` | Raw tags also counted for `web/src/patterns/` (cap 0), so the card shows it. |
| `AGENTS.md` Layout table | The `web/` row names `src/patterns`. |
| `docs/architecture.md` | No web section today. Add one: the layers, their imports, and where a new piece goes (section 3). |

## 2. The patterns, ranked by value (copies × drift)

| # | Pattern (file) | Replaces | Props | Screens |
|---|---|---|---|---|
| 1 | `LoadNotice` (`load.tsx`) | 15 copies: Compact:283-286, Teams:278-281, Queue:304-307, Intake:287-293, Peek:119-121, TicketView:194-196, RunsTab:283, ContextTab:116, WorkflowTab:93-98, WorkflowOverlay:156-158, itemOverlay:261-263, WorkflowView:39-41, AgentView:20-22, FileView:20-21, SkillView:19-20 | `load: Load` (`{kind:"pending"} \| {kind:"unreachable"; message} \| {kind:"missing"}`, in `domain/load.ts`; `loadOf(query)` in `api/queries.ts`), `noun: string`, `id?: string` | 8 |
| 2 | `Who` (`who.tsx`) | 6 copies: Teams:119-128, Intake:89-94, library/list:203-209, RunsTab:254-262, Peek:76-83, library/side:146-150 | `who: Someone` (`person{name, seed} \| run{id, ticket?} \| nobody`, built in `domain/format.ts` from `Person \| null`, `Author`, a Jira assignee), `place: "cell" \| "fact" \| "starter"` | teams, intake, library, ticket, peek |
| 3 | `KeyCell`, `TicketTitle`, `lineEnd`, `LINE_END` (`ticketLine.tsx`) | compact/TicketLine (all of it), Teams TitleCell:78-94 | `t: TicketRow`, `me: Person \| null` (`lineEnd` also takes `now`) | compact, queue, teams |
| 4 | `AgeCell` (`age.tsx`) | TicketLine:106-108, Teams:158-160, Intake:102-104, list:210-212, RunsTab:168-170 (its own `ago()`:116) | `since: Iso`, `now: number`, `what: "updated" \| "started" \| "changed"` (sets the tooltip) | compact, queue, teams, intake, library, ticket |
| 5 | `TicketHead`, `PlanSection`, `TalkSection` (`ticketHead.tsx`, absorbing ticket/properties, now, plan, talk) | Peek:61-89, TicketView:67-83 | `TicketHead`: `t`, `me`, `now`, `plan`, `place: "page" \| "peek"`, `owner?: ReactNode` (the page's picker, else `Who`), `stop: ReactNode` (the Cancel, since `ActionButton` reads the session). `PlanSection`: `plan`, `place` (not `ChecklistProps["look"]`) | ticket, peek |
| 6 | `RunNow` (`runNow.tsx`) | Queue:90-119, Teams StateCell:99-116 (only its run part) | `run: Attention` running or queued, `since: Iso`, `now: number` | queue, teams |
| 7 | `StageFace`, `StageSummary`, `LoopFoot` (`stage.tsx`) | workflow/StageCard, Editor:105-142 | as today, except `LastRun.kind` becomes `"live" \| "failed" \| "done"` instead of a `MarkKind` | workflow, ticket |
| 8 | `KeyHints` (`hints.tsx`) | Compact:248-257, list:45-62 | `keys: readonly {key: string; does: string}[]` | compact, library |
| 9 | `Tally` (`tally.tsx`) | Compact:259-265 and 273-278, Teams:57-61 | `n: number`, `one: string`, `many?: string` | compact, teams |

**Drift to settle** ("owner" marks your call; the rest is my recommendation):
- **1, bugs:** RunsTab and ContextTab have no error branch, so an error shows "No runs yet" or an empty table. By-id reads say "not found" for any error.
- **1, wording (owner):** "Loading {id or the noun}", "Can't reach the server · {message}", "No {noun} {id}". Today it's "Ticket not found · NW-404" vs "No agent x", so `ticket-missing` changes.
- **2, empty word (owner):** "Nobody" (Teams, Peek, RunsTab) or "Unassigned" (Intake, the owner picker). I recommend "Unassigned".
- **2, the rest:** first name in a cell, full name in a fact or sentence. Gap 4. Always `beside` (list.tsx leaves it off, so the name is read twice). A dashed ring in a cell, no face in a fact (RunsTab's bare face becomes dashed). A run author gets the agents glyph (list.tsx shows none).
- **3:** take TicketLine's `said()`. The tooltip is always "title · after", with `after` from `nowLine` inside. Owner: recede queued titles in Compact too (this drops `recede`)? Show running rows' age as "now" (Compact does, Queue doesn't)? Add the priority bars to Teams' key?
- **4, age wording (owner):** "3h 10m" in cells with the full form in the tooltip, or Intake's "1h ago"? One `ago()` in `domain/format` replaces Intake's `ageLabel`, RunsTab's `ago` and the two "just now"s (workflow/who, ItemEditor).
- **6 (owner):** the agent's name at weight 500 (Queue) or plain (Teams)? The meter goes at the column's end (Teams' layout), with one tooltip: "agent · run #n · step x/y".
- **5, 7, 8, 9:** no visual drift. `place` covers h1 vs h2, and `Tally` uses `plural()`.

## 3. What is not a pattern

| Candidate | Where it goes | Why |
|---|---|---|
| URL-bound filter chips (Compact:218-238, Teams:265-271, Queue:292-298, Intake:268-273) | `useParam(key)` hook in `features/shared` | It's state, not drawing. **Bug:** Intake's filter uses `?q=`, which `useSearch` also uses. |
| "Open peek" (Teams:242-248, Queue:274-280, Compact:101-112, Peek:147-153) | `usePeek()` in `features/shared` | A URL hook. |
| "✓ words" (itemOverlay:91-97, LibraryPanel:101-107, StageCard:28-37) | Stays | Three meanings, and its props would be kit vocabularies. If it ever becomes one thing, that's a kit `Text` change. |
| Glyph plus title for runs and stages (RunsTab:156-164, 204-209, StageCard:145-149) | Stays, or moves with `stage.tsx` | Different domain types; a generic one would take `MarkKind`. |
| Author words (`workflow/who`, `authorName`, ContextTab:25, list:201), `clock` (RunsTab:83, `threadMessage`), a description's lead and rest (Peek:69, TicketView:68, 93) | `domain/format.ts` | Pure text. The drift is "Run #42" vs "run #42", and first vs full name. |
| compact/model's `nowLine`, `parseFilter`, `pills`, `stageWord`, `sourceText` | `domain/board.ts` | Pure, used by 3 screens. |
| workflow/model; `Library`, `agentOf`, `refName`, `runtimeName` | `domain/workflow.ts`; `useLibrary` goes to `features/shared/library.ts` | Rules go down a layer, the hook goes to shared. |
| The item editor tree (ItemEditor, conflict, content, draft, merge, nav, side, useEditor…) and the workflow editor (Editor, StageFields, LibraryPanel, draft) | `features/shared/itemEditor/`, `features/shared/workflowEditor/` | Hundreds of lines with hooks: a shared screen part, not a pattern. |
| `ActionButton` | Stays in shared | It reads the session's role. |
| Library list parts, Teams' per-stage Legend | Stay | One screen each. |

## 4. The 16 cross-screen imports

| From → to | Goes to |
|---|---|
| peek → ticket/now, plan, properties, talk (4) | `patterns/ticketHead.tsx` (#5) |
| queue → compact/model `nowLine` | `domain/board.ts` |
| queue → compact/TicketLine | `patterns/ticketLine.tsx` (#3) |
| teams → compact/model `parseFilter`, `pills`, `stageWord` | `domain/board.ts` |
| ticket/itemOverlay → library/ItemEditor | `features/shared/itemEditor/` |
| ticket/itemOverlay → library/side `Fact` | `Fact` imported from the kit (side.tsx's `export type { Fact }` goes) |
| ticket/WorkflowOverlay → workflow/draft, Editor (2) | `features/shared/workflowEditor/` |
| ticket/WorkflowOverlay, WorkflowTab → workflow/who (2) | `domain/format.ts` |
| ticket/WorkflowTab → workflow/Editor `LoopFoot`, StageCard (2) | `patterns/stage.tsx` (#7) |
| ticket/WorkflowTab → workflow/library | `domain/workflow.ts` plus `features/shared/library.ts` |

## 5. PRs, in order

| PR | What | Size | Screenshots |
|---|---|---|---|
| 0 | Shots for the states touched: `/library/agents`, `/t/NW-17?tab=runs`, `context`, `workflow` | ~10 plus baselines | New baselines |
| 1 | The layer: ESLint layers (no ban yet), `kit.mjs` transitive credit, `patterns.mjs` plus tests, the card, raw tags, AGENTS.md, architecture.md, stale `single`s | ~250 | None |
| 2 | Pure moves to `domain/board`, `format`, `workflow`; wording unchanged | ~200 moved | None |
| 3 | `LoadNotice` plus `loadOf`; the RunsTab and ContextTab error fix | ~120 | `ticket-missing` wording |
| 4 | `Who` | ~120 | all-teams, intake, my-queue-peek, skill-editor, library, runs: the empty word, names, the run glyph |
| 5 | `ticketLine.tsx` | ~150 moved | compact-*: queued titles; all-teams: priority bars, if settled |
| 6 | `AgeCell` plus `ago()` | ~80 | intake and runs, if the wording is settled |
| 7 | `RunNow` | ~80 | my-queue or all-teams: the agent's weight |
| 8 | `ticketHead.tsx` | ~200 moved | None |
| 9 | `useParam`, `usePeek`; the Intake `?q` fix | ~80 | None |
| 10 | `stage.tsx`, `domain/workflow`, `useLibrary` to shared | ~250 moved | None |
| 11 | `git mv` the editors into `features/shared/` | Moves | None |
| 12 | The cross-screen ban; final docs | ~15 | None |
| 13 | `KeyHints`, `Tally` (optional) | ~60 | None |

Each PR's card includes the new Patterns table. A move PR's diff should be paths only.

## 6. Open questions for the owner

1. The product calls in section 2: the empty word, the loading and error wording, the age wording, queued titles, running rows' age, Teams' priority bars, the agent's weight.
2. Should `api/` tell "missing" from "unreachable"? That needs a typed not-found error from the `DataSource`.
3. Where the editors live: `features/shared/<editor>/`, or a `features/editors/` that isn't a screen?
4. Should patterns get a budget of their own (say 1,500 lines) so they don't grow into a second kit? I recommend no ledger: the 2-screen and domain-props checks are the control.
5. Stale `single` reasons: fail the check, or only list them on the card?
6. Can Intake's filter move to `?only=`? That changes its URLs.

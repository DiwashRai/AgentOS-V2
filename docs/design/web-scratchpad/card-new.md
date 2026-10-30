### Kit

44/45 components, 8460 lines (4005 TS, 4075 CSS, 380 tokens), budget 9000.

**New in the ledger** (0)


**Reuse** (screens drawing each component)

| Component | Screens | |
|---|---|---|
| `Age` | 6 (compact, intake, library, queue, teams, ticket) |  |
| `Avatar` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `Badge` | 6 (compact, intake, library, queue, teams, ticket) |  |
| `Button` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `Card` | 2 (ticket, workflow) |  |
| `Checkbox` | 0 () | single: No screen yet: the admin's intake settings (taking a query's issues in by themselves) are its first, with Settings in W8; the kit sheet shows it. |
| `Checklist` | 3 (compact, peek, ticket) |  |
| `Chip` | 3 (library, ticket, workflow) |  |
| `Compare` | 2 (library, ticket) |  |
| `Composer` | 2 (peek, ticket) |  |
| `Dialog` | 2 (peek, ticket) |  |
| `Drag` | 2 (ticket, workflow) |  |
| `Drop` | 2 (ticket, workflow) |  |
| `Facts` | 3 (library, peek, ticket) |  |
| `Field` | 3 (library, ticket, workflow) |  |
| `FormRow` | 2 (ticket, workflow) |  |
| `Frame` | 1 (app) | single: There is one frame: the app's layout draws it around every screen. |
| `Head` | 6 (compact, intake, library, queue, teams, ticket) |  |
| `Icon` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `Lane` | 2 (ticket, workflow) |  |
| `Mark` | 7 (compact, intake, peek, queue, teams, ticket, workflow) |  |
| `Menu` | 3 (library, peek, ticket) |  |
| `Meter` | 4 (peek, queue, teams, ticket) |  |
| `Notice` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `NumberField` | 2 (ticket, workflow) |  |
| `Override` | 2 (ticket, workflow) |  |
| `Page` | 7 (compact, intake, library, queue, teams, ticket, workflow) |  |
| `Radio` | 0 () | single: No screen yet: the admin's intake setting (ask first, or take everything in) is its first, with Settings in W8; the kit sheet shows it. |
| `Row` | 6 (compact, intake, library, queue, teams, ticket) |  |
| `Section` | 3 (peek, ticket, workflow) |  |
| `Segmented` | 6 (compact, intake, queue, teams, ticket, workflow) |  |
| `Select` | 3 (library, ticket, workflow) |  |
| `Sortable` | 2 (library, ticket) |  |
| `Stack` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `Stepper` | 3 (compact, peek, ticket) |  |
| `Strip` | 1 (library) | single: The library's Workflows list; a ticket's Workflow tab or a workflow picker can take it up. |
| `Surface` | 4 (compact, intake, queue, teams) |  |
| `Swap` | 1 (intake) | single: Intake's Take in today; My queue's and Compact's row actions can take it up. |
| `Table` | 6 (compact, intake, library, queue, teams, ticket) |  |
| `Tabs` | 2 (ticket, workflow) |  |
| `Text` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) |  |
| `TextArea` | 3 (library, ticket, workflow) |  |
| `Thread` | 3 (compact, peek, ticket) |  |
| `Toggle` | 2 (ticket, workflow) |  |

**Variants chosen by 0 or 1 screens** (41; a literal, or an expression's literal type)

- `Avatar.size=lg`: no screen chooses it (a default, the kit's own, or only passed through)
- `Badge.kind=count`: no screen chooses it (a default, the kit's own, or only passed through)
- `Badge.kind=you`: no screen chooses it (a default, the kit's own, or only passed through)
- `Badge.size=sm`: compact
- `Badge.size=md`: no screen chooses it (a default, the kit's own, or only passed through)
- `Card.look=stage`: no screen chooses it (a default, the kit's own, or only passed through)
- `Card.look=ticket`: no screen chooses it (a default, the kit's own, or only passed through)
- `Checklist.look=bare`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=line`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=pill`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=neutral`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=indigo`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=teal`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.tone=amber`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.dot=you`: ticket
- `Chip.dot=blocked`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.dot=neutral`: no screen chooses it (a default, the kit's own, or only passed through)
- `Chip.dot=live`: no screen chooses it (a default, the kit's own, or only passed through)
- `Dialog.look=side`: no screen chooses it (a default, the kit's own, or only passed through)
- `Dialog.look=full`: ticket
- `Head.level=line`: intake
- `Head.level=group`: no screen chooses it (a default, the kit's own, or only passed through)
- `Notice.align=item`: intake
- `Row.kind=line`: library
- `Row.kind=item`: ticket
- `Row.kind=rack`: ticket
- `Select.look=side`: no screen chooses it (a default, the kit's own, or only passed through)
- `Select.look=chip`: no screen chooses it (a default, the kit's own, or only passed through)
- `Stack.dir=column`: no screen chooses it (a default, the kit's own, or only passed through)
- `Stack.align=start`: ticket
- `Stack.align=baseline`: no screen chooses it (a default, the kit's own, or only passed through)
- `Stack.align=end`: no screen chooses it (a default, the kit's own, or only passed through)
- `Stack.cols=3`: no screen chooses it (a default, the kit's own, or only passed through)
- `Surface.level=recess`: no screen chooses it (a default, the kit's own, or only passed through)
- `Surface.level=sheet`: no screen chooses it (a default, the kit's own, or only passed through)
- `Surface.level=float`: no screen chooses it (a default, the kit's own, or only passed through)
- `Text.variant=heading`: no screen chooses it (a default, the kit's own, or only passed through)
- `Text.truncate=2`: no screen chooses it (a default, the kit's own, or only passed through)
- `Text.as=span`: no screen chooses it (a default, the kit's own, or only passed through)
- `Thread.look=full`: no screen chooses it (a default, the kit's own, or only passed through)
- `Thread.look=last`: compact

### Patterns

18 exports (2+ screens each).

| Pattern | Screens | Props |
|---|---|---|
| `patterns/age.tsx AgeCell` | 6 (compact, intake, library, queue, teams, ticket) | 3 |
| `patterns/age.tsx TicketAge` | 3 (compact, queue, teams) | 2 |
| `patterns/hints.tsx KeyHints` | 2 (compact, library) | 1 |
| `patterns/load.tsx LoadNotice` | 8 (compact, intake, library, peek, queue, teams, ticket, workflow) | 3 |
| `patterns/runNow.tsx RunNow` | 2 (queue, teams) | 3 |
| `patterns/stage.tsx StageFace` | 2 (ticket, workflow) | 2 |
| `patterns/stage.tsx StageChips` | 2 (ticket, workflow) | 4 |
| `patterns/stage.tsx StageSummary` | 2 (ticket, workflow) | 6 |
| `patterns/stage.tsx LoopFoot` | 2 (ticket, workflow) | 4 |
| `patterns/tally.tsx Tally` | 2 (compact, teams) | 3 |
| `patterns/ticketHead.tsx TicketHead` | 2 (peek, ticket) | 7 |
| `patterns/ticketHead.tsx PlanSection` | 2 (peek, ticket) | 2 |
| `patterns/ticketHead.tsx TalkSection` | 2 (peek, ticket) | 2 |
| `patterns/ticketLine.tsx KeyCell` | 3 (compact, queue, teams) | 1 |
| `patterns/ticketLine.tsx TicketTitle` | 3 (compact, queue, teams) | 2 |
| `patterns/ticketLine.tsx lineEnd` | 2 (compact, queue) | 3 |
| `patterns/ticketLine.tsx LINE_END` | 2 (compact, queue) | - |
| `patterns/who.tsx Who` | 7 (compact, intake, library, peek, queue, teams, ticket) | 2 |

// The one data module's seam: everything the screens read, one method per endpoint. W0 serves it
// from fixtures (fixtureSource.ts); W11 swaps in the HTTP client and the `/changes` stream.
import type {
  Agent,
  Intake,
  Item,
  ItemSummary,
  LibraryFile,
  Message,
  Page,
  Person,
  Run,
  Runtime,
  Session,
  Settings,
  Skill,
  TemplateField,
  Ticket,
  TicketRow,
  TicketWorkflow,
  Workflow,
} from "./types";

export interface DataSource {
  /** The clock, injected so screens and screenshots agree on "now". */
  now(): number;
  session(): Promise<Session>;
  settings(): Promise<Settings>;
  people(): Promise<readonly Person[]>;
  /** `GET /api/tickets` (open and done; closed hidden). */
  tickets(): Promise<Page<TicketRow>>;
  ticket(key: string): Promise<Ticket>;
  messages(key: string): Promise<Page<Message>>;
  /** `GET /api/tickets/{key}/runs`: newest first. */
  runs(key: string): Promise<Page<Run>>;
  /** `GET /api/tickets/{key}/items`: the ticket's context items. */
  items(key: string): Promise<Page<ItemSummary>>;
  /** `GET /api/tickets/{key}/items/{name}`: one item with its content and history. */
  item(key: string, name: string): Promise<Item>;
  /** `GET /api/tickets/{key}/workflow`: the ticket's copy of its workflow. */
  ticketWorkflow(key: string): Promise<TicketWorkflow>;
  /** The content of the ticket's plan item (`TASKS.md`), or null when it has none. */
  plan(key: string): Promise<string | null>;
  intake(): Promise<Intake>;
  /** The library (R19): `GET /api/library/{workflows,agents,skills,files}[/{id}]`. */
  workflows(): Promise<Page<Workflow>>;
  workflow(id: string): Promise<Workflow>;
  agents(): Promise<Page<Agent>>;
  agent(id: string): Promise<Agent>;
  skills(): Promise<Page<Skill>>;
  skill(id: string): Promise<Skill>;
  /** `AGENTS.md` first. */
  files(): Promise<Page<LibraryFile>>;
  file(id: string): Promise<LibraryFile>;
  /** The runtimes (R22), for the runtime and model pickers. */
  runtimes(): Promise<readonly Runtime[]>;
  /** The ticket fields a prompt may name (R28). */
  templateFields(): Promise<readonly TemplateField[]>;
}

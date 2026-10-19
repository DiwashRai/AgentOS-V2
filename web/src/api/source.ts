// The one data module's seam: everything the screens read, one method per endpoint. W0 serves it
// from fixtures (fixtureSource.ts); W11 swaps in the HTTP client and the `/changes` stream.
import type {
  Intake,
  ItemSummary,
  Message,
  Page,
  Person,
  Run,
  Session,
  Settings,
  Ticket,
  TicketRow,
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
  runs(key: string): Promise<Page<Run>>;
  /** `GET /api/tickets/{key}/items`: the ticket's context items. */
  items(key: string): Promise<Page<ItemSummary>>;
  /** The content of the ticket's plan item (`TASKS.md`), or null when it has none. */
  plan(key: string): Promise<string | null>;
  intake(): Promise<Intake>;
}

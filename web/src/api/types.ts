// V2's API shapes (docs/api.md), written by hand until W11 generates them from the server's
// OpenAPI. Where api.md names a field it is used as named; where it is silent (the board fields'
// inner shape, intake's answer) the shape follows V1's and is listed in the W0 report.
export type Iso = string;

export type Role = "pending" | "viewer" | "writer" | "admin";

export interface Person {
  id: number;
  name: string;
  avatar: string | null;
  role: Role;
  disabled: boolean;
}

export interface Session {
  auth_mode: "cloud" | "datacenter" | "dev";
  jira_url: string | null;
  me: Person | null;
}

export interface Space {
  name: string;
  key_prefix: string;
  jira_projects: readonly string[];
}

export interface Repo {
  name: string;
  url: string;
  default_branch: string;
}

export interface Area<T> {
  value: T;
  version: number;
  updated_at: Iso;
  updated_by: Person;
}

/** `GET /api/settings`: the areas the screens read so far. */
export interface Settings {
  space: Area<Space>;
  repos: Area<readonly Repo[]>;
}

export type TicketType = "feature" | "bug" | "improvement" | "task";
export type Priority = "high" | "normal" | "low";
export type TicketState = "open" | "done" | "closed";
export type Phase = "inbox" | "plan" | "build" | "verify" | "review" | "done";
export type StepState = "pending" | "current" | "done" | "failed" | "stale" | "skipped";

export interface Round {
  n: number;
  of: number;
}

export interface Gate {
  label: string;
  short: string;
  state: "pending" | "passed" | "waiting";
}

export interface RailStep {
  stage_id: string;
  name: string;
  state: StepState;
  gate: Gate | null;
  /** A loop stage's round in the latest run; null outside a loop. */
  round: Round | null;
}

export interface Progress {
  done: number;
  total: number;
}

/** What the ticket waits on, the same for every viewer (R12, R13): the web turns `waiting` into
 *  "needs you" when `on` is the viewer or nobody. */
export type Attention =
  | { kind: "waiting"; on: Person | null; ask: string }
  | { kind: "running"; run_id: number; agent: string; step: string; progress: Progress | null }
  | { kind: "queued"; run_id: number }
  | { kind: "blocked"; reason: string }
  | { kind: "inbox" }
  | { kind: "done"; outcome: "completed" | "abandoned"; note: string | null };

export type ActionId =
  | "dispatch"
  | "continue"
  | "retry"
  | "run_from"
  | "request_changes"
  | "cancel"
  | "resolve"
  | "reopen";

/** An action the ticket offers now, with why it's blocked (R11), the role it needs, and whether
 *  only the owner may target their own client; the web applies those two for the viewer. */
export interface Action {
  id: ActionId;
  blocked: string | null;
  role: Role;
  owner_only: boolean;
}

/** Where a ticket came from, when it was taken in from Jira. */
export interface JiraLink {
  ref: string;
  url: string;
}

/** A board row: `GET /api/tickets`. */
export interface TicketRow {
  key: string;
  title: string;
  type: TicketType;
  priority: Priority;
  state: TicketState;
  owner: Person | null;
  repo: string | null;
  source: JiraLink | null;
  phase: Phase;
  rail: readonly RailStep[];
  attention: Attention;
  since: Iso;
  now: string;
  plan: Progress | null;
  messages: number;
  actions: readonly Action[];
  updated_at: Iso;
}

export interface BaseBranch {
  name: string;
  from: "hand" | "jira" | "repo";
}

/** `GET /api/tickets/{key}`. */
export interface Ticket extends TicketRow {
  description: string;
  labels: readonly string[];
  base_branch: BaseBranch | null;
  workflow: { name: string; version: number };
  active_run: number | null;
  pr_url: string | null;
  created_at: Iso;
}

export type ItemKind = "instructions" | "skill" | "agent" | "note" | "plan" | "file" | "workflow";

/** A context item as `GET {scope}/items` lists it: no content. */
export interface ItemSummary {
  name: string;
  kind: ItemKind;
  writable: boolean;
  version: number;
  updated_at: Iso;
}

export interface Message {
  id: number;
  author: Person;
  body: string;
  created_at: Iso;
}

export type RunState =
  "queued" | "launched" | "running" | "gated" | "succeeded" | "failed" | "cancelled";

export interface StageRun {
  stage_id: string;
  name: string;
  round: number;
  state: "pending" | "running" | "done" | "failed";
  verdict: "pass" | "fail" | null;
}

export interface Run {
  id: number;
  state: RunState;
  route: "runner" | "mailbox" | "client";
  by: Person | null;
  created_at: Iso;
  started_at: Iso | null;
  ended_at: Iso | null;
  reason: string | null;
  stages: readonly StageRun[];
}

export interface IntakeIssue {
  key: string;
  title: string;
  type: TicketType;
  priority: Priority;
  status: string;
  assignee: string | null;
  updated_at: Iso;
  url: string;
}

export type IntakeResult =
  | { kind: "issues"; total: number; issues: readonly IntakeIssue[] }
  | { kind: "error"; message: string };

export interface IntakeQuery {
  name: string;
  jql: string;
  result: IntakeResult;
}

/** `GET /api/jira/intake`. */
export interface Intake {
  checked_at: Iso;
  queries: readonly IntakeQuery[];
}

export interface Page<T> {
  items: readonly T[];
  next: string | null;
}

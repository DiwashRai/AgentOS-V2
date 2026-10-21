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

/** Who wrote a version (R17): a person, or a ticket's run. */
export type Author =
  { kind: "person"; person: Person } | { kind: "run"; run_id: number; ticket: string };

/** One version of an item, newest first in a history (R17). */
export interface Version {
  version: number;
  at: Iso;
  by: Author;
}

/** A library item named in a list (an agent a workflow uses, a workflow an item is in). */
export interface LibraryRef {
  id: string;
  name: string;
}

/** How a ticket's copy differs from the library item it came from, both ways (R19): the
 *  library's newer version when it moved on since the copy (null: it hasn't), and whether the
 *  ticket changed its copy. Neither: the copy is in step. */
export interface Drift {
  library: number | null;
  changed: boolean;
}

/** Where a ticket's item came from: its own (notes, the plan), or a copy of a library item at a
 *  version, with its drift. */
export type Origin =
  { kind: "own" } | { kind: "copy"; of: LibraryRef; version: number; drift: Drift };

/** A context item as `GET {scope}/items` lists it: no content. */
export interface ItemSummary {
  name: string;
  kind: ItemKind;
  writable: boolean;
  version: number;
  updated_at: Iso;
  updated_by: Author;
  origin: Origin;
}

/** A named block of `AGENTS.md` (R16): blocks are edited and reordered one by one. */
export interface Block {
  name: string;
  text: string;
}

/** An agent's settings (R23): its instructions (markdown) and how it runs. */
export interface AgentSettings {
  instructions: string;
  runtime: RuntimeId;
  model: string;
  effort: Effort;
}

/** An item's content: plain text (a skill's SKILL.md, a note, the plan, a file), `AGENTS.md`'s
 *  named blocks, or an agent's settings. */
export type ItemBody =
  | { kind: "text"; text: string }
  | { kind: "blocks"; blocks: readonly Block[] }
  | { kind: "agent"; agent: AgentSettings };

/** `GET /api/tickets/{key}/items/{name}`: one of a ticket's items with its content. */
export interface Item extends ItemSummary {
  body: ItemBody;
  /** The latest few versions, newest first. */
  history: readonly Version[];
}

// ---------------------------------------------------------------- the library (R19-R28)

export type RuntimeId = "claude-code" | "copilot-cli";
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

/** A runtime (R22) as the pickers need it: its name and the models it offers. */
export interface Runtime {
  id: RuntimeId;
  name: string;
  models: readonly string[];
}

/** The workflows and tickets that use a library item. */
export interface UsedBy {
  workflows: readonly LibraryRef[];
  tickets: readonly string[];
}

/** What every library item carries: its id (the URL's), version, who changed it last and when,
 *  and the latest few versions, newest first. */
interface Versioned {
  id: string;
  version: number;
  updated_at: Iso;
  updated_by: Author;
  history: readonly Version[];
}

/** `GET /api/library/agents/{id}`: an agent (R23). */
export interface Agent extends Versioned, AgentSettings {
  name: string;
  description: string;
  used_by: UsedBy;
}

/** `GET /api/library/skills/{id}`: a skill (R16, R20), its `SKILL.md` at `path`. */
export interface Skill extends Versioned {
  name: string;
  description: string;
  path: string;
  content: string;
  used_by: UsedBy;
}

/** `GET /api/library/files/{id}`: a file, a path and its content; `AGENTS.md` as named blocks. */
export interface LibraryFile extends Versioned {
  path: string;
  /** Its size in bytes. */
  size: number;
  body: { kind: "text"; text: string } | { kind: "blocks"; blocks: readonly Block[] };
  used_by: UsedBy;
}

export type StagePhase = "plan" | "build" | "verify" | "review";

/** A gate after a stage: its name, and the short form the rail draws. */
export interface StageGate {
  label: string;
  short: string;
}

/** Skills and files by library id: the workflow's (every stage gets them) or a stage's own. */
export interface ContextRefs {
  skills: readonly string[];
  files: readonly string[];
}

/** What every stage has (R24). */
interface StageCommon {
  id: string;
  name: string;
  phase: StagePhase;
  enabled: boolean;
  needs_repo: boolean;
  timeout_min: number;
  /** The gate after it, or none. */
  gate: StageGate | null;
  /** Skills and files this stage adds to the workflow's. */
  context: ContextRefs;
}

/** Repairs of an invalid verdict, by resuming the session (R26). */
export type Repairs = 0 | 1 | 2 | 3;

/** An agent stage (R23, R24): its agent with any overrides, its prompt (a template over ticket
 *  fields, R28), whether it resumes its session, and, as a check, its verdict repairs. */
export interface AgentStage extends StageCommon {
  kind: "agent";
  agent: string;
  overrides: { runtime: RuntimeId | null; model: string | null; effort: Effort | null };
  prompt: string;
  resume: boolean;
  check: { repairs: Repairs } | null;
}

/** A shell stage: a command, which as a check passes on exit 0. */
export interface ShellStage extends StageCommon {
  kind: "shell";
  command: string;
  check: boolean;
}

export type Stage = AgentStage | ShellStage;

/** A block of consecutive stages, `first` to `last` by stage id, repeated up to `rounds` (at most
 *  5) until its checks pass (R25). */
export interface Loop {
  first: string;
  last: string;
  rounds: number;
}

/** A workflow's content, the same in the library and in a ticket's copy. */
export interface WorkflowBody {
  stages: readonly Stage[];
  loops: readonly Loop[];
  /** The skills and files every stage gets. */
  context: ContextRefs;
}

/** `GET /api/library/workflows/{id}`: a library workflow (R24-R27). */
export interface Workflow extends Versioned, WorkflowBody {
  name: string;
  description: string;
  is_default: boolean;
  /** The tickets whose copy came from it. */
  tickets: readonly string[];
}

/** `GET /api/tickets/{key}/workflow`: the ticket's own copy (R27): the library workflow and
 *  version it came from, its drift, and its own version (the one a save checks). */
export interface TicketWorkflow extends WorkflowBody {
  ticket: string;
  name: string;
  from: { id: string; version: number };
  drift: Drift;
  version: number;
  updated_at: Iso;
  updated_by: Author;
}

/** A ticket field a prompt can name (R28), as `{{ name }}`. */
export interface TemplateField {
  name: string;
  about: string;
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
  /** The stage it was dispatched from (by stage id). */
  from_stage: string;
  /** Its time budget in minutes. */
  budget_min: number;
  created_at: Iso;
  started_at: Iso | null;
  ended_at: Iso | null;
  reason: string | null;
  /** Its stage runs in order, a loop's stages once per round. */
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

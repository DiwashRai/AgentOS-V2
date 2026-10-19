// Invented fixtures for W0's static screens, shaped like V2's API (api/types.ts). Every name, key
// and repo is made up. Times are relative to one fixed instant, NOW, so screenshots are stable.
// Excluded from the gates' measures (tools/gates/ts_measures.py) as data, not logic.
import type {
  Attention,
  Gate,
  Intake,
  IntakeIssue,
  ItemSummary,
  Message,
  Person,
  Phase,
  Progress,
  RailStep,
  Run,
  Settings,
  StepState,
  Ticket,
  TicketRow,
} from "../api/types";

export const NOW = Date.parse("2026-10-14T10:00:00Z");
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

const person = (id: number, name: string, role: Person["role"] = "writer"): Person => ({
  id,
  name,
  avatar: null,
  role,
  disabled: false,
});

export const ADA = person(1, "Ada Park", "admin");
export const BEA = person(2, "Bea Quinn");
export const CY = person(3, "Cy Rowe");
export const DEE = person(4, "Dee Sato");
export const ELI = person(5, "Eli Tran", "viewer");
export const PEOPLE = [ADA, BEA, CY, DEE, ELI];

export const SETTINGS: Settings = {
  space: {
    value: { name: "Northwind", key_prefix: "NW", jira_projects: ["SUP", "PLAT"] },
    version: 3,
    updated_at: ago(60 * 24 * 5),
    updated_by: ADA,
  },
  repos: {
    value: [
      {
        name: "northwind/web",
        url: "https://github.example/northwind/web",
        default_branch: "main",
      },
      {
        name: "northwind/api",
        url: "https://github.example/northwind/api",
        default_branch: "main",
      },
      {
        name: "northwind/runner",
        url: "https://github.example/northwind/runner",
        default_branch: "main",
      },
      {
        name: "northwind/docs",
        url: "https://github.example/northwind/docs",
        default_branch: "main",
      },
    ],
    version: 2,
    updated_at: ago(60 * 24 * 9),
    updated_by: ADA,
  },
};

// ---------------------------------------------------------------- the Standard workflow's rail
// Plan (gated) → Implement → Lint (off) → Review (a loop of up to 3 rounds) → Open a PR.
const STAGES = ["plan", "implement", "lint", "review", "pr"] as const;
type StageId = (typeof STAGES)[number];
const NAMES: Record<StageId, string> = {
  plan: "Plan",
  implement: "Implement",
  lint: "Lint",
  review: "Review",
  pr: "Open a PR",
};

interface RailAt {
  /** The stage the ticket is at; stages before it are done, after it pending. */
  at: StageId | "inbox" | "done";
  state?: StepState;
  /** The plan sign-off gate: passed once past it, waiting while parked at it. */
  gate?: Gate["state"];
  round?: number;
}

function rail({ at, state = "current", gate, round }: RailAt): RailStep[] {
  const idx = at === "inbox" ? -1 : at === "done" ? STAGES.length : STAGES.indexOf(at);
  return STAGES.map((id, i): RailStep => {
    let s: StepState = i < idx ? "done" : i === idx ? state : "pending";
    if (id === "lint") s = "skipped";
    const g: Gate["state"] = gate ?? (idx > 0 ? "passed" : "pending");
    return {
      stage_id: id,
      name: NAMES[id],
      state: s,
      gate: id === "plan" ? { label: "Plan sign-off", short: "Sign-off", state: g } : null,
      round: id === "review" && round !== undefined ? { n: round, of: 3 } : null,
    };
  });
}

const PHASE: Record<RailAt["at"], Phase> = {
  inbox: "inbox",
  plan: "plan",
  implement: "build",
  lint: "verify",
  review: "review",
  pr: "review",
  done: "done",
};

const ACTIONS: Record<Attention["kind"], TicketRow["actions"]> = {
  waiting: [
    { id: "request_changes", blocked: null, role: "writer", owner_only: false },
    { id: "continue", blocked: null, role: "writer", owner_only: false },
  ],
  running: [{ id: "cancel", blocked: null, role: "writer", owner_only: false }],
  queued: [{ id: "cancel", blocked: null, role: "writer", owner_only: false }],
  blocked: [{ id: "retry", blocked: null, role: "writer", owner_only: false }],
  inbox: [{ id: "dispatch", blocked: null, role: "writer", owner_only: false }],
  done: [{ id: "reopen", blocked: null, role: "writer", owner_only: false }],
};

interface Row {
  key: string;
  title: string;
  type?: TicketRow["type"];
  priority?: TicketRow["priority"];
  owner: Person | null;
  repo: string | null;
  jira?: boolean;
  rail: RailAt;
  attention: Attention;
  since: number;
  now: string;
  plan?: Progress;
  messages?: number;
}

function row(r: Row): TicketRow {
  const done = r.attention.kind === "done";
  return {
    key: r.key,
    title: r.title,
    type: r.type ?? "feature",
    priority: r.priority ?? "normal",
    state: done ? "done" : "open",
    owner: r.owner,
    repo: r.repo,
    source: r.jira
      ? { ref: r.key, url: `https://northwind.atlassian.example/browse/${r.key}` }
      : null,
    phase: PHASE[r.rail.at],
    rail: rail(r.rail),
    attention: r.attention,
    since: ago(r.since),
    now: r.now,
    plan: r.plan ?? null,
    messages: r.messages ?? 0,
    actions: ACTIONS[r.attention.kind],
    updated_at: ago(r.since),
  };
}

const WEB = "northwind/web";
const API = "northwind/api";
const RUNNER = "northwind/runner";
const DOCS = "northwind/docs";

export const TICKETS: TicketRow[] = [
  // needs you: parked on Ada, or on nobody
  row({
    key: "NW-14",
    title: "Show the run's stage on the board",
    owner: ADA,
    repo: WEB,
    rail: { at: "plan", state: "done", gate: "waiting" },
    attention: { kind: "waiting", on: ADA, ask: "Plan sign-off" },
    since: 190,
    now: "Plan v2 is ready: 6 steps, touches the board query",
    plan: { done: 0, total: 6 },
    messages: 3,
  }),
  row({
    key: "SUP-231",
    title: "Retry button does nothing offline",
    type: "bug",
    priority: "high",
    owner: null,
    repo: WEB,
    jira: true,
    rail: { at: "review", state: "done", round: 1 },
    attention: { kind: "waiting", on: null, ask: "Your move" },
    since: 40,
    now: "+41 −6 across 2 files, checks green",
    plan: { done: 4, total: 4 },
    messages: 1,
  }),
  row({
    key: "NW-22",
    title: "Keep the board's filters in the URL",
    type: "improvement",
    owner: ADA,
    repo: WEB,
    rail: { at: "implement", state: "failed" },
    attention: { kind: "blocked", reason: "Tests failed on main" },
    since: 52,
    now: "Implement failed: 3 tests failing in board.spec",
    plan: { done: 2, total: 5 },
  }),
  // waiting on someone else
  row({
    key: "NW-9",
    title: "Batch webhook deliveries",
    owner: BEA,
    repo: API,
    rail: { at: "plan", state: "done", gate: "waiting" },
    attention: { kind: "waiting", on: BEA, ask: "Plan sign-off" },
    since: 95,
    now: "Plan ready: 4 steps",
    plan: { done: 0, total: 4 },
  }),
  row({
    key: "NW-11",
    title: "Throttle noisy webhook retries",
    type: "improvement",
    owner: CY,
    repo: API,
    rail: { at: "review", state: "done", round: 2 },
    attention: { kind: "waiting", on: CY, ask: "Review the change" },
    since: 210,
    now: "+88 −40 across 3 files",
    plan: { done: 3, total: 3 },
  }),
  // running
  row({
    key: "NW-17",
    title: "Preserve comments after a refresh",
    type: "bug",
    priority: "high",
    owner: ADA,
    repo: WEB,
    rail: { at: "implement" },
    attention: {
      kind: "running",
      run_id: 42,
      agent: "Builder",
      step: "Running the API test suite",
      progress: { done: 2, total: 5 },
    },
    since: 6,
    now: "Running the API test suite",
    plan: { done: 2, total: 5 },
    messages: 4,
  }),
  row({
    key: "NW-19",
    title: "Show live run progress on the board",
    owner: ADA,
    repo: WEB,
    rail: { at: "plan" },
    attention: {
      kind: "running",
      run_id: 44,
      agent: "Planner",
      step: "Costing two options",
      progress: { done: 1, total: 4 },
    },
    since: 3,
    now: "Costing two options",
  }),
  row({
    key: "NW-20",
    title: "Paginate the runs endpoint",
    owner: BEA,
    repo: API,
    rail: { at: "implement" },
    attention: {
      kind: "running",
      run_id: 45,
      agent: "Builder",
      step: "Migrating the cursor index",
      progress: { done: 2, total: 6 },
    },
    since: 12,
    now: "Migrating the cursor index",
    plan: { done: 1, total: 6 },
  }),
  row({
    key: "NW-21",
    title: "Cancel a run from the ticket header",
    owner: CY,
    repo: RUNNER,
    rail: { at: "review", round: 2 },
    attention: {
      kind: "running",
      run_id: 46,
      agent: "Reviewer",
      step: "Reading the cancel path",
      progress: { done: 1, total: 3 },
    },
    since: 8,
    now: "Reading the cancel path",
    plan: { done: 5, total: 5 },
  }),
  // queued
  row({
    key: "NW-23",
    title: "Nightly runs rollup table",
    owner: ADA,
    repo: API,
    rail: { at: "implement", state: "pending" },
    attention: { kind: "queued", run_id: 47 },
    since: 2,
    now: "Waiting for a runner",
    plan: { done: 0, total: 3 },
  }),
  row({
    key: "NW-24",
    title: "Dedupe ingest events",
    owner: DEE,
    repo: RUNNER,
    rail: { at: "plan", state: "pending" },
    attention: { kind: "queued", run_id: 48 },
    since: 4,
    now: "Waiting for a runner",
  }),
  // blocked, someone else's
  row({
    key: "NW-12",
    title: "Partition the runs table by month",
    type: "task",
    owner: DEE,
    repo: API,
    rail: { at: "implement", state: "failed" },
    attention: { kind: "blocked", reason: "Migration lock held by the nightly backfill" },
    since: 300,
    now: "Implement failed: lock timeout after 10 min",
    plan: { done: 1, total: 4 },
  }),
  // inbox
  row({
    key: "NW-25",
    title: "Acceptance criteria for saved views",
    owner: ADA,
    repo: WEB,
    rail: { at: "inbox" },
    attention: { kind: "inbox" },
    since: 30,
    now: "Nobody on it yet",
  }),
  row({
    key: "SUP-240",
    title: "Export billing to CSV",
    type: "feature",
    priority: "low",
    owner: null,
    repo: API,
    jira: true,
    rail: { at: "inbox" },
    attention: { kind: "inbox" },
    since: 75,
    now: "Nobody on it yet",
  }),
  row({
    key: "NW-26",
    title: "Write the runner's upgrade notes",
    type: "task",
    owner: CY,
    repo: DOCS,
    rail: { at: "inbox" },
    attention: { kind: "inbox" },
    since: 160,
    now: "Nobody on it yet",
  }),
  // done
  row({
    key: "NW-5",
    title: "Open a ticket straight from a link",
    owner: ADA,
    repo: WEB,
    rail: { at: "done" },
    attention: { kind: "done", outcome: "completed", note: "PR #187 merged" },
    since: 60 * 26,
    now: "Merged",
    plan: { done: 4, total: 4 },
  }),
  row({
    key: "NW-6",
    title: "Drain runners before an image bump",
    type: "task",
    owner: ADA,
    repo: RUNNER,
    rail: { at: "done" },
    attention: { kind: "done", outcome: "completed", note: "PR #229 merged" },
    since: 60 * 50,
    now: "Merged",
    plan: { done: 3, total: 3 },
  }),
  row({
    key: "NW-7",
    title: "Offline queue for comments",
    owner: ADA,
    repo: WEB,
    rail: { at: "review", state: "done" },
    attention: { kind: "done", outcome: "abandoned", note: "Superseded by NW-17" },
    since: 60 * 70,
    now: "Closed",
  }),
];

const rowOf = (key: string): TicketRow => {
  const found = TICKETS.find((t) => t.key === key);
  if (!found) throw new Error(`no fixture ticket ${key}`);
  return found;
};

// ---------------------------------------------------------------- the ticket page's ticket
const DESCRIPTIONS: Record<string, string> = {
  "NW-17":
    "When a reviewer refreshes the ticket page, messages sent in the last few seconds disappear until the next sync. The client posts optimistically, but the API only writes comments when the sync worker runs.\n\nPersist each comment on write, return the stored record, and have the client swap its optimistic message for the server's copy using client_id. Jira mirroring stays with the sync worker.",
  "NW-14":
    "The board shows a ticket's phase but not which stage of its workflow it is in. Show the stage glyph on every row, with the gate it is parked at.",
};

export function ticketOf(key: string): Ticket {
  const r = rowOf(key);
  return {
    ...r,
    description: DESCRIPTIONS[key] ?? "No description yet.",
    labels: key === "NW-17" ? ["comments", "sync"] : [],
    base_branch: r.repo ? { name: "main", from: "repo" } : null,
    workflow: { name: "Standard", version: 3 },
    active_run: r.attention.kind === "running" ? r.attention.run_id : null,
    pr_url: null,
    created_at: ago(60 * 30),
  };
}

export const PLANS: Record<string, string> = {
  "NW-17": [
    "## Server",
    "- [x] Write comments on POST, not on sync",
    "- [x] Return the stored record with its client_id",
    "- [ ] Update POST /comments and its test suite",
    "## Client",
    "- [ ] Swap the optimistic message for the server's copy",
    "- [ ] Keep Jira mirroring with the sync worker",
  ].join("\n"),
  "NW-14": [
    "- [ ] Read the rail in the board query",
    "- [ ] Draw the glyph on Compact rows",
    "- [ ] Draw the glyph on My queue rows",
    "- [ ] Show the parked gate's short name",
    "- [ ] Test the glyph in both themes",
    "- [ ] Update the board docs",
  ].join("\n"),
};

const message = (id: number, author: Person, minutes: number, body: string): Message => ({
  id,
  author,
  body,
  created_at: ago(minutes),
});

export const MESSAGES: Record<string, Message[]> = {
  "NW-17": [
    message(1, BEA, 58, "Reproduced on staging. Send, refresh within five seconds, and it's gone."),
    message(2, BEA, 57, "It comes back once the sync worker wakes up."),
    message(3, CY, 31, "Keep the client id on the record so the swap doesn't flicker?"),
    message(4, ADA, 12, "Yes. Builder is on it now; the plan has it as step 2."),
  ],
  "NW-14": [
    message(5, DEE, 200, "Can the glyph show rounds for the review loop too?"),
    message(6, ADA, 195, "Yes, as 2/3 beside the label."),
    message(7, BEA, 192, "Plan looks right to me."),
  ],
  "SUP-231": [message(8, ELI, 45, "Support says this hits every offline user on mobile.")],
};

export const RUNS: Record<string, Run[]> = {
  "NW-17": [
    {
      id: 42,
      state: "running",
      route: "runner",
      by: ADA,
      created_at: ago(7),
      started_at: ago(6),
      ended_at: null,
      reason: null,
      stages: [
        { stage_id: "implement", name: "Implement", round: 1, state: "running", verdict: null },
        { stage_id: "review", name: "Review", round: 1, state: "pending", verdict: null },
        { stage_id: "pr", name: "Open a PR", round: 1, state: "pending", verdict: null },
      ],
    },
    {
      id: 39,
      state: "gated",
      route: "runner",
      by: ADA,
      created_at: ago(140),
      started_at: ago(139),
      ended_at: ago(118),
      reason: null,
      stages: [{ stage_id: "plan", name: "Plan", round: 1, state: "done", verdict: null }],
    },
  ],
};

/** Every ticket starts with the Space's default items (R16). */
export const ITEMS: ItemSummary[] = [
  {
    name: "AGENTS.md",
    kind: "instructions",
    writable: false,
    version: 2,
    updated_at: ago(60 * 30),
  },
  {
    name: "skills/ticket/SKILL.md",
    kind: "skill",
    writable: false,
    version: 1,
    updated_at: ago(60 * 30),
  },
  { name: "TASKS.md", kind: "plan", writable: true, version: 4, updated_at: ago(20) },
  { name: "notes/changes.md", kind: "note", writable: true, version: 1, updated_at: ago(60 * 2) },
];

// ---------------------------------------------------------------- intake
const issue = (
  n: number,
  title: string,
  minutes: number,
  over: Partial<IntakeIssue> = {},
): IntakeIssue => ({
  key: `SUP-${String(n)}`,
  title,
  type: "bug",
  priority: "normal",
  status: "To Do",
  assignee: null,
  updated_at: ago(minutes),
  url: `https://northwind.atlassian.example/browse/SUP-${String(n)}`,
  ...over,
});

export const INTAKE: Intake = {
  checked_at: ago(2),
  queries: [
    {
      name: "Support bugs",
      jql: "project = SUP AND type = Bug AND status != Done ORDER BY updated DESC",
      result: {
        kind: "issues",
        total: 11,
        issues: [
          issue(252, "Session expires while a draft is open", 14, {
            priority: "high",
            assignee: "Bea Quinn",
          }),
          issue(251, "Avatars missing in exported PDFs", 38, {
            status: "In Progress",
            assignee: "Cy Rowe",
          }),
          issue(249, "Search ignores accented letters", 70),
          issue(248, "Time zone shown as UTC in reminders", 130, { type: "improvement" }),
          issue(246, "Duplicate rows after a quick double click", 190, { priority: "high" }),
          issue(245, "Copy link button copies the old URL", 260, { assignee: "Dee Sato" }),
          issue(243, "Long titles break the mobile header", 400, { type: "task", priority: "low" }),
          issue(242, "Keyboard trap in the date picker", 600, { status: "Waiting for support" }),
          issue(239, "Bulk edit drops the labels field", 900),
          issue(237, "Undo restores the wrong revision", 1500, { assignee: "Bea Quinn" }),
          issue(236, "Upload progress stalls at 99%", 2900, { type: "improvement" }),
        ],
      },
    },
    {
      name: "Platform backlog",
      jql: "project = PLAT AND sprint in openSprints()",
      result: {
        kind: "error",
        message:
          "Jira rejected the query: Field 'sprint' does not exist or you do not have permission to view it.",
      },
    },
    {
      name: "Design requests",
      jql: "project = SUP AND labels = design ORDER BY updated DESC",
      result: { kind: "issues", total: 0, issues: [] },
    },
  ],
};

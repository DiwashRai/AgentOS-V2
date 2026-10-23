// Invented fixtures for the library (R19-R28) and each ticket's workflow copy and context items,
// beside fixtures.ts (the board's), on its clock, people and tickets; split off to keep each file
// readable in a sitting. Northwind's library: 3 workflows, 4 agents, 6 skills and 4 files (the
// spec's fifth, the Linter, is a shell check: a Lint stage, not an agent).
// "Standard" is the default, at v4; every ticket copied it at v4 but NW-17, whose v3 copy has
// drifted both ways. Workflows name agents, skills and files by id; each item's "used by" lists
// the workflows naming it (read off them, so the two agree), and their tickets plus any ticket
// that added it itself.
import type {
  Agent,
  AgentStage,
  Author,
  ContextRefs,
  Item,
  ItemBody,
  ItemSummary,
  LibraryFile,
  Origin,
  Person,
  Runtime,
  ShellStage,
  Skill,
  TemplateField,
  TicketWorkflow,
  UsedBy,
  Version,
  Workflow,
  WorkflowBody,
} from "../api/types";
import { ADA, ago, BEA, CY, DEE, NOW, PLANS, rowOf, TICKETS } from "./fixtures";

const byPerson = (person: Person): Author => ({ kind: "person", person });
const byRun = (run_id: number, ticket: string): Author => ({ kind: "run", run_id, ticket });
type Stamp = readonly [minutes: number, by: Author];
const DAY = 60 * 24;

/** A library item's id, version, last change and history (newest first) from its stamps. */
function versions(id: string, newest: number, latest: Stamp, ...older: Stamp[]) {
  const history = [latest, ...older].map(([m, by], i): Version => ({
    version: newest - i,
    at: ago(m),
    by,
  }));
  return { id, version: newest, updated_at: ago(latest[0]), updated_by: latest[1], history };
}

const OPEN = TICKETS.filter((t) => t.state === "open").map((t) => t.key);

export const RUNTIMES: Runtime[] = [
  { id: "claude-code", name: "Claude Code", models: ["opus", "sonnet", "haiku"] },
  { id: "copilot-cli", name: "Copilot CLI", models: ["gpt-5", "gpt-5-mini", "claude-sonnet"] },
];

export const TEMPLATE_FIELDS: TemplateField[] = [
  { name: "ticket.key", about: "The ticket's key (NW-17)" },
  { name: "ticket.title", about: "Its title" },
  { name: "ticket.description", about: "Its description" },
  { name: "ticket.type", about: "Feature, bug, improvement or task" },
  { name: "ticket.repo", about: "Its repo, on a repo ticket" },
  { name: "ticket.base_branch", about: "The branch the work starts from" },
  { name: "plan", about: "TASKS.md as it stands" },
  { name: "notes", about: "The ticket's notes" },
  { name: "run.round", about: "The loop's round, from 1" },
  { name: "verdict.notes", about: "The last check's notes, in a loop" },
];

const NONE: ContextRefs = { skills: [], files: [] };

const agentStage = (
  s: Pick<AgentStage, "id" | "name" | "phase" | "agent" | "prompt"> & Partial<AgentStage>,
): AgentStage => ({
  kind: "agent",
  enabled: true,
  needs_repo: true,
  timeout_min: 30,
  gate: null,
  context: NONE,
  overrides: { runtime: null, model: null, effort: null },
  resume: false,
  check: null,
  ...s,
});

const shellStage = (
  s: Pick<ShellStage, "id" | "name" | "phase" | "command"> & Partial<ShellStage>,
): ShellStage => ({
  kind: "shell",
  enabled: true,
  needs_repo: true,
  timeout_min: 10,
  gate: null,
  context: NONE,
  check: true,
  ...s,
});

const PROMPTS = {
  plan: [
    "Plan {{ ticket.key }}: {{ ticket.title }}.",
    "",
    "{{ ticket.description }}",
    "",
    "Read the code it touches in {{ ticket.repo }} and write the steps to TASKS.md, smallest",
    "first, each one a commit. Don't change any code yet.",
  ].join("\n"),
  implement: [
    "Work through TASKS.md for {{ ticket.key }}, one step per commit, ticking each off.",
    "",
    "In round {{ run.round }} after a failed review, fix what it found first:",
    "{{ verdict.notes }}",
  ].join("\n"),
  review: [
    "Review the change against {{ ticket.base_branch }} and TASKS.md for {{ ticket.key }}.",
    "Pass it, or fail it with exactly what to fix.",
  ].join("\n"),
  pr: "Open a pull request for {{ ticket.key }}: {{ ticket.title }}, from the plan and the commits.",
};

const SIGN_OFF = { label: "Plan sign-off", short: "Sign-off" };

/** Standard at v4: plan (gated) → implement → lint (off) → review → open a PR, with implement to
 *  review a loop of up to 3 rounds. */
const STANDARD: WorkflowBody = {
  stages: [
    agentStage({
      id: "plan",
      name: "Plan",
      phase: "plan",
      agent: "planner",
      prompt: PROMPTS.plan,
      gate: SIGN_OFF,
    }),
    agentStage({
      id: "implement",
      name: "Implement",
      phase: "build",
      agent: "builder",
      prompt: PROMPTS.implement,
      resume: true,
      timeout_min: 60,
      context: { skills: ["tests"], files: ["api-conventions"] },
    }),
    shellStage({
      id: "lint",
      name: "Lint",
      phase: "verify",
      command: "npm run lint && npm run typecheck",
      enabled: false,
    }),
    agentStage({
      id: "review",
      name: "Review",
      phase: "review",
      agent: "reviewer",
      prompt: PROMPTS.review,
      check: { repairs: 2 },
      context: { skills: ["review"], files: [] },
    }),
    agentStage({
      id: "pr",
      name: "Open a PR",
      phase: "review",
      agent: "builder",
      prompt: PROMPTS.pr,
      timeout_min: 15,
      context: { skills: ["pull-request"], files: [] },
    }),
  ],
  loops: [{ first: "implement", last: "review", rounds: 3 }],
  context: { skills: ["ticket"], files: ["agents-md"] },
};

export const WORKFLOWS: Workflow[] = [
  {
    ...versions(
      "standard",
      4,
      [2 * DAY, byPerson(BEA)],
      [9 * DAY, byPerson(ADA)],
      [20 * DAY, byPerson(ADA)],
      [30 * DAY, byPerson(ADA)],
    ),
    name: "Standard",
    description: "Plan, build, check and review, then open a PR. The Space's default.",
    is_default: true,
    tickets: OPEN,
    ...STANDARD,
  },
  {
    ...versions("careful", 2, [5 * DAY, byPerson(CY)], [12 * DAY, byPerson(CY)]),
    name: "Careful review",
    description: "Tests, a lint check and two independent reviews, looped until all pass.",
    is_default: false,
    tickets: [],
    stages: [
      agentStage({
        id: "plan",
        name: "Plan",
        phase: "plan",
        agent: "planner",
        prompt: PROMPTS.plan,
        gate: SIGN_OFF,
      }),
      agentStage({
        id: "implement",
        name: "Implement",
        phase: "build",
        agent: "builder",
        prompt: PROMPTS.implement,
        resume: true,
        timeout_min: 90,
        context: { skills: ["tests", "migrations"], files: ["architecture"] },
      }),
      shellStage({
        id: "tests",
        name: "Tests",
        phase: "verify",
        command: "npm test",
        timeout_min: 20,
      }),
      shellStage({
        id: "lint",
        name: "Lint",
        phase: "verify",
        command: "npm run lint && npm run typecheck",
      }),
      agentStage({
        id: "review",
        name: "Review",
        phase: "review",
        agent: "reviewer",
        prompt: PROMPTS.review,
        overrides: { runtime: null, model: null, effort: "max" },
        check: { repairs: 2 },
        context: { skills: ["review"], files: [] },
      }),
      agentStage({
        id: "second-review",
        name: "Second review",
        phase: "review",
        agent: "reviewer",
        prompt: PROMPTS.review,
        overrides: { runtime: "copilot-cli", model: "gpt-5", effort: "high" },
        check: { repairs: 2 },
        gate: { label: "Merge sign-off", short: "Merge" },
        context: { skills: ["review"], files: [] },
      }),
      agentStage({
        id: "pr",
        name: "Open a PR",
        phase: "review",
        agent: "builder",
        prompt: PROMPTS.pr,
        timeout_min: 15,
        context: { skills: ["pull-request"], files: [] },
      }),
    ],
    loops: [{ first: "implement", last: "second-review", rounds: 5 }],
    context: { skills: ["ticket"], files: ["agents-md", "architecture"] },
  },
  {
    ...versions("docs", 1, [15 * DAY, byPerson(DEE)]),
    name: "Docs only",
    description: "Draft and review a doc without a repo; the result is the ticket's notes.",
    is_default: false,
    tickets: [],
    stages: [
      agentStage({
        id: "draft",
        name: "Draft",
        phase: "build",
        agent: "writer",
        prompt:
          "Draft what {{ ticket.title }} asks for in notes/draft.md.\n\n{{ ticket.description }}",
        needs_repo: false,
        resume: true,
      }),
      agentStage({
        id: "review",
        name: "Review",
        phase: "review",
        agent: "reviewer",
        prompt: "Review notes/draft.md for {{ ticket.key }} against the docs style. Pass or fail.",
        needs_repo: false,
        check: { repairs: 1 },
        gate: { label: "Publish sign-off", short: "Publish" },
      }),
    ],
    loops: [{ first: "draft", last: "review", rounds: 2 }],
    context: { skills: ["ticket", "docs-style"], files: ["agents-md", "glossary"] },
  },
];

/** What uses a library item, by what it is, by one rule for all four kinds: the workflows naming
 *  it, and the tickets on those workflows plus any ticket that added it to its own context. */
const usedIn = (
  kind: "agent" | "skills" | "files",
  id: string,
  added: readonly string[],
): UsedBy => {
  const ws = WORKFLOWS.filter((w) =>
    kind === "agent"
      ? w.stages.some((s) => s.kind === "agent" && s.agent === id)
      : [w.context, ...w.stages.map((s) => s.context)].some((c) => c[kind].includes(id)),
  );
  const on = new Set([...ws.flatMap((w) => w.tickets), ...added]);
  return {
    workflows: ws.map((w) => ({ id: w.id, name: w.name })),
    tickets: TICKETS.map((t) => t.key).filter((k) => on.has(k)),
  };
};

const agent = (
  id: string,
  over: Pick<Agent, "name" | "description" | "instructions" | "runtime" | "model" | "effort">,
  stamps: [number, Stamp, ...Stamp[]],
  tickets: readonly string[] = [],
): Agent => {
  const [newest, latest, ...older] = stamps;
  return {
    ...versions(id, newest, latest, ...older),
    ...over,
    used_by: usedIn("agent", id, tickets),
  };
};

export const AGENTS: Agent[] = [
  agent(
    "planner",
    {
      name: "Planner",
      description: "Reads the ticket and the code, and writes the plan to TASKS.md.",
      instructions:
        "# Planner\n\nYou plan; you don't change code.\n\n- Read the ticket, then the code it touches.\n- Write TASKS.md: small steps, each one commit, smallest first.\n- Name the tests each step needs.\n- If the ticket is unclear, say what you'd ask in notes/questions.md.",
      runtime: "claude-code",
      model: "opus",
      effort: "high",
    },
    [3, [6 * DAY, byPerson(ADA)], [14 * DAY, byPerson(ADA)], [30 * DAY, byPerson(ADA)]],
  ),
  agent(
    "builder",
    {
      name: "Builder",
      description: "Works through the plan: code, tests and a commit per step.",
      instructions:
        "# Builder\n\nWork through TASKS.md in order.\n\n- One step per commit; tick it off in the same commit.\n- Write the test first when the step changes behaviour.\n- Run the checks in AGENTS.md before every commit.\n- Note anything surprising in notes/changes.md.",
      runtime: "claude-code",
      model: "sonnet",
      effort: "high",
    },
    [4, [3 * DAY, byPerson(BEA)], [8 * DAY, byRun(31, "NW-11")], [16 * DAY, byPerson(ADA)]],
    ["NW-17"],
  ),
  agent(
    "reviewer",
    {
      name: "Reviewer",
      description: "Reviews the change against its plan and writes a verdict.",
      instructions:
        "# Reviewer\n\nYou check; you don't fix.\n\n- Read TASKS.md, then the diff against the base branch.\n- Fail anything the plan didn't ask for, and any missing test.\n- Write the verdict: pass, or fail with a list of what to fix.",
      runtime: "claude-code",
      model: "opus",
      effort: "xhigh",
    },
    [2, [10 * DAY, byPerson(CY)], [25 * DAY, byPerson(ADA)]],
  ),
  agent(
    "writer",
    {
      name: "Writer",
      description: "Drafts and edits docs in Northwind's voice.",
      instructions:
        "# Writer\n\nWrite for a busy reader: the answer first, then the why. Short sentences, plain words, one idea per paragraph. Follow the docs-style skill.",
      runtime: "copilot-cli",
      model: "gpt-5",
      effort: "medium",
    },
    [2, [15 * DAY, byPerson(DEE)], [21 * DAY, byPerson(DEE)]],
    ["NW-26"],
  ),
];

const skill = (
  id: string,
  name: string,
  description: string,
  content: string,
  stamps: [number, Stamp, ...Stamp[]],
  tickets: readonly string[],
): Skill => {
  const [newest, latest, ...older] = stamps;
  return {
    ...versions(id, newest, latest, ...older),
    name,
    description,
    path: `skills/${id}/SKILL.md`,
    content,
    used_by: usedIn("skills", id, tickets),
  };
};

export const SKILLS: Skill[] = [
  skill(
    "ticket",
    "ticket",
    "Read and update the ticket: its plan, its notes and the verdict file.",
    "---\nname: ticket\ndescription: Read and update the ticket.\n---\n\n# The ticket\n\n- TASKS.md is the plan: tick a step off in the commit that does it.\n- Append to notes/changes.md; never rewrite it.\n- A check writes its verdict to .agentos/verdict.json: `pass` or `fail`, with notes.",
    [2, [30 * DAY, byPerson(ADA)], [40 * DAY, byPerson(ADA)]],
    OPEN,
  ),
  skill(
    "tests",
    "tests",
    "Run, read and write tests in Northwind's repos.",
    "---\nname: tests\ndescription: Run, read and write tests.\n---\n\n# Tests\n\n- web: `npm test` (Vitest); api: `uv run pytest`.\n- Test behaviour at the seams, never exact wording.\n- No sleeps: inject the clock.",
    [3, [1 * DAY, byPerson(BEA)], [11 * DAY, byPerson(BEA)], [26 * DAY, byPerson(ADA)]],
    ["NW-17", "NW-20"],
  ),
  skill(
    "review",
    "review",
    "Review a change against its plan and write a verdict.",
    "---\nname: review\ndescription: Review a change against its plan.\n---\n\n# Review\n\nRead the plan, then the diff. For each step: is it done, tested and no more than asked? Fail with a numbered list of fixes.",
    [2, [10 * DAY, byPerson(CY)], [25 * DAY, byPerson(ADA)]],
    [],
  ),
  skill(
    "pull-request",
    "pull-request",
    "Open a pull request with Northwind's template.",
    "---\nname: pull-request\ndescription: Open a pull request.\n---\n\n# Pull requests\n\nTitle: the ticket's key and title. Body: what changed and why, how it was tested, and the ticket's link.",
    [1, [2 * DAY, byPerson(BEA)]],
    [],
  ),
  skill(
    "migrations",
    "migrations",
    "Write migrations that are safe on a live database.",
    "---\nname: migrations\ndescription: Safe migrations.\n---\n\n# Migrations\n\n- Add before you remove; never rename in one step.\n- Backfill in batches of 1,000 outside the migration.\n- Take no lock longer than 5 seconds.",
    [2, [7 * DAY, byPerson(DEE)], [18 * DAY, byPerson(DEE)]],
    ["NW-12", "NW-20"],
  ),
  skill(
    "docs-style",
    "docs-style",
    "Northwind's voice and layout for docs.",
    "---\nname: docs-style\ndescription: Northwind's docs style.\n---\n\n# Docs style\n\nThe answer first. Sentence-case headings. Steps as numbered lists; everything else as prose.",
    [1, [15 * DAY, byPerson(DEE)]],
    ["NW-26"],
  ),
];

const AGENTS_MD = [
  {
    name: "Project",
    text: "Northwind is a ticketing tool for support teams. The code is in three repos: `northwind/web` (React), `northwind/api` (Python, FastAPI) and `northwind/runner`. Docs live in `northwind/docs`.",
  },
  {
    name: "Conventions",
    text: "- Small commits, one task each; the message says why.\n- Tests at the seams, never on exact wording.\n- No new dependency without saying why in the PR.",
  },
  {
    name: "Checks",
    text: "Before you finish, run:\n\n```sh\nnpm run lint && npm run typecheck\nnpm test\n```\n\nA failing check is fixed, never skipped.",
  },
];

const API_CONVENTIONS =
  "# API conventions\n\n- Every write returns the stored record.\n- Lists are paged with an opaque `next` cursor.\n- Errors use one shape: `{ code, message, issues }`.";

const fileOf = (
  id: string,
  path: string,
  body: LibraryFile["body"],
  stamps: [number, Stamp, ...Stamp[]],
  tickets: readonly string[],
): LibraryFile => {
  const [newest, latest, ...older] = stamps;
  const text =
    body.kind === "text"
      ? body.text
      : body.blocks.map((b) => `## ${b.name}\n\n${b.text}`).join("\n\n");
  return {
    ...versions(id, newest, latest, ...older),
    path,
    size: text.length,
    body,
    used_by: usedIn("files", id, tickets),
  };
};

export const FILES: LibraryFile[] = [
  fileOf(
    "agents-md",
    "AGENTS.md",
    { kind: "blocks", blocks: AGENTS_MD },
    [5, [4 * DAY, byPerson(ADA)], [9 * DAY, byPerson(BEA)], [22 * DAY, byPerson(ADA)]],
    OPEN,
  ),
  fileOf(
    "api-conventions",
    "context/api-conventions.md",
    {
      kind: "text",
      text: API_CONVENTIONS,
    },
    [1, [19 * DAY, byPerson(BEA)]],
    ["NW-17", "NW-20"],
  ),
  fileOf(
    "architecture",
    "context/architecture.md",
    {
      kind: "text",
      text: "# Architecture\n\nThe web talks only to the api. The api owns the database; the runner owns no state and reports back over HTTP. Background work runs in the api's sync worker.",
    },
    [3, [6 * DAY, byPerson(CY)], [13 * DAY, byPerson(CY)], [28 * DAY, byPerson(ADA)]],
    ["NW-12"],
  ),
  fileOf(
    "glossary",
    "context/glossary.md",
    {
      kind: "text",
      text: "# Glossary\n\n- **Ticket**: a support request.\n- **Queue**: the tickets a team owns.\n- **Macro**: a saved reply.",
    },
    [2, [15 * DAY, byPerson(DEE)], [24 * DAY, byPerson(DEE)]],
    ["NW-26"],
  ),
];

// ---------------------------------------------------------------- a ticket's workflow and items
/** NW-17 copied Standard at v3 (Review allowed one repair, and Open a PR had no skill yet), then
 *  changed its copy: Implement keeps the client id and thinks harder. The library has moved to v4. */
const NW17_WORKFLOW: WorkflowBody = {
  ...STANDARD,
  stages: STANDARD.stages.map((s) => {
    if (s.kind !== "agent") return s;
    if (s.id === "implement")
      return {
        ...s,
        prompt: `${s.prompt}\n\nKeep client_id on the stored record, so the client's swap doesn't flicker.`,
        overrides: { runtime: null, model: null, effort: "xhigh" },
      };
    if (s.id === "review") return { ...s, check: { repairs: 1 } };
    if (s.id === "pr") return { ...s, context: NONE };
    return s;
  }),
};

export function ticketWorkflowOf(key: string): TicketWorkflow {
  const t = rowOf(key);
  if (key === "NW-17")
    return {
      ticket: key,
      name: "Standard",
      from: { id: "standard", version: 3 },
      drift: { library: 4, changed: true },
      version: 2,
      updated_at: ago(35),
      updated_by: byPerson(ADA),
      ...NW17_WORKFLOW,
    };
  return {
    ticket: key,
    name: "Standard",
    from: { id: "standard", version: 4 },
    drift: { library: null, changed: false },
    version: 1,
    updated_at: t.since,
    updated_by: byPerson(ADA),
    ...STANDARD,
  };
}

const copy = (
  of: { id: string; name: string },
  version: number,
  library: number | null = null,
  changed = false,
): Origin => ({
  kind: "copy",
  of,
  version,
  drift: { library, changed },
});
const OWN: Origin = { kind: "own" };

const summary = (
  name: string,
  kind: ItemSummary["kind"],
  writable: boolean,
  [version, minutes, by]: readonly [number, number, Author],
  origin: Origin,
): ItemSummary => ({
  name,
  kind,
  writable,
  version,
  updated_at: ago(minutes),
  updated_by: by,
  origin,
});

/** Every ticket starts with the Space's default items (R16); NW-17 has added more. */
const DEFAULT_ITEMS: ItemSummary[] = [
  summary(
    "AGENTS.md",
    "instructions",
    false,
    [1, 30 * 60, byPerson(ADA)],
    copy({ id: "agents-md", name: "AGENTS.md" }, 5),
  ),
  summary(
    "skills/ticket/SKILL.md",
    "skill",
    false,
    [1, 30 * 60, byPerson(ADA)],
    copy({ id: "ticket", name: "ticket" }, 2),
  ),
  summary("TASKS.md", "plan", true, [4, 20, byRun(42, "NW-17")], OWN),
  summary("notes/changes.md", "note", true, [1, 2 * 60, byRun(39, "NW-17")], OWN),
];

const ITEMS: Record<string, ItemSummary[]> = {
  "NW-17": [
    ...DEFAULT_ITEMS.slice(0, 2),
    summary(
      "skills/tests/SKILL.md",
      "skill",
      false,
      [1, 30 * 60, byPerson(ADA)],
      copy({ id: "tests", name: "tests" }, 2, 3),
    ),
    // the agents its workflow's stages run, each copied with it: an agent is named, not a path
    summary(
      "Planner",
      "agent",
      false,
      [1, 30 * 60, byPerson(ADA)],
      copy({ id: "planner", name: "Planner" }, 3),
    ),
    summary(
      "Builder",
      "agent",
      false,
      [1, 30 * 60, byPerson(ADA)],
      copy({ id: "builder", name: "Builder" }, 4),
    ),
    summary(
      "Reviewer",
      "agent",
      false,
      [1, 30 * 60, byPerson(ADA)],
      copy({ id: "reviewer", name: "Reviewer" }, 1, 2),
    ),
    summary(
      "context/api-conventions.md",
      "file",
      true,
      [2, 50, byRun(42, "NW-17")],
      copy({ id: "api-conventions", name: "context/api-conventions.md" }, 1, null, true),
    ),
    ...DEFAULT_ITEMS.slice(2),
  ],
};

export const itemsOf = (key: string): ItemSummary[] => ITEMS[key] ?? DEFAULT_ITEMS;

const NOTES: Record<string, string> = {
  "NW-17":
    "## Run 39 · Planner\n\n- Comments are written only by the sync worker (api/sync/comments.py).\n- The optimistic message already carries a client_id.\n\n## Run 42 · Builder\n\n- POST /comments writes on request now; 4 tests added.\n- Review round 1 failed: the swap still flickers without client_id on the record.",
};

/** Each library item's content, as a ticket's copy of it starts. */
const LIBRARY_BODIES = new Map<string, ItemBody>([
  ...AGENTS.map(({ id, instructions, runtime, model, effort }): [string, ItemBody] => [
    id,
    { kind: "agent", agent: { instructions, runtime, model, effort } },
  ]),
  ...SKILLS.map((s): [string, ItemBody] => [s.id, { kind: "text", text: s.content }]),
  ...FILES.map((f): [string, ItemBody] => [f.id, f.body]),
]);

/** Copies a ticket changed, by ticket and item name. */
const CHANGED: Record<string, ItemBody> = {
  "NW-17 context/api-conventions.md": {
    kind: "text",
    text: `${API_CONVENTIONS}\n- A comment's client_id is unique per author.`,
  },
};

/** An item's content: its own (the plan, the notes), a changed copy, or the library item's. */
function bodyOf(key: string, s: ItemSummary): ItemBody {
  const changed = CHANGED[`${key} ${s.name}`];
  if (changed) return changed;
  if (s.origin.kind === "own")
    return { kind: "text", text: (s.kind === "plan" ? PLANS : NOTES)[key] ?? "" };
  return LIBRARY_BODIES.get(s.origin.of.id) ?? { kind: "text", text: "" };
}

const minutesAgo = (iso: string) => Math.round((NOW - Date.parse(iso)) / 60_000);

export function itemOf(key: string, name: string): Item {
  const s = itemsOf(key).find((i) => i.name === name);
  if (!s) throw new Error(`no fixture item ${name} on ${key}`);
  const older = Array.from({ length: Math.min(s.version, 4) - 1 }, (_, i): Version => ({
    version: s.version - i - 1,
    at: ago(minutesAgo(s.updated_at) + (i + 1) * 3 * 60),
    by: byPerson(ADA),
  }));
  return {
    ...s,
    body: bodyOf(key, s),
    history: [{ version: s.version, at: s.updated_at, by: s.updated_by }, ...older],
  };
}

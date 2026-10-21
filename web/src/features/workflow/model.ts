// The workflow editor's model, pure: the edits a workflow takes (reorder, a gate, a new stage,
// an agent, a skill or a file on a stage or on every stage, a stage's settings, a loop's rounds),
// and what's wrong with it (rules.md › Workflows: a loop needs a check and a maker, a gate only on
// a loop's last stage; R28: a prompt names only ticket fields).
import type {
  AgentStage,
  ContextRefs,
  Stage,
  StagePhase,
  TemplateField,
  WorkflowBody,
} from "../../api/types";

export type RefKind = "skills" | "files";

export const PHASES: readonly { id: StagePhase; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
  { id: "verify", label: "Verify" },
  { id: "review", label: "Review" },
];

export const phaseWord = (p: StagePhase): string => PHASES.find((x) => x.id === p)?.label ?? p;

/** A check can fail a round (an agent's verdict, a command's exit); anything else is a maker. */
export const isCheck = (s: Stage): boolean => (s.kind === "agent" ? s.check !== null : s.check);

function moved<T>(xs: readonly T[], from: number, to: number): T[] {
  const next = [...xs];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export const moveStage = (b: WorkflowBody, from: number, to: number): WorkflowBody => ({
  ...b,
  stages: moved(b.stages, from, to),
});

/** Change one stage, by id. */
export function updateStage(b: WorkflowBody, id: string, f: (s: Stage) => Stage): WorkflowBody {
  return { ...b, stages: b.stages.map((s) => (s.id === id ? f(s) : s)) };
}

/** The gate after the stage at `i`, on (named for its stage) or off. */
export function toggleGate(b: WorkflowBody, i: number): WorkflowBody {
  const s = b.stages[i];
  if (!s) return b;
  const gate = s.gate ? null : { label: `${s.name} sign-off`, short: "Sign-off" };
  return updateStage(b, s.id, (x) => ({ ...x, gate }));
}

const NONE: ContextRefs = { skills: [], files: [] };

/** A new agent stage at slot `at`, in its neighbour's phase; returns it with its id. */
export function insertStage(
  b: WorkflowBody,
  at: number,
  agent: { id: string; name: string },
): { body: WorkflowBody; id: string } {
  const taken = new Set(b.stages.map((s) => s.id));
  let n = b.stages.length + 1;
  while (taken.has(`stage-${String(n)}`)) n++;
  const id = `stage-${String(n)}`;
  const stage: AgentStage = {
    kind: "agent",
    id,
    name: agent.name,
    phase: (b.stages[at - 1] ?? b.stages[at])?.phase ?? "build",
    enabled: true,
    needs_repo: true,
    timeout_min: 30,
    gate: null,
    context: NONE,
    agent: agent.id,
    overrides: { runtime: null, model: null, effort: null },
    prompt: "",
    resume: false,
    check: null,
  };
  const stages = [...b.stages];
  stages.splice(at, 0, stage);
  return { body: { ...b, stages }, id };
}

export const withRef = (c: ContextRefs, kind: RefKind, id: string): ContextRefs =>
  c[kind].includes(id) ? c : { ...c, [kind]: [...c[kind], id] };

export const withoutRef = (c: ContextRefs, kind: RefKind, id: string): ContextRefs => ({
  ...c,
  [kind]: c[kind].filter((x) => x !== id),
});

/** A skill or a file onto one stage. */
export const addToStage = (b: WorkflowBody, stage: string, kind: RefKind, id: string) =>
  updateStage(b, stage, (s) => ({ ...s, context: withRef(s.context, kind, id) }));

/** An agent onto an agent stage (a shell stage has none). */
export const setAgent = (b: WorkflowBody, stage: string, agent: string) =>
  updateStage(b, stage, (s) => (s.kind === "agent" ? { ...s, agent } : s));

export function setRounds(b: WorkflowBody, i: number, rounds: number): WorkflowBody {
  return { ...b, loops: b.loops.map((l, k) => (k === i ? { ...l, rounds } : l)) };
}

// ---------------------------------------------------------------- what's wrong

export interface Problems {
  /** One message per stage that has one, by stage id. */
  stages: ReadonlyMap<string, string>;
  /** One message per loop that has one, by loop index. */
  loops: ReadonlyMap<number, string>;
  count: number;
}

/** The `{{ name }}` fields a prompt names. */
export const fieldsIn = (prompt: string): string[] =>
  [...prompt.matchAll(/\{\{\s*([^}\s]+)\s*\}\}/g)].map((m) => m[1] ?? "");

/** The stages a loop repeats, by index (empty when its ends are out of order). */
function span(b: WorkflowBody, first: string, last: string): number[] {
  const a = b.stages.findIndex((s) => s.id === first);
  const z = b.stages.findIndex((s) => s.id === last);
  return a < 0 || z < a ? [] : Array.from({ length: z - a + 1 }, (_, k) => a + k);
}

function loopProblem(stages: readonly Stage[]): string | null {
  if (!stages.some(isCheck)) return "A loop needs a check: nothing in it can fail a round.";
  if (stages.every(isCheck)) return "A loop needs a maker: nothing in it changes between rounds.";
  return null;
}

function promptProblem(s: Stage, known: ReadonlySet<string>): string | null {
  if (s.kind !== "agent") return null;
  const unknown = fieldsIn(s.prompt).find((f) => !known.has(f));
  return unknown === undefined
    ? null
    : `The prompt names {{ ${unknown} }}: no ticket field has that name.`;
}

export function problemsOf(b: WorkflowBody, fields: readonly TemplateField[]): Problems {
  const known = new Set(fields.map((f) => f.name));
  const stages = new Map<string, string>();
  const loops = new Map<number, string>();
  b.loops.forEach((l, i) => {
    const inside = span(b, l.first, l.last);
    const p = loopProblem(inside.map((k) => b.stages[k]).filter((s) => s !== undefined));
    if (p) loops.set(i, p);
    for (const k of inside.slice(0, -1)) {
      const s = b.stages[k];
      if (s?.gate)
        stages.set(s.id, "A gate inside a loop: only the loop's last stage can have one.");
    }
  });
  for (const s of b.stages) {
    const p = promptProblem(s, known);
    if (p && !stages.has(s.id)) stages.set(s.id, p);
  }
  return { stages, loops, count: stages.size + loops.size };
}

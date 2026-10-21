// The board as each screen draws it, selected from the server's board fields (R12, R13). The
// payload is the same for every viewer; this is where "waiting on Ada" becomes "needs you" for
// Ada. It maps and groups; it never derives a state the server owns.
import type { Attention, Person, RailStep, Round, StepState, TicketRow } from "../api/types";
import { elapsed, firstName } from "./format";

export type Group = "needs_you" | "blocked" | "running" | "queued" | "waiting" | "inbox" | "done";

export const GROUP_ORDER: readonly Group[] = [
  "needs_you",
  "blocked",
  "running",
  "queued",
  "waiting",
  "inbox",
  "done",
];

export const GROUP_WORD: Record<Group, string> = {
  needs_you: "Needs you",
  blocked: "Blocked",
  running: "Running",
  queued: "Queued",
  waiting: "Waiting on others",
  inbox: "Inbox",
  done: "Done recently",
};

/** It's my move: the ticket waits on me, or on nobody in particular (R13). */
export function isMyMove(on: Person | null, me: Person | null): boolean {
  return on === null || on.id === me?.id;
}

export function isMine(t: Pick<TicketRow, "owner">, me: Person | null): boolean {
  return me !== null && t.owner?.id === me.id;
}

/** My move: it waits on me (or on nobody), or it is blocked and mine (or nobody's) to retry. My
 *  queue lists these; "need you" elsewhere counts only the first kind (groupOf). */
export function isYourMove(t: Pick<TicketRow, "attention" | "owner">, me: Person | null): boolean {
  const a = t.attention;
  if (a.kind === "waiting") return isMyMove(a.on, me);
  return a.kind === "blocked" && (t.owner === null || isMine(t, me));
}

export function groupOf(t: Pick<TicketRow, "attention">, me: Person | null): Group {
  const a = t.attention;
  switch (a.kind) {
    case "waiting":
      return isMyMove(a.on, me) ? "needs_you" : "waiting";
    case "running":
    case "queued":
    case "blocked":
    case "inbox":
    case "done":
      return a.kind;
  }
}

/** The status mark's model: a kind and its words (kit Mark's props); YOU has no name. */
export type MarkModel =
  | { kind: "you"; ask?: string }
  | {
      kind: "run" | "wait" | "blk" | "done" | "abandoned" | "queued" | "idle";
      name: string;
      ask?: string;
    };

export function markOf(a: Attention, me: Person | null): MarkModel {
  switch (a.kind) {
    case "waiting":
      return isMyMove(a.on, me)
        ? { kind: "you", ask: a.ask }
        : { kind: "wait", name: a.on ? firstName(a.on.name) : "Someone", ask: a.ask };
    case "running":
      return { kind: "run", name: a.agent };
    case "queued":
      return { kind: "queued", name: "Queued" };
    case "blocked":
      return { kind: "blk", name: "Blocked" };
    case "inbox":
      return { kind: "idle", name: "Inbox" };
    case "done":
      return a.outcome === "abandoned"
        ? { kind: "abandoned", name: "Abandoned" }
        : { kind: "done", name: "Complete" };
  }
}

// ------------------------------------------------------------------ the stage glyph's model

export interface GlyphGate {
  label: string;
  short: string;
  state: "pending" | "passed" | "waiting" | "you";
  person?: string;
}

export interface GlyphStage {
  name: string;
  state: "done" | "current" | "upcoming" | "skipped" | "failed";
  gate?: GlyphGate;
  round?: Round;
}

export interface GlyphModel {
  stages: GlyphStage[];
  /** The parked gate's short name, else the stage the ticket is at. */
  label: string;
  round?: Round;
  /** A run is on a runner: the current segment draws live. */
  live: boolean;
  /** Abandoned: its stopped stage is where it was closed. */
  closed: boolean;
}

// `stale` (done before, but after the latest run's segment) has no form of its own: upcoming.
const DRAWN: Record<StepState, GlyphStage["state"]> = {
  pending: "upcoming",
  stale: "upcoming",
  current: "current",
  done: "done",
  failed: "failed",
  skipped: "skipped",
};

function gateOf(step: RailStep, a: Attention, me: Person | null): GlyphGate | undefined {
  const g = step.gate;
  if (!g) return undefined;
  if (g.state !== "waiting" || a.kind !== "waiting")
    return { label: g.label, short: g.short, state: g.state };
  return isMyMove(a.on, me)
    ? { label: g.label, short: g.short, state: "you" }
    : {
        label: g.label,
        short: g.short,
        state: "waiting",
        person: a.on ? firstName(a.on.name) : "someone",
      };
}

function stageOf(step: RailStep, a: Attention, me: Person | null): GlyphStage {
  const gate = gateOf(step, a, me);
  const round = step.round && step.round.of > 1 ? step.round : undefined;
  return {
    name: step.name,
    state: DRAWN[step.state],
    ...(gate ? { gate } : {}),
    ...(round ? { round } : {}),
  };
}

/** An abandoned ticket never reached Done: it stops, crimson, at the first stage it didn't finish. */
function closed(stages: readonly GlyphStage[]): GlyphModel {
  const stop = stages.findIndex((st, i) => i > 0 && st.state !== "done" && st.state !== "skipped");
  return {
    stages: stages.map((st, i) => (i === stop ? { ...st, state: "failed" } : st)),
    label: "Closed",
    live: false,
    closed: true,
  };
}

/** The label beside the glyph: the parked gate's short name, else where the ticket is. */
function labelOf(stages: readonly GlyphStage[]): Pick<GlyphModel, "label" | "round"> {
  const parked = stages.find((st) => st.gate?.state === "you" || st.gate?.state === "waiting");
  if (parked?.gate) return { label: parked.gate.short };
  const at = stages.find((st) => st.state === "current" || st.state === "failed");
  if (at) return { label: at.name, ...(at.round ? { round: at.round } : {}) };
  return { label: stages.findLast((st) => st.state === "done")?.name ?? "" };
}

/** One segment per stage of this ticket's workflow, with Inbox and Done bookends. */
export function stageModel(
  t: Pick<TicketRow, "rail" | "phase" | "attention">,
  me: Person | null,
): GlyphModel {
  const a = t.attention;
  const outcome = a.kind === "done" ? a.outcome : null;
  const stages: GlyphStage[] = [
    { name: "Inbox", state: t.phase === "inbox" ? "current" : "done" },
    ...t.rail.map((step) => stageOf(step, a, me)),
    { name: "Done", state: outcome === "completed" ? "current" : "upcoming" },
  ];
  if (outcome === "abandoned") return closed(stages);
  return { stages, ...labelOf(stages), live: a.kind === "running", closed: false };
}

/** "5 stages · 1 skipped", as V1 says it under an owner. */
export function stagesText(t: Pick<TicketRow, "rail">): string {
  const skipped = t.rail.filter((s) => s.state === "skipped").length;
  const n = `${String(t.rail.length)} ${t.rail.length === 1 ? "stage" : "stages"}`;
  return skipped > 0 ? `${n} · ${String(skipped)} skipped` : n;
}

/** "3/5" while step 3 of 5 runs (V1's meter text): the step in progress, not the steps done. */
export function stepText(p: { done: number; total: number }): string {
  return `${String(Math.min(p.done + 1, p.total))}/${String(p.total)}`;
}

/** The live label over a run: "Builder · Run #42 · 6:00 · 2/5". */
export function runLine(t: Pick<TicketRow, "attention" | "since">, now: number): string {
  const a = t.attention;
  if (a.kind !== "running") return "";
  const p = a.progress ? stepText(a.progress) : null;
  return [a.agent, `Run #${String(a.run_id)}`, elapsed(t.since, now), p]
    .filter(Boolean)
    .join(" · ");
}

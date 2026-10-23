// Pure selection for All teams: every ticket in flight (inbox and merged work live in each repo's
// list), one group per repo in the Space's order. A group's rows run down the stages (Plan, Build,
// Verify, Review), and inside a stage what needs you leads, then blocked, running, waiting and
// queued. Its head carries who works there; a repo with nothing in flight is quiet.
import type { Attention, Person, Phase, Progress, TicketRow } from "../../api/types";
import { type Group, groupOf, isMyMove, stepText } from "../../domain/board";
import { firstName } from "../../domain/format";

/** Work in flight: inbox and merged work live in each repo's list. */
export function inFlight(t: TicketRow): boolean {
  return t.attention.kind !== "inbox" && t.attention.kind !== "done";
}

/** The stages a ticket in flight is at, in order, by the board's names. */
export const STAGE: Partial<Record<Phase, string>> = {
  plan: "Plan",
  build: "Build",
  verify: "Verify",
  review: "Review",
};

const PHASE_AT: Record<Phase, number> = {
  inbox: 0,
  plan: 1,
  build: 2,
  verify: 3,
  review: 4,
  done: 5,
};

const URGENCY: Record<Group, number> = {
  needs_you: 0,
  blocked: 1,
  running: 2,
  waiting: 3,
  queued: 4,
  inbox: 5,
  done: 6,
};

export interface RepoGroup {
  repo: string;
  /** Who works there: everyone who owns one of its tickets, in flight or not. */
  people: Person[];
  /** Its tickets in flight that the search leaves, down the stages. */
  rows: TicketRow[];
}

/** Each repo's group: its tickets in flight (the search's), in stage order, what needs you first. */
export function groupsOf(
  rows: readonly TicketRow[],
  repos: readonly string[],
  me: Person | null,
  query: readonly string[],
): { active: RepoGroup[]; quiet: RepoGroup[] } {
  const found = (t: TicketRow) =>
    query.every((q) => `${t.key} ${t.title}`.toLowerCase().includes(q));
  const order = (a: TicketRow, b: TicketRow) =>
    PHASE_AT[a.phase] - PHASE_AT[b.phase] ||
    URGENCY[groupOf(a, me)] - URGENCY[groupOf(b, me)] ||
    a.key.localeCompare(b.key, "en", { numeric: true });
  const groups = repos.map((repo): RepoGroup & { flying: number } => {
    const own = rows.filter((t) => t.repo === repo);
    const owners = own.flatMap((t) => (t.owner ? [t.owner] : []));
    const flying = own.filter(inFlight);
    const shown = flying.filter(found).sort(order);
    return {
      repo,
      people: [...new Map(owners.map((p) => [p.id, p])).values()],
      rows: shown,
      flying: flying.length,
    };
  });
  return {
    active: groups.filter((g) => g.flying > 0),
    quiet: groups.filter((g) => g.flying === 0),
  };
}

/** How many of the shown tickets are at each stage, across the repos: where work piles up. */
export function stageCounts(groups: readonly RepoGroup[]): { name: string; n: number }[] {
  const rows = groups.flatMap((g) => g.rows);
  return Object.entries(STAGE).map(([phase, name]) => ({
    name,
    n: rows.filter((t) => t.phase === phase).length,
  }));
}

/** The State column: what a ticket in flight is doing or waits on, in words. */
export interface StateWords {
  text: string;
  /** you: your move (the accent); firm: blocked (the first ink); live: an agent at work (the
   *  second, a weight up); plain: it waits on someone; quiet: nothing is at work on it yet. */
  tone: "you" | "firm" | "live" | "plain" | "quiet";
  /** A running agent's steps, for its count and meter; a queued run has a dashed one. */
  run: { progress: Progress | null; step: string | null } | "queued" | null;
  /** The whole of it, on hover: what the agent is doing, why it is blocked, the ask. */
  say: string;
}

/** The short name of the gate a waiting ticket is parked at, if it is at one. */
function gateOf(t: TicketRow): string | undefined {
  return t.rail.find((s) => s.gate?.state === "waiting")?.gate?.short;
}

type Running = Extract<Attention, { kind: "running" }>;
type Waiting = Extract<Attention, { kind: "waiting" }>;

/** An agent at work: its name, its step of all, the run and what it is doing on hover. */
function running(a: Running): StateWords {
  const step = a.progress ? stepText(a.progress) : null;
  const run = `${a.agent} · run #${String(a.run_id)}`;
  return {
    text: a.agent,
    tone: "live",
    run: { progress: a.progress, step },
    say: [run, step ? `step ${step}` : null, a.step].filter(Boolean).join(" · "),
  };
}

/** On you: its gate and You (else the ask); on someone else: where it is parked and who. */
function waiting(t: TicketRow, a: Waiting, me: Person | null): StateWords {
  const gate = gateOf(t);
  if (isMyMove(a.on, me))
    return { text: gate ? `${gate} · You` : a.ask, tone: "you", run: null, say: a.ask };
  const who = firstName(a.on?.name ?? "someone");
  return { text: `${gate ?? a.ask} · ${who}`, tone: "plain", run: null, say: `${a.ask} · ${who}` };
}

export function stateOf(t: TicketRow, me: Person | null): StateWords {
  const a = t.attention;
  switch (a.kind) {
    case "running":
      return running(a);
    case "waiting":
      return waiting(t, a, me);
    case "queued":
      return { text: "Queued", tone: "quiet", run: "queued", say: `Run #${String(a.run_id)}` };
    case "blocked":
      return { text: "Blocked", tone: "firm", run: null, say: `Blocked · ${a.reason}` };
    case "inbox":
    case "done":
      return { text: "", tone: "quiet", run: null, say: "" };
  }
}

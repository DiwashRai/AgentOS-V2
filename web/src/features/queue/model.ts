// Pure selection for My queue: only what is the viewer's. Your move (waiting on me or nobody, or
// blocked and mine or nobody's), Agents at work (every running and queued run as one line: mine
// first, then the team's by repo), Ready to start (my inbox), Done recently (mine, last 7 days).
import type { Person, TicketRow } from "../../api/types";
import { isMine, isYourMove } from "../../domain/board";
import { minutesSince } from "../../domain/format";

export const CAP = { agents: 9, done: 3 } as const;

const sinceMs = (t: TicketRow) => Date.parse(t.since);
const longestFirst = (a: TicketRow, b: TicketRow) =>
  sinceMs(a) - sinceMs(b) || a.key.localeCompare(b.key);
const newestFirst = (a: TicketRow, b: TicketRow) => sinceMs(b) - sinceMs(a);

export interface Zones {
  yourMove: TicketRow[];
  /** Every running and queued run, one line each: running before queued, mine before the team's,
   *  the team's by repo. */
  agents: TicketRow[];
  ready: TicketRow[];
  done: TicketRow[];
  running: number;
  queued: number;
  mine: number;
}

function agentsOf(rows: readonly TicketRow[], me: Person | null): TicketRow[] {
  const rank = (t: TicketRow) => Number(t.attention.kind === "queued") * 2 + Number(!isMine(t, me));
  return rows
    .filter((t) => t.attention.kind === "running" || t.attention.kind === "queued")
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.repo ?? "").localeCompare(b.repo ?? "") ||
        a.key.localeCompare(b.key),
    );
}

export function zones(rows: readonly TicketRow[], me: Person | null, now: number): Zones {
  const mine = rows.filter((t) => isMine(t, me));
  const yourMove = rows.filter((t) => isYourMove(t, me)).sort(longestFirst);
  return {
    yourMove,
    agents: agentsOf(rows, me),
    ready: mine.filter((t) => t.attention.kind === "inbox").sort(longestFirst),
    done: mine
      .filter((t) => t.attention.kind === "done" && minutesSince(t.since, now) < 7 * 1440)
      .sort(newestFirst),
    running: rows.filter((t) => t.attention.kind === "running").length,
    queued: rows.filter((t) => t.attention.kind === "queued").length,
    mine: mine.filter((t) => t.attention.kind === "running" || t.attention.kind === "queued")
      .length,
  };
}

/** "2 yours · 4 across the team". */
export function atWorkNote(z: Zones): string {
  return `${String(z.mine)} yours · ${String(Math.max(0, z.running + z.queued - z.mine))} across the team`;
}

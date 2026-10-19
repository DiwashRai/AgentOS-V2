// Pure selection for My queue: only what is the viewer's. Your move (waiting on me or nobody, or
// blocked and mine or nobody's), Agents at work (my runs as tiles, the rest of the team's in the rack), Ready
// to start (my inbox), Done recently (mine, last 7 days).
import type { Person, TicketRow } from "../../api/types";
import { isMine, isYourMove } from "../../domain/board";
import { firstName, minutesSince } from "../../domain/format";

export const CAP = { tiles: 5, done: 3 } as const;

const sinceMs = (t: TicketRow) => Date.parse(t.since);
const longestFirst = (a: TicketRow, b: TicketRow) =>
  sinceMs(a) - sinceMs(b) || a.key.localeCompare(b.key);
const newestFirst = (a: TicketRow, b: TicketRow) => sinceMs(b) - sinceMs(a);

export interface Zones {
  yourMove: TicketRow[];
  tiles: TicketRow[];
  rack: RackGroup[];
  ready: TicketRow[];
  done: TicketRow[];
  running: number;
  queued: number;
  mine: number;
}

export interface RackGroup {
  name: string;
  items: TicketRow[];
}

/** My running runs past the tiles' cap, my queued ones, then the team's other running and queued
 *  tickets by repo. */
function rackOf(rows: readonly TicketRow[], me: Person | null): RackGroup[] {
  const live = (t: TicketRow) => t.attention.kind === "running" || t.attention.kind === "queued";
  const mineRunning = rows.filter((t) => isMine(t, me) && t.attention.kind === "running");
  const mineQueued = rows.filter((t) => isMine(t, me) && t.attention.kind === "queued");
  const out: RackGroup[] = [
    { name: "Yours, running", items: mineRunning.slice(CAP.tiles) },
    { name: "Yours, waiting for a runner", items: mineQueued },
  ].filter((g) => g.items.length > 0);
  const byRepo = new Map<string, TicketRow[]>();
  for (const t of rows.filter((x) => live(x) && !isMine(x, me))) {
    const repo = t.repo ?? "No repo";
    byRepo.set(repo, [...(byRepo.get(repo) ?? []), t]);
  }
  for (const repo of [...byRepo.keys()].sort()) {
    const items = (byRepo.get(repo) ?? []).sort(
      (a, b) => Number(a.attention.kind === "queued") - Number(b.attention.kind === "queued"),
    );
    out.push({ name: repo, items });
  }
  return out;
}

export function zones(rows: readonly TicketRow[], me: Person | null, now: number): Zones {
  const mine = rows.filter((t) => isMine(t, me));
  const yourMove = rows.filter((t) => isYourMove(t, me)).sort(longestFirst);
  return {
    yourMove,
    tiles: mine.filter((t) => t.attention.kind === "running").slice(0, CAP.tiles),
    rack: rackOf(rows, me),
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

/** The line under a row's title: "Jira SUP-231 · northwind/web · Builder · run #42", or whose it is. */
export function subLine(t: TicketRow, me: Person | null): string {
  const a = t.attention;
  const parts = [t.source ? `Jira ${t.source.ref}` : null, t.repo];
  if (a.kind === "running") parts.push(a.agent, `run #${String(a.run_id)}`);
  else if (t.owner && !isMine(t, me)) parts.push(`${firstName(t.owner.name)}'s ticket`);
  return parts.filter(Boolean).join(" · ");
}

/** "2 yours · 4 across the team". */
export function atWorkNote(z: Zones): string {
  return `${String(z.mine)} yours · ${String(Math.max(0, z.running + z.queued - z.mine))} across the team`;
}

/** Shipped this week: completed in the last 7 days. */
export function shipped(done: readonly TicketRow[]): number {
  return done.filter((t) => t.attention.kind === "done" && t.attention.outcome === "completed")
    .length;
}

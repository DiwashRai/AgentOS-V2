// Pure selection for Compact: every ticket, one line each, grouped by what it waits on (for this
// viewer), filtered by `?f=` and the search.
import type { Person, TicketRow } from "../../api/types";
import {
  GROUP_MARK,
  GROUP_ORDER,
  GROUP_WORD,
  type Group,
  groupOf,
  isMyMove,
  type MarkModel,
  OUTCOME,
} from "../../domain/board";
import { matches, prefixOf } from "../../domain/format";

export function searched(rows: readonly TicketRow[], query: readonly string[]): TicketRow[] {
  return rows.filter((t) => matches([t.key, t.title, t.source?.ref ?? ""], query));
}

const sinceMs = (t: TicketRow) => Date.parse(t.since);
const longestFirst = (a: TicketRow, b: TicketRow) =>
  sinceMs(a) - sinceMs(b) || a.key.localeCompare(b.key);
const newestFirst = (a: TicketRow, b: TicketRow) =>
  sinceMs(b) - sinceMs(a) || a.key.localeCompare(b.key);
const byRepo = (a: TicketRow, b: TicketRow) =>
  (a.repo ?? "~").localeCompare(b.repo ?? "~") || longestFirst(a, b);

const ORDER: Record<Group, (a: TicketRow, b: TicketRow) => number> = {
  needs_you: longestFirst,
  blocked: longestFirst,
  waiting: longestFirst,
  running: byRepo,
  queued: byRepo,
  inbox: byRepo,
  done: newestFirst,
};

export interface CompactGroup {
  id: Group;
  title: string;
  mark: MarkModel["kind"];
  items: TicketRow[];
}

export type Section =
  | { kind: "group"; group: CompactGroup }
  | { kind: "empty"; id: Group; lead: string; note: string | null };

type Empty = Extract<Section, { kind: "empty" }>;

/** The dashed row an empty group gets (Needs you, Running, Queued only); an empty Running and
 *  Queued share one row, at Running's place. */
function emptyRow(g: Group, has: (g: Group) => boolean): Empty | null {
  if (g === "needs_you")
    return { kind: "empty", id: g, lead: "All quiet", note: "nothing needs you" };
  if (g === "running" && has("queued"))
    return { kind: "empty", id: g, lead: "Nothing running", note: null };
  if (g === "running")
    return { kind: "empty", id: g, lead: "All quiet", note: "nothing running, nothing queued" };
  if (g === "queued" && has("running"))
    return { kind: "empty", id: g, lead: "Nothing queued", note: null };
  return null;
}

/** The groups, in order, with a dashed row where an empty Needs you, Running or Queued is worth
 *  saying (only when nothing narrows the list). */
export function sections(
  rows: readonly TicketRow[],
  me: Person | null,
  showEmpty: boolean,
): Section[] {
  const has = (g: Group) => rows.some((t) => groupOf(t, me) === g);
  return GROUP_ORDER.flatMap((g): Section[] => {
    const items = rows.filter((t) => groupOf(t, me) === g).sort(ORDER[g]);
    if (items.length > 0)
      return [
        { kind: "group", group: { id: g, title: GROUP_WORD[g], mark: GROUP_MARK[g], items } },
      ];
    const empty = showEmpty ? emptyRow(g, has) : null;
    return empty ? [empty] : [];
  });
}

/** The expansion's lead: "Your move", "Waiting on", "Now". */
export function moveText(t: TicketRow, me: Person | null): { label: string; lead: string } {
  const a = t.attention;
  switch (a.kind) {
    case "waiting":
      return isMyMove(a.on, me)
        ? { label: "Your move", lead: `${a.ask}: ${t.now}` }
        : { label: "Waiting on", lead: `${a.on?.name ?? "Someone"} · ${a.ask}` };
    case "done":
      return { label: OUTCOME[a.outcome].word, lead: a.note ?? t.now };
    case "blocked":
      return { label: "Now", lead: a.reason };
    default:
      return { label: "Now", lead: t.now };
  }
}

/** "18 tickets", the projects, "4 repos" in the footer. */
export function footOf(rows: readonly TicketRow[]): {
  tickets: number;
  projects: string[];
  repos: number;
} {
  return {
    tickets: rows.length,
    projects: [...new Set(rows.map((t) => prefixOf(t.key)))].sort(),
    repos: new Set(rows.map((t) => t.repo).filter((r) => r !== null)).size,
  };
}

/** A Now chip's words: the ask for your move, else who or what and its ask ("Bea · Sign off"). */
export function chipWords(m: MarkModel): string {
  if (m.kind === "you") return m.ask ?? "Your move";
  return m.ask ? `${m.name} · ${m.ask}` : m.name;
}

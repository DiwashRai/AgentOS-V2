// Pure selection for Compact: every ticket, one line each, grouped by what it waits on (for this
// viewer), filtered by `?f=` and the search.
import type { Person, TicketRow } from "../../api/types";
import {
  GROUP_ORDER,
  GROUP_WORD,
  type GlyphModel,
  type Group,
  groupOf,
  isMine,
  isMyMove,
  markOf,
  type MarkModel,
  stepText,
} from "../../domain/board";
import { age, matches, minutesSince, prefixOf, repoShort } from "../../domain/format";

export type Filter = Group | "all";

export function parseFilter(f: string | null): Filter {
  return GROUP_ORDER.find((g) => g === f) ?? "all";
}

export function searched(rows: readonly TicketRow[], query: readonly string[]): TicketRow[] {
  return rows.filter((t) => matches([t.key, t.title, t.source?.ref ?? ""], query));
}

const MARK: Record<Group, MarkModel["kind"]> = {
  needs_you: "you",
  blocked: "blk",
  running: "run",
  queued: "queued",
  waiting: "wait",
  inbox: "idle",
  done: "done",
};

export interface Pill {
  id: Filter;
  label: string;
  count: number;
  mark?: MarkModel["kind"];
}

/** Everything, then each group; Done only while it is the filter (My queue links to it). */
export function pills(rows: readonly TicketRow[], me: Person | null, active: Filter): Pill[] {
  const shown = GROUP_ORDER.filter((g) => g !== "done" || active === "done");
  return [
    { id: "all", label: "Everything", count: rows.length },
    ...shown.map((g) => ({
      id: g,
      label: GROUP_WORD[g],
      count: rows.filter((t) => groupOf(t, me) === g).length,
      mark: MARK[g],
    })),
  ];
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

/** A group head's right slot. */
export type Summary =
  | { kind: "text"; text: string; strong?: string }
  | { kind: "note"; text: string }
  | { kind: "shipped"; n: number }
  | null;

/** "web 2 · api 1": where the work is, for groups of 4 or more. */
function byRepoText(items: readonly TicketRow[]): Summary {
  if (items.length < 4) return null;
  const n = new Map<string, number>();
  for (const t of items)
    n.set(
      t.repo ? repoShort(t.repo) : "No repo",
      (n.get(t.repo ? repoShort(t.repo) : "No repo") ?? 0) + 1,
    );
  const text = [...n.entries()]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([name, count]) => `${name} ${String(count)}`)
    .join(" · ");
  return { kind: "text", text };
}

function summaryOf(g: Group, items: readonly TicketRow[], me: Person | null, now: number): Summary {
  switch (g) {
    case "needs_you": {
      const oldest = items[0];
      return oldest ? { kind: "text", text: "Longest wait", strong: age(oldest.since, now) } : null;
    }
    case "blocked": {
      const mine = items.filter((t) => isMine(t, me)).length;
      return mine > 0 ? { kind: "text", text: "yours", strong: String(mine) } : null;
    }
    case "inbox":
      return { kind: "note", text: "Add context, then dispatch" };
    case "done": {
      const n = items.filter(
        (t) =>
          t.attention.kind === "done" &&
          t.attention.outcome === "completed" &&
          minutesSince(t.since, now) < 7 * 1440,
      ).length;
      return n > 0 ? { kind: "shipped", n } : null;
    }
    default:
      return byRepoText(items);
  }
}

export interface CompactGroup {
  id: Group;
  title: string;
  mark: MarkModel["kind"];
  items: TicketRow[];
  summary: Summary;
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
  now: number,
  showEmpty: boolean,
): Section[] {
  const has = (g: Group) => rows.some((t) => groupOf(t, me) === g);
  return GROUP_ORDER.flatMap((g): Section[] => {
    const items = rows.filter((t) => groupOf(t, me) === g).sort(ORDER[g]);
    if (items.length > 0) {
      const summary = summaryOf(g, items, me, now);
      return [
        { kind: "group", group: { id: g, title: GROUP_WORD[g], mark: MARK[g], items, summary } },
      ];
    }
    const empty = showEmpty ? emptyRow(g, has) : null;
    return empty ? [empty] : [];
  });
}
/** The Source column: "Jira · web", "web", or nothing. */
export function sourceText(t: TicketRow): string {
  return [t.source ? "Jira" : "", t.repo ? repoShort(t.repo) : ""].filter(Boolean).join(" · ");
}

/** What a line says it waits on: a chip only where it names more than the status glyph, the group
 *  and the stage do (the agent and its step count, who it waits on and for what), and the words
 *  after the title. Your move has none: its glyph, its group and its stage already say the ask. */
export interface NowLine {
  chip: MarkModel | null;
  count: string | null;
  after: string;
}

export function nowLine(t: TicketRow, me: Person | null): NowLine {
  const a = t.attention;
  switch (a.kind) {
    case "running":
      return {
        chip: markOf(a, me),
        count: a.progress ? stepText(a.progress) : null,
        after: a.step,
      };
    case "waiting":
      return { chip: isMyMove(a.on, me) ? null : markOf(a, me), count: null, after: t.now };
    case "done":
      return { chip: null, count: null, after: a.note ?? OUTCOME[a.outcome].word };
    case "blocked":
      return { chip: null, count: null, after: a.reason };
    case "inbox":
    case "queued":
      return { chip: null, count: null, after: t.now };
  }
}

const OUTCOME = {
  completed: { abandoned: false, word: "Complete" },
  abandoned: { abandoned: true, word: "Abandoned" },
} as const;

/** The Stage column's word ("Review 2/3", "Sign-off"), and the whole way for its hover. */
export function stageWord(m: GlyphModel): { word: string; path: string } {
  const round = m.round ? ` ${String(m.round.n)}/${String(m.round.of)}` : "";
  const path = m.stages
    .flatMap((st) => [
      st.name + (st.state === "skipped" ? " (skipped)" : ""),
      ...(st.gate ? [`◆ ${st.gate.label}`] : []),
    ])
    .join(" → ");
  return { word: m.label + round, path };
}

/** The stage chip's dot: the hue of the state the stage is in (the status glyph's, so a row keeps
 *  one accent), grey while it waits or nobody acts. */
export type StageDot = "neutral" | "live" | "you" | "blocked" | "done";

const DOT: Partial<Record<MarkModel["kind"], StageDot>> = {
  run: "live",
  you: "you",
  blk: "blocked",
  done: "done",
};

export function stageDot(t: TicketRow, me: Person | null): StageDot {
  return DOT[markOf(t.attention, me).kind] ?? "neutral";
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

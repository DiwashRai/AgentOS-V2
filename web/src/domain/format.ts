// Pure display helpers over server fields. They may combine fields into text; they never derive a
// state the server owns.
import type { Author, Person } from "../api/types";

/** Whole minutes from `from` to `now` (never negative). */
export function minutesSince(from: string, now: number): number {
  return Math.max(0, (now - Date.parse(from)) / 60_000);
}

/** `now`, `25m`, `3h 10m` (`1h 05m`, `2h`), `2d`. */
export function age(from: string, now: number): string {
  const total = Math.round(minutesSince(from, now));
  if (total < 1) return "now";
  if (total < 60) return `${String(total)}m`;
  if (total < 1440) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m ? `${String(h)}h ${String(m).padStart(2, "0")}m` : `${String(h)}h`;
  }
  return `${String(Math.floor(total / 1440))}d`;
}

/** How long ago, as a sentence says it: "3h 10m ago", "2d ago", "just now". */
export function ago(from: string, now: number): string {
  const a = age(from, now);
  return a === "now" ? "just now" : `${a} ago`;
}

/** How long ago in full words, as an age's tooltip says it (the cell has `age`'s units): "3 hours
 *  10 minutes ago", "2 days ago", "just now". */
export function agoInWords(from: string, now: number): string {
  const total = Math.round(minutesSince(from, now));
  if (total < 1) return "just now";
  const h = Math.floor(total / 60);
  const m = total % 60;
  const parts =
    total < 60
      ? [plural(total, "minute")]
      : total < 1440
        ? [plural(h, "hour"), ...(m ? [plural(m, "minute")] : [])]
        : [plural(Math.floor(total / 1440), "day")];
  return `${parts.join(" ")} ago`;
}

/** The time of day, "10:48". */
export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Elapsed run time as `m:ss`. */
export function elapsed(from: string, now: number): string {
  const s = Math.max(0, Math.floor((now - Date.parse(from)) / 1000));
  return `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, "0")}`;
}

/** The noun a count takes: "query" for 1, "queries" for any other. */
export function nounFor(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

/** "1 query", "2 queries". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${String(n)} ${nounFor(n, one, many)}`;
}

/** A size in bytes as people read it: 312 B, 1.4 KB. */
export function sizeText(bytes: number): string {
  return bytes < 1024 ? `${String(bytes)} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

/** The search box's terms: lowercased, split on whitespace; none matches everything. */
export function terms(q: string): readonly string[] {
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every term is a substring of one of the fields. */
export function matches(fields: readonly string[], query: readonly string[]): boolean {
  const hay = fields.join("\n").toLowerCase();
  return query.every((t) => hay.includes(t));
}

/** "NW-14" → "NW"; a bare prefix is its own project. */
export function prefixOf(key: string): string {
  const dash = key.lastIndexOf("-");
  return dash > 0 ? key.slice(0, dash).toUpperCase() : key.toUpperCase();
}

/** "northwind/web" → "web". */
export function repoShort(name: string): string {
  return name.split("/").pop() ?? name;
}

/** "Ada Park" → "Ada". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Who someone is, as a face and a name say it (patterns/who.tsx): a person (the seed keeps their
 *  face's hue), a ticket's run, AgentOS itself (a run no person started), or nobody (Unassigned). */
export type Someone =
  | { kind: "person"; name: string; seed: string }
  | { kind: "run"; id: number; ticket: string }
  | { kind: "agentos" }
  | { kind: "nobody" };

/** An owner: a person or nobody. */
export const fromPerson = (p: Person | null): Someone =>
  p ? { kind: "person", name: p.name, seed: String(p.id) } : { kind: "nobody" };

/** Who started a run: a person, or AgentOS when none did (`Run.by` is null). */
export const fromStarter = (p: Person | null): Someone => (p ? fromPerson(p) : { kind: "agentos" });

/** Who wrote a version: a person or a ticket's run. */
export const fromAuthor = (a: Author): Someone =>
  a.kind === "person" ? fromPerson(a.person) : { kind: "run", id: a.run_id, ticket: a.ticket };

/** A Jira assignee: a name with no id here, so the name is its seed. */
export const fromAssignee = (name: string | null): Someone =>
  name === null ? { kind: "nobody" } : { kind: "person", name, seed: name };

/** Their name, the first in a list's cell ("Ada", "Run #42") and in full elsewhere ("Ada Park",
 *  "Run #42 on NW-17"); nobody is Unassigned. */
export function nameOf(s: Someone, full: boolean): string {
  if (s.kind === "nobody") return "Unassigned";
  if (s.kind === "agentos") return "AgentOS";
  if (s.kind === "run")
    return full ? `Run #${String(s.id)} on ${s.ticket}` : `Run #${String(s.id)}`;
  return full ? s.name : firstName(s.name);
}

/** "Bea Quinn", or "Run #42 on NW-17" for a version a ticket's run wrote. */
export const authorName = (a: Author): string => nameOf(fromAuthor(a), true);

/** Who changed a workflow last and when, as the editor's bar and the ticket's tab say it: "Ada
 *  Park · 2d ago", or "Run #42 on NW-17 · 35m ago". */
export function authorText(by: Author, at: string, now: number): string {
  return `${authorName(by)} · ${ago(at, now)}`;
}

/** A description's paragraphs: its lead (the first), and the rest. */
export function paragraphs(text: string): { lead: string; rest: string[] } {
  const [lead = "", ...rest] = text.split("\n\n");
  return { lead, rest };
}

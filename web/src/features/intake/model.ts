// Pure selection for Intake over the server's answer (`GET /api/jira/intake`): which rows a group
// shows, and the words around them.
import type { Intake, IntakeIssue, IntakeQuery } from "../../api/types";
import { age, matches, plural, prefixOf } from "../../domain/format";

/** Rows a group shows before "Show all". */
export const ROW_CAP = 8;

export function issuesOf(q: IntakeQuery, query: readonly string[]): readonly IntakeIssue[] {
  if (q.result.kind === "error") return [];
  return q.result.issues.filter((i) => matches([i.key, i.title], query));
}

/** The top bar's "N to take in": distinct issues across every query (one in two queries counts once). */
export function toTakeIn(intake: Intake): number {
  return new Set(
    intake.queries.flatMap((q) =>
      q.result.kind === "issues" ? q.result.issues.map((i) => i.key) : [],
    ),
  ).size;
}

export function visible<T>(
  items: readonly T[],
  expanded: boolean,
): { shown: readonly T[]; rest: number } {
  if (expanded || items.length <= ROW_CAP) return { shown: items, rest: 0 };
  return { shown: items.slice(0, ROW_CAP), rest: items.length - ROW_CAP };
}

/** "50 of 73 match", when Jira matched more than the server listed. */
export function headSummary(q: IntakeQuery): string | null {
  if (q.result.kind === "error" || q.result.total <= q.result.issues.length) return null;
  return `${String(q.result.issues.length)} of ${String(q.result.total)} match`;
}

/** The project chip on a group head: the one prefix every issue shares, else none. */
export function sharedPrefix(q: IntakeQuery): string | null {
  if (q.result.kind === "error") return null;
  const prefixes = new Set(q.result.issues.map((i) => prefixOf(i.key)));
  return prefixes.size === 1 ? ([...prefixes][0] ?? null) : null;
}

/** "Open in Jira" for a query's JQL. */
export function jqlHref(jiraUrl: string, jql: string): string {
  return `${jiraUrl.replace(/\/+$/, "")}/issues/?jql=${encodeURIComponent(jql)}`;
}

/** The footer: "3 queries · 1 didn't answer · checked 2m ago". */
export function footNote(intake: Intake, now: number): string {
  const failing = intake.queries.filter((q) => q.result.kind === "error").length;
  const checked = age(intake.checked_at, now);
  return [
    plural(intake.queries.length, "query", "queries"),
    failing > 0 ? `${String(failing)} didn't answer` : null,
    checked === "now" ? "checked just now" : `checked ${checked} ago`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** What an empty group says: nothing matches the query, or nothing matches the search. */
export function emptyText(q: IntakeQuery, searching: boolean): { lead: string; note: string } {
  const listed = q.result.kind === "issues" && q.result.issues.length > 0;
  return searching && listed
    ? { lead: "No match", note: "nothing here matches the search" }
    : { lead: "All quiet", note: "nothing new matches this query" };
}

export const TYPE_WORD: Record<IntakeIssue["type"], string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
};

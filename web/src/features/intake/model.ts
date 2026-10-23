// Pure selection for Intake over the server's answer (`GET /api/jira/intake`): which rows a group
// shows, and the words around them.
import type { Intake, IntakeIssue, IntakeQuery } from "../../api/types";
import { age, matches, prefixOf } from "../../domain/format";

/** Rows a group shows before "Show all": few enough that a screen holds every group's head. */
export const ROW_CAP = 6;

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

/** The project chip on a group head: the one prefix every issue shares; with no issues to ask
 *  (an empty or failing query), the one project its JQL names (`project = PLAT`); else none. */
export function sharedPrefix(q: IntakeQuery): string | null {
  const keys = q.result.kind === "issues" ? q.result.issues.map((i) => i.key) : [];
  const prefixes = new Set(keys.length > 0 ? keys.map(prefixOf) : projectsOf(q.jql));
  return prefixes.size === 1 ? ([...prefixes][0] ?? null) : null;
}

function projectsOf(jql: string): string[] {
  if (/\bproject\s+in\b/i.test(jql)) return [];
  return [...jql.matchAll(/\bproject\s*=\s*"?([A-Z][A-Z0-9_]*)"?/gi)].map((m) =>
    (m[1] ?? "").toUpperCase(),
  );
}

const TYPE_WORD: Record<IntakeIssue["type"], string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
};

const PRIORITY_WORD: Record<IntakeIssue["priority"], string> = {
  high: "High priority",
  normal: "Normal priority",
  low: "Low priority",
};

/** A Jira status in the app's glyphs, from the words Jira's workflows use for it: finished, under
 *  way (someone else's, so the waiting ring), or not started. */
export function statusMark(status: string): "done" | "wait" | "idle" {
  const s = status.toLowerCase();
  if (/done|closed|resolved|shipped/.test(s)) return "done";
  if (/progress|review|doing|testing/.test(s)) return "wait";
  return "idle";
}

/** Everything the meta line leaves out, for its tooltip: "Bug · To Do · High priority". */
export function issueFacts(issue: IntakeIssue): string {
  return [TYPE_WORD[issue.type], issue.status, PRIORITY_WORD[issue.priority]].join(" · ");
}

/** A row's age as Linear writes it, in its one largest unit: "14m ago", "1h ago", "just now". */
export function ageLabel(updatedAt: string, now: number): string {
  const full = age(updatedAt, now);
  return full === "now" ? "just now" : `${full.split(" ")[0] ?? full} ago`;
}

/** The age's tooltip, to the minute: "Updated 1h 10m ago". */
export function ageTitle(updatedAt: string, now: number): string {
  const full = age(updatedAt, now);
  return full === "now" ? "Updated just now" : `Updated ${full} ago`;
}

/** "Open in Jira" for a query's JQL. */
export function jqlHref(jiraUrl: string, jql: string): string {
  return `${jiraUrl.replace(/\/+$/, "")}/issues/?jql=${encodeURIComponent(jql)}`;
}

/** The footer: "1 didn't answer · checked 2m ago" (the head already counts the queries). */
export function footNote(intake: Intake, now: number): string {
  const failing = intake.queries.filter((q) => q.result.kind === "error").length;
  const checked = age(intake.checked_at, now);
  return [
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

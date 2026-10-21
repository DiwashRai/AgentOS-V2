// Who changed a workflow last and when, as the editor's bar and the ticket's tab say it.
import type { Author } from "../../api/types";
import { age } from "../../domain/format";

/** "Ada Park · 2d ago", or "run #42 on NW-17 · 35m ago". */
export function authorText(by: Author, at: string, now: number): string {
  const who = by.kind === "person" ? by.person.name : `run #${String(by.run_id)} on ${by.ticket}`;
  const when = age(at, now);
  return `${who} · ${when === "now" ? "just now" : `${when} ago`}`;
}

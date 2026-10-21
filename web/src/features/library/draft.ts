// An item editor's draft and what it was edited from, and the two states the spec draws that a
// static build can't reach on its own, as stills (`?still=edited`, `?still=conflict`), as the kit
// draws a drag in progress as a still: an edit, and a save refused because someone else saved first.
import type { Author, ItemBody, Iso } from "../../api/types";

/** What an item editor edits: the content, and a library item's name (a file's path) and
 *  description; an empty string where the item has none. */
export interface Draft {
  body: ItemBody;
  name: string;
  description: string;
}

/** The version a draft was edited from: its content as stored, and who saved it when. */
export interface Stored {
  draft: Draft;
  version: number;
  at: Iso;
  by: Author;
}

export type Still = "edited" | "conflict";

export function stillOf(raw: string | null): Still | null {
  return raw === "edited" || raw === "conflict" ? raw : null;
}

export function sameDraft(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Text with a line added at its end. */
const addLine = (text: string, line: string) => `${text.trimEnd()}\n${line}`;

/** Text with its first list item reworded. */
function reword(text: string, tail: string): string {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith("- "));
  const i = at < 0 ? lines.length - 1 : at;
  return lines.map((l, k) => (k === i ? `${l.replace(/\.$/, "")}${tail}` : l)).join("\n");
}

/** One edit to a body: `mine` adds a line at the end, else the first list item is reworded (and an
 *  agent thinks harder), so the two sides of a conflict differ in different places. */
function edit(body: ItemBody, mine: boolean): ItemBody {
  const change = (t: string) =>
    mine
      ? addLine(t, "- Say what you changed and why in notes/changes.md.")
      : reword(t, ", and say why.");
  switch (body.kind) {
    case "text":
      return { kind: "text", text: change(body.text) };
    case "blocks":
      return {
        kind: "blocks",
        blocks: body.blocks.map((b, i) =>
          i === body.blocks.length - 1 ? { ...b, text: change(b.text) } : b,
        ),
      };
    case "agent":
      return {
        kind: "agent",
        agent: {
          ...body.agent,
          instructions: change(body.agent.instructions),
          ...(mine ? {} : { effort: "xhigh" }),
        },
      };
  }
}

/** The still's own edit: yours. */
export const myEdit = (d: Draft): Draft => ({ ...d, body: edit(d.body, true) });

/** The still's conflict: what someone else saved meanwhile. */
export const theirEdit = (d: Draft): Draft => ({ ...d, body: edit(d.body, false) });

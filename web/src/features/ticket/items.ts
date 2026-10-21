// A ticket's context items as its Context tab and its item editor name them: each kind's glyph and
// word, the name a person knows it by (an agent or a skill by its library name, a file by its path),
// where its library item lives, what its content is called, and which of the ticket's stages get it.
import type { ItemKind, ItemSummary, TicketWorkflow } from "../../api/types";
import type { IconName } from "../../kit";

export const KIND: Record<ItemKind, { icon: IconName; word: string; library: string }> = {
  instructions: { icon: "files", word: "Instructions", library: "files" },
  skill: { icon: "skills", word: "Skill", library: "skills" },
  agent: { icon: "agents", word: "Agent", library: "agents" },
  note: { icon: "compose", word: "Notes", library: "files" },
  plan: { icon: "compact", word: "Plan", library: "files" },
  file: { icon: "files", word: "File", library: "files" },
  workflow: { icon: "workflow", word: "Workflow", library: "workflows" },
};

/** An agent or a skill by its library name (Builder, tests); a file, the plan and notes by path. */
export function labelOf(i: ItemSummary): string {
  const named = i.kind === "agent" || i.kind === "skill";
  return named && i.origin.kind === "copy" ? i.origin.of.name : i.name;
}

/** The words over its content, as the library's own editor says them. */
export function contentTitle(i: ItemSummary, blocks: boolean): string {
  if (i.kind === "agent") return "Instructions";
  if (i.kind === "skill") return "SKILL.md";
  return blocks ? "Blocks, in the order agents read them" : "Content";
}

/** The library item's editor, for a copy. */
export const libraryHref = (i: ItemSummary): string | null =>
  i.origin.kind === "copy" ? `/library/${KIND[i.kind].library}/${i.origin.of.id}` : null;

/** The stages of the ticket's workflow that get it: every stage (the workflow's own context), the
 *  ones naming it, or none (the plan and notes, which no stage is given by name). */
export function stagesOf(i: ItemSummary, w: TicketWorkflow): string {
  if (i.origin.kind === "own") return "No stage";
  const id = i.origin.of.id;
  const ref = i.kind === "skill" ? "skills" : "files";
  if (i.kind !== "agent" && w.context[ref].includes(id)) return "Every stage";
  const names = w.stages
    .filter((s) =>
      i.kind === "agent" ? s.kind === "agent" && s.agent === id : s.context[ref].includes(id),
    )
    .map((s) => s.name);
  return names.length > 0 ? names.join(", ") : "No stage";
}

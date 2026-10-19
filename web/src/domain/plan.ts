// A plan item's content (a TASKS.md checklist) as items: `- [x] text` is done, `- [ ] text` open,
// and a `## Heading` opens a section for the items after it. Anything else is not a task.

export interface PlanItem {
  text: string;
  done: boolean;
  section?: string;
}

const TASK = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parsePlan(content: string): PlanItem[] {
  const out: PlanItem[] = [];
  let section: string | undefined;
  for (const line of content.split("\n")) {
    const heading = HEADING.exec(line);
    if (heading?.[1]) {
      section = heading[1].trim();
      continue;
    }
    const task = TASK.exec(line);
    if (!task?.[2]) continue;
    out.push({ text: task[2].trim(), done: task[1] !== " ", ...(section ? { section } : {}) });
    section = undefined;
  }
  return out;
}

/** The items alone, as a short list shows them (an expanded row, the peek). */
export function unsectioned(items: readonly PlanItem[]): PlanItem[] {
  return items.map((i) => ({ text: i.text, done: i.done }));
}

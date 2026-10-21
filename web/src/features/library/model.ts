// The library screens' pure helpers: who changed an item, its size, how an item's content reads
// as lines (for the version conflict's two sides), and those two sides lined up row by row,
// each line marked by whether its own side changed it.
import type { Author, Block, ItemBody, Runtime } from "../../api/types";
import { anchors } from "./merge";

/** "Bea Quinn", or "Run #42 on NW-17" for a version a ticket's run wrote. */
export function authorName(a: Author): string {
  return a.kind === "person" ? a.person.name : `Run #${String(a.run_id)} on ${a.ticket}`;
}

/** A size in bytes as people read it: 312 B, 1.4 KB. */
export function sizeText(bytes: number): string {
  return bytes < 1024 ? `${String(bytes)} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export function runtimeName(runtimes: readonly Runtime[], id: string): string {
  return runtimes.find((r) => r.id === id)?.name ?? id;
}

/** A block's first line of text, for the line a folded block shows. */
export function firstLine(b: Block): string {
  return b.text.split("\n").find((l) => l.trim() !== "") ?? "";
}

/** An item's content as the lines the conflict compares: an agent's settings, then its
 *  instructions; AGENTS.md's blocks under their names. */
export function bodyLines(body: ItemBody, runtimes: readonly Runtime[]): string[] {
  switch (body.kind) {
    case "text":
      return body.text.split("\n");
    case "blocks":
      return body.blocks.flatMap((b, i) => [
        ...(i ? [""] : []),
        `## ${b.name}`,
        "",
        ...b.text.split("\n"),
      ]);
    case "agent": {
      const a = body.agent;
      return [
        `Runtime: ${runtimeName(runtimes, a.runtime)}`,
        `Model: ${a.model}`,
        `Effort: ${a.effort}`,
        "",
        ...a.instructions.split("\n"),
      ];
    }
  }
}

/** A draft as the conflict's lines: a library item's name and description, then its content. */
export function draftLines(
  d: { name: string; description: string; body: ItemBody },
  runtimes: readonly Runtime[],
): string[] {
  const head = [
    ...(d.name ? [`Name: ${d.name}`] : []),
    ...(d.description ? [`Description: ${d.description}`] : []),
  ];
  return [...head, ...(head.length ? [""] : []), ...bodyLines(d.body, runtimes)];
}

export interface Cell {
  text: string;
  /** Its side changed it from the version both started from. */
  changed: boolean;
}
/** One row of the two sides: a line on each, or a line on one side and a gap on the other. */
export type Pair = readonly [Cell | null, Cell | null];

export interface Side {
  lines: readonly string[];
  /** Per line, whether this side changed it from the version both started from. */
  changed: readonly boolean[];
}

const cellOf = (s: Side, i: number, end: number): Cell | null =>
  i < end ? { text: s.lines[i] ?? "", changed: s.changed[i] ?? false } : null;

/** Two versions lined up: the lines both have level, each run of lines only one has beside the
 *  other's run; each line marked by whether its own side changed it. */
export function pairLines(a: Side, b: Side): Pair[] {
  const out: Pair[] = [];
  let i = 0;
  let j = 0;
  for (const [ai, bj] of [
    ...anchors(a.lines, b.lines),
    [a.lines.length, b.lines.length] as const,
  ]) {
    for (let k = 0; k < Math.max(ai - i, bj - j); k++)
      out.push([cellOf(a, i + k, ai), cellOf(b, j + k, bj)]);
    if (ai < a.lines.length) out.push([cellOf(a, ai, ai + 1), cellOf(b, bj, bj + 1)]);
    i = ai + 1;
    j = bj + 1;
  }
  return out;
}

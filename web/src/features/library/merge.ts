// A version conflict, three ways: what each side changed from the version both started from (the
// base), line by line, and the two put together: yours, plus each of their changes that doesn't
// touch one of yours. A change of theirs that does touch yours is dropped, and counted, so the
// screen can say what Keep mine gives up.
import type { AgentSettings, Block, ItemBody } from "../../api/types";
import type { Draft } from "./draft";

/** The longest common subsequence's lengths, from the end: `t[i][j]` for `a[i..]` and `b[j..]`. */
function lcsTable(a: readonly string[], b: readonly string[]): number[][] {
  const t = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    const row = t[i] ?? [];
    const below = t[i + 1] ?? [];
    for (let j = b.length - 1; j >= 0; j--)
      row[j] = a[i] === b[j] ? (below[j + 1] ?? 0) + 1 : Math.max(below[j] ?? 0, row[j + 1] ?? 0);
  }
  return t;
}

/** The lines two texts share, in order, as index pairs (a's, b's). */
export function anchors(a: readonly string[], b: readonly string[]): [number, number][] {
  const t = lcsTable(a, b);
  const out: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) out.push([i++, j++]);
    else if ((t[i + 1]?.[j] ?? 0) >= (t[i]?.[j + 1] ?? 0)) i++;
    else j++;
  }
  return out;
}

/** For each line of `side`, whether it changed from `base` (it isn't one they share). */
export function changedFrom(base: readonly string[], side: readonly string[]): boolean[] {
  const kept = new Set(anchors(base, side).map(([, j]) => j));
  return side.map((_, j) => !kept.has(j));
}

/** One change: base lines `start` to `end` (none, for an insert) became `lines`. */
interface Hunk {
  start: number;
  end: number;
  lines: readonly string[];
}

function hunks(base: readonly string[], side: readonly string[]): Hunk[] {
  const out: Hunk[] = [];
  let b = 0;
  let s = 0;
  for (const [i, j] of [...anchors(base, side), [base.length, side.length] as const]) {
    if (i > b || j > s) out.push({ start: b, end: i, lines: side.slice(s, j) });
    b = i + 1;
    s = j + 1;
  }
  return out;
}

/** Two changes touch: their base lines overlap, or one inserts where the other is. */
function touch(a: Hunk, b: Hunk): boolean {
  const insert = a.start === a.end || b.start === b.end;
  return insert ? a.start <= b.end && b.start <= a.end : a.start < b.end && b.start < a.end;
}

const same = (a: Hunk, b: Hunk) =>
  a.start === b.start && a.end === b.end && a.lines.join("\n") === b.lines.join("\n");

export interface Merged<T> {
  value: T;
  /** How many of their changed lines it leaves out, because yours changed the same place. */
  dropped: number;
}

export function mergeText(base: string, mine: string, theirs: string): Merged<string> {
  const b = base.split("\n");
  const mh = hunks(b, mine.split("\n"));
  const th = hunks(b, theirs.split("\n"));
  const kept = th.filter((h) => !mh.some((m) => touch(m, h)));
  const lost = th.filter((h) => !kept.includes(h) && !mh.some((m) => same(m, h)));
  const out: string[] = [];
  let at = 0;
  for (const h of [...mh, ...kept].sort((x, y) => x.start - y.start)) {
    out.push(...b.slice(at, h.start), ...h.lines);
    at = h.end;
  }
  out.push(...b.slice(at));
  const dropped = lost.reduce((n, h) => n + Math.max(h.lines.length, h.end - h.start), 0);
  return { value: out.join("\n"), dropped };
}

/** One value: theirs if you left it, yours if you changed it (theirs dropped if it differs). */
function pick<T>(base: T, mine: T, theirs: T): Merged<T> {
  if (mine === base) return { value: theirs, dropped: 0 };
  return { value: mine, dropped: theirs === base || theirs === mine ? 0 : 1 };
}

function sum<T>(value: T, parts: readonly Merged<unknown>[]): Merged<T> {
  return { value, dropped: parts.reduce((n, p) => n + p.dropped, 0) };
}

function mergeAgent(b: AgentSettings, m: AgentSettings, t: AgentSettings): Merged<ItemBody> {
  const runtime = pick(b.runtime, m.runtime, t.runtime);
  const model = pick(b.model, m.model, t.model);
  const effort = pick(b.effort, m.effort, t.effort);
  const instructions = mergeText(b.instructions, m.instructions, t.instructions);
  const agent = {
    runtime: runtime.value,
    model: model.value,
    effort: effort.value,
    instructions: instructions.value,
  };
  return sum({ kind: "agent", agent }, [runtime, model, effort, instructions]);
}

/** AGENTS.md: each of your blocks merged with the same-named block of theirs; a reorder or a new
 *  block of theirs that yours doesn't have counts as one dropped change. */
function mergeBlocks(b: readonly Block[], m: readonly Block[], t: readonly Block[]) {
  const named = (bs: readonly Block[], name: string) => bs.find((x) => x.name === name);
  const parts = m.map((x) => {
    const bb = named(b, x.name);
    const tt = named(t, x.name);
    return bb && tt ? mergeText(bb.text, x.text, tt.text) : { value: x.text, dropped: 0 };
  });
  const order = (bs: readonly Block[]) => bs.map((x) => x.name).join("\n");
  const moved = order(t) !== order(b) && order(t) !== order(m) ? 1 : 0;
  const blocks = m.map((x, i) => ({ ...x, text: parts[i]?.value ?? x.text }));
  return sum<ItemBody>({ kind: "blocks", blocks }, [...parts, { value: null, dropped: moved }]);
}

const yours = (m: ItemBody): Merged<ItemBody> => ({ value: m, dropped: 0 });

export function mergeBody(b: ItemBody, m: ItemBody, t: ItemBody): Merged<ItemBody> {
  if (m.kind === "text") {
    if (b.kind !== "text" || t.kind !== "text") return yours(m);
    const r = mergeText(b.text, m.text, t.text);
    return { value: { kind: "text", text: r.value }, dropped: r.dropped };
  }
  if (m.kind === "agent")
    return b.kind === "agent" && t.kind === "agent"
      ? mergeAgent(b.agent, m.agent, t.agent)
      : yours(m);
  return b.kind === "blocks" && t.kind === "blocks"
    ? mergeBlocks(b.blocks, m.blocks, t.blocks)
    : yours(m);
}

export function mergeDraft(base: Draft, mine: Draft, theirs: Draft): Merged<Draft> {
  const name = pick(base.name, mine.name, theirs.name);
  const description = pick(base.description, mine.description, theirs.description);
  const body = mergeBody(base.body, mine.body, theirs.body);
  return sum({ name: name.value, description: description.value, body: body.value }, [
    name,
    description,
    body,
  ]);
}

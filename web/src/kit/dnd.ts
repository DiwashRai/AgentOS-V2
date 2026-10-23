// Drag and drop on the platform's own HTML drag events (no library): a dragged thing carries a
// payload under its kind's media type, so a target can tell while hovering whether it takes it
// (the browser hides the data itself until the drop). Nested targets: the innermost one that takes
// a drag claims the event, and the ones around it see the claim and stand down.
import type { DragEvent } from "react";

/** What is dragged: its kind (agent, skill, file…) and its id. */
export interface DragPayload {
  kind: string;
  id: string;
}

const mime = (kind: string) => `application/x-agentos-${kind.toLowerCase()}`;

export function startDrag(e: DragEvent, p: DragPayload, effect: "copy" | "move") {
  e.dataTransfer.setData(mime(p.kind), p.id);
  e.dataTransfer.effectAllowed = effect;
}

/** The kind among `kinds` this drag carries, if any. */
export function kindOf(e: DragEvent, kinds: readonly string[]): string | null {
  return kinds.find((k) => e.dataTransfer.types.includes(mime(k))) ?? null;
}

/** The dragged payload, at the drop (when the data can be read). */
export function payloadOf(e: DragEvent, kind: string): DragPayload {
  return { kind, id: e.dataTransfer.getData(mime(kind)) };
}

const claims = new WeakSet<Event>();

/** This target takes the event; the targets around it leave it. */
export function claim(e: DragEvent) {
  claims.add(e.nativeEvent);
}

export function claimed(e: DragEvent): boolean {
  return claims.has(e.nativeEvent);
}

/** The pointer left this element for something outside it (not one of its own children). */
export function left(e: DragEvent): boolean {
  const to = e.relatedTarget;
  return !(to instanceof Node && e.currentTarget.contains(to));
}

// A list whose rows are reordered by dragging (a workflow's stages, AGENTS.md's blocks): each row
// has a handle in the gutter at its left; a drag draws a drop line where the row will land. The
// handle also moves its row with ↑ and ↓, and a polite live region says where it went. It can
// take drops from outside too (an agent dropped between stages), at the slot the line marks.
import { type DragEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

import s from "./Drag.module.css";
import u from "./unseen.module.css";
import { claim, claimed, type DragPayload, kindOf, left, payloadOf, startDrag } from "./dnd";
import { Icon } from "./Icon";
import { type Space, space, vars } from "./vars";

export interface SortItem {
  id: string;
  /** Its name, for the handle ("Move Implement") and what the live region says. */
  label: string;
  content: ReactNode;
}

export interface SortableProps {
  /** The list's accessible name. */
  label: string;
  items: readonly SortItem[];
  /** Move the row at `from` so it ends at index `to`. */
  onMove: (from: number, to: number) => void;
  /** Kinds dropped in from outside (agent), between rows. */
  accept?: readonly string[];
  /** One of those, dropped at slot `at` (0 before the first row, the length after the last). */
  onDrop?: (payload: DragPayload, at: number) => void;
  /** The space between rows. */
  gap?: Space;
  /** Draw the drop line at this slot: a still of a drag in progress. */
  preview?: number;
  /** Keep the handles' gutter at the list's left (the default); a Lane, which keeps one for its
   *  loop bands too, turns it off. */
  gutter?: boolean;
}

/** Which row draws the drop line for `slot`, and on which side: the row it lands before, or
 *  after the last row. */
function lineAt(slot: number | null, i: number, n: number): "before" | "after" | undefined {
  if (slot === i) return "before";
  return slot === n && i === n - 1 ? "after" : undefined;
}

/** The slot a drag at height `y` is over: before the first row whose middle is below it. */
function slotAt(list: HTMLElement | null, y: number): number {
  const rows = [...(list?.querySelectorAll<HTMLElement>(":scope > [data-sort-id]") ?? [])];
  const i = rows.findIndex((el) => {
    const r = el.getBoundingClientRect();
    return y < r.top + r.height / 2;
  });
  return i < 0 ? rows.length : i;
}

const STEP: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };

export function Sortable({
  label,
  items,
  onMove,
  gutter = true,
  accept = [],
  onDrop,
  gap = 0,
  preview,
}: SortableProps) {
  const own = `sort-${useId().replace(/[^a-z0-9]/gi, "")}`;
  const list = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [from, setFrom] = useState<number | null>(null);
  const [said, setSaid] = useState("");
  // After a move by keys, focus goes back to the moved row's handle.
  const refocus = useRef<string | null>(null);
  useEffect(() => {
    const id = refocus.current;
    refocus.current = null;
    if (id !== null)
      list.current
        ?.querySelector<HTMLElement>(`[data-sort-id="${CSS.escape(id)}"] > [data-grip]`)
        ?.focus();
  });

  const move = (i: number, to: number) => {
    const it = items[i];
    if (!it || to < 0 || to >= items.length || to === i) return;
    onMove(i, to);
    refocus.current = it.id;
    setSaid(`${it.label}: ${String(to + 1)} of ${String(items.length)}`);
  };
  const over = (e: DragEvent) => {
    const mine = kindOf(e, [own]) !== null;
    if (claimed(e) || (!mine && kindOf(e, accept) === null)) {
      setSlot(null);
      return;
    }
    e.preventDefault();
    claim(e);
    e.dataTransfer.dropEffect = mine ? "move" : "copy";
    setSlot(slotAt(list.current, e.clientY));
  };
  const drop = (e: DragEvent) => {
    setSlot(null);
    const at = slotAt(list.current, e.clientY);
    const ext = kindOf(e, accept);
    if (claimed(e)) return;
    if (kindOf(e, [own]) !== null && from !== null) {
      e.preventDefault();
      claim(e);
      move(from, at > from ? at - 1 : at);
    } else if (ext !== null && onDrop) {
      e.preventDefault();
      claim(e);
      onDrop(payloadOf(e, ext), at);
    }
  };
  const shown = slot ?? preview ?? null;
  return (
    <div
      ref={list}
      role="list"
      aria-label={label}
      className={s.sortable}
      data-gutter={gutter ? undefined : "none"}
      style={vars({ "--gap": space(gap) })}
      onDragOver={over}
      onDragLeave={(e) => {
        if (left(e)) setSlot(null);
      }}
      onDrop={drop}
    >
      {items.map((it, i) => (
        <div
          key={it.id}
          role="listitem"
          className={s.slot}
          data-sort-id={it.id}
          data-drop={lineAt(shown, i, items.length)}
          data-dragging={from === i || undefined}
        >
          <button
            type="button"
            className={s.grip}
            data-grip
            draggable
            aria-label={`Move ${it.label}`}
            title="Drag to move, or ↑ ↓"
            onDragStart={(e) => {
              startDrag(e, { kind: own, id: it.id }, "move");
              const row = e.currentTarget.parentElement;
              const r = row?.getBoundingClientRect();
              if (row && r) e.dataTransfer.setDragImage(row, e.clientX - r.left, e.clientY - r.top);
              setFrom(i);
            }}
            onDragEnd={() => {
              setFrom(null);
              setSlot(null);
            }}
            onKeyDown={(e) => {
              const d = STEP[e.key];
              if (d === undefined) return;
              e.preventDefault();
              move(i, i + d);
            }}
          >
            <Icon name="grip" />
          </button>
          {it.content}
        </div>
      ))}
      <span className={u.unseen} aria-live="polite">
        {said}
      </span>
    </div>
  );
}

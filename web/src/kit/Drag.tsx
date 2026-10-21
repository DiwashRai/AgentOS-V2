// A thing to drag from a palette onto a target (an agent, a skill or a file from the library
// panel), drawn as a small card. Clicking it, or Enter or Space on it, is the alternative to
// dragging (add it to the selected stage).
import { type ReactNode, useState } from "react";

import s from "./Drag.module.css";
import { type DragPayload, startDrag } from "./dnd";

export interface DragProps {
  /** What it carries: its kind (which targets take it) and its id. */
  payload: DragPayload;
  /** Its accessible name and tooltip, saying what a click does. */
  label: string;
  /** The click and keyboard alternative to dragging it. */
  onClick?: () => void;
  /** The card's content. */
  children: ReactNode;
}

export function Drag({ payload, label, onClick, children }: DragProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      className={s.drag}
      data-dragging={dragging || undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onClick?.();
      }}
      onDragStart={(e) => {
        startDrag(e, payload, "copy");
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
      }}
    >
      {children}
    </div>
  );
}

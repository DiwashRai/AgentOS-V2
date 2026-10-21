// A place a dragged thing can land (a stage's card, the workflow-context strip): while a drag it
// takes is over it, it is ringed in your move's accent and says what a drop does. Inside another
// target or a Sortable, the innermost one that takes the drag wins.
import { type ReactNode, useState } from "react";

import s from "./Drag.module.css";
import { claim, claimed, type DragPayload, kindOf, left, payloadOf } from "./dnd";

export interface DropProps {
  /** The kinds it takes (agent, skill, file). */
  accept: readonly string[];
  onDrop: (payload: DragPayload) => void;
  /** What a drop here does ("Add to Implement"), shown on its ring while a drag is over it. */
  label: string;
  children: ReactNode;
  /** Drawn as under a drag: a still of one in progress. */
  over?: boolean;
}

export function Drop({ accept, onDrop, label, children, over }: DropProps) {
  const [hover, setHover] = useState(false);
  const lit = hover || over === true;
  return (
    <div
      className={s.drop}
      data-over={lit || undefined}
      onDragOver={(e) => {
        if (claimed(e) || kindOf(e, accept) === null) {
          setHover(false);
          return;
        }
        e.preventDefault();
        claim(e);
        e.dataTransfer.dropEffect = "copy";
        setHover(true);
      }}
      onDragLeave={(e) => {
        if (left(e)) setHover(false);
      }}
      onDrop={(e) => {
        setHover(false);
        const kind = kindOf(e, accept);
        if (claimed(e) || kind === null) return;
        e.preventDefault();
        claim(e);
        onDrop(payloadOf(e, kind));
      }}
    >
      {children}
      {lit ? <span className={s.hint}>{label}</span> : null}
    </div>
  );
}

import type { ReactNode } from "react";

import s from "./Swap.module.css";

export interface SwapProps {
  /** What the slot shows at rest (an age). */
  children: ReactNode;
  /** What takes its place while its row is hovered or holds focus (the row's one action). It
   *  stays in the tab order, so the keyboard reaches it and brings it out. */
  hover: ReactNode;
}

/** One slot at a row's end, two states: quiet at rest, the row's action under the pointer. Both
 *  share one cell, so the row never changes size. */
export function Swap({ children, hover }: SwapProps) {
  return (
    <span className={s.swap}>
      <span className={s.rest}>{children}</span>
      <span className={s.hover}>{hover}</span>
    </span>
  );
}

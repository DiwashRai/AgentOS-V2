// Two versions of one text side by side (a version conflict: yours and the one saved meanwhile),
// line against line in monospace: the lines both have level with each other, the lines each side
// changed from the version both started from tinted (yours in your move's accent), a gap where a
// side has no line. Each side's head names it and holds its choice (Keep mine, Take theirs).
import type { ReactNode } from "react";

import s from "./Compare.module.css";
import u from "./unseen.module.css";

export interface CompareCell {
  text: string;
  /** This side changed it from the version both started from. */
  changed: boolean;
}

export interface CompareSide {
  title: string;
  /** Quiet after the title: where it came from, who saved it and when. */
  note: string;
  /** The side's choice, at its head's end. */
  action: ReactNode;
}

export interface CompareProps {
  /** Its accessible name. */
  label: string;
  /** Yours, then theirs. */
  sides: readonly [CompareSide, CompareSide];
  /** The lines in pairs; null is a gap where that side has no line. */
  rows: readonly (readonly [CompareCell | null, CompareCell | null])[];
}

/** One side's line, a cell of its row; what the eye reads from the tint is said in words too. */
function Line({ cell, side }: { cell: CompareCell | null; side: "mine" | "theirs" }) {
  if (cell === null)
    return (
      <span className={s.gap} role="cell" data-side={side}>
        <span className={u.unseen}>no line</span>
      </span>
    );
  return (
    <span className={s.line} role="cell" data-side={side} data-changed={cell.changed || undefined}>
      {cell.changed ? <span className={u.unseen}>changed: </span> : null}
      {cell.text === "" ? "​" : cell.text}
    </span>
  );
}

/** A table to assistive tech: a column per side under its head, a row per line pair, so each line
 *  is read with its side and its counterpart. To the eye the rows dissolve into one grid. */
export function Compare({ label, sides, rows }: CompareProps) {
  const last = rows.length - 1;
  return (
    <section className={s.compare} role="table" aria-label={label}>
      <div className={s.row} role="row">
        {sides.map((side, i) => (
          <header
            key={side.title}
            className={s.head}
            role="columnheader"
            data-side={i === 0 ? "mine" : "theirs"}
          >
            <b>{side.title}</b>
            <span className={s.note}>{side.note}</span>
            <span className={s.action}>{side.action}</span>
          </header>
        ))}
      </div>
      {rows.map(([mine, theirs], i) => (
        <div
          key={i}
          className={s.row}
          role="row"
          data-first={i === 0 || undefined}
          data-last={i === last || undefined}
        >
          <Line cell={mine} side="mine" />
          <Line cell={theirs} side="theirs" />
        </div>
      ))}
    </section>
  );
}

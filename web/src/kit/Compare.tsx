// Two versions of one text side by side (a version conflict: yours and the one saved meanwhile),
// line against line in monospace: the lines both have level with each other, the lines each side
// changed from the version both started from tinted (yours in your move's accent), a gap where a
// side has no line. Each side's head names it and holds its choice (Keep mine, Take theirs).
import type { ReactNode } from "react";

import s from "./Compare.module.css";

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

function Line({ cell, side }: { cell: CompareCell | null; side: "mine" | "theirs" }) {
  if (cell === null) return <span className={s.gap} aria-hidden="true" />;
  return (
    <span className={s.line} data-side={side} data-changed={cell.changed || undefined}>
      {cell.text === "" ? "\u200b" : cell.text}
    </span>
  );
}

export function Compare({ label, sides, rows }: CompareProps) {
  return (
    <section className={s.compare} aria-label={label}>
      {sides.map((side) => (
        <header key={side.title} className={s.head}>
          <b>{side.title}</b>
          <span className={s.note}>{side.note}</span>
          <span className={s.action}>{side.action}</span>
        </header>
      ))}
      {rows.map(([mine, theirs], i) => [
        <Line key={`m${String(i)}`} cell={mine} side="mine" />,
        <Line key={`t${String(i)}`} cell={theirs} side="theirs" />,
      ])}
    </section>
  );
}

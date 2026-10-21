// One setting on one line: its label in a column of its own (so a card's settings line up), the
// control beside it with a quiet note after it, and what's wrong with it under it.
import type { ReactNode } from "react";

import s from "./Form.module.css";

export interface FormRowProps {
  /** What the setting is. */
  label: string;
  /** The control (a Field, a Select, a Toggle, a NumberField…). */
  children: ReactNode;
  /** Quiet words after the control ("the agent's: high"). */
  note?: string;
  /** What's wrong with the value, under it in the blocked ink. */
  problem?: string;
}

export function FormRow({ label, children, note, problem }: FormRowProps) {
  return (
    // data-setting: a page's side column of settings is a narrower rail than its Talk (Page)
    <div className={s.row} role="group" aria-label={label} data-setting="">
      <span className={s.label} aria-hidden="true">
        {label}
      </span>
      <span className={s.control}>
        {children}
        {note ? <span className={s.note}>{note}</span> : null}
      </span>
      {problem ? <span className={s.problem}>{problem}</span> : null}
    </div>
  );
}

// One setting on one line: its label in a column of its own (so a card's settings line up), the
// control beside it with a quiet note after it, and what's wrong with it under it. The row is a
// group named by its label; the controls in it are described by its note and its problem, and
// marked invalid while it has one.
import { type ReactNode, useId } from "react";

import { DescribedBy } from "./described";

import s from "./Form.module.css";

export interface FormRowProps {
  /** What the setting is. */
  label: string;
  /** The control (a Field, a Select, a Toggle, a NumberField…). */
  children: ReactNode;
  /** Quiet words after the control ("the agent's: high"). */
  note?: string | undefined;
  /** What's wrong with the value, under it in the blocked ink. */
  problem?: string | undefined;
}

export function FormRow({ label, children, note, problem }: FormRowProps) {
  const id = useId();
  return (
    <div className={s.row} role="group" aria-labelledby={`${id}l`}>
      <span className={s.label} id={`${id}l`}>
        {label}
      </span>
      <span className={s.control}>
        <DescribedBy.Provider
          value={{ id, ...(note ? { note } : {}), ...(problem ? { problem } : {}) }}
        >
          {children}
        </DescribedBy.Provider>
        {note ? (
          <span className={s.note} id={`${id}n`}>
            {note}
          </span>
        ) : null}
      </span>
      {problem ? (
        <span className={s.problem} id={`${id}p`}>
          {problem}
        </span>
      ) : null}
    </div>
  );
}

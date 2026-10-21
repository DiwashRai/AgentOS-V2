// One setting on one line: its label in a column of its own (so a card's settings line up), the
// control beside it with a quiet note after it, and what's wrong with it under it. The row is a
// group named by its label; the controls in it are described by its note and its problem, and
// marked invalid while it has one.
import { type ReactNode, useId } from "react";

import { type Described, DescribedBy } from "./described";

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
  const id = useId();
  const [labelId, noteId, problemId] = [`${id}l`, `${id}n`, `${id}p`];
  const ids = [note ? noteId : null, problem ? problemId : null].filter((x) => x !== null);
  const described: Described = {
    ...(ids.length > 0 ? { "aria-describedby": ids.join(" ") } : {}),
    ...(problem ? { "aria-invalid": true as const } : {}),
  };
  return (
    <div className={s.row} role="group" aria-labelledby={labelId}>
      <span className={s.label} id={labelId}>
        {label}
      </span>
      <span className={s.control}>
        <DescribedBy.Provider value={described}>{children}</DescribedBy.Provider>
        {note ? (
          <span className={s.note} id={noteId}>
            {note}
          </span>
        ) : null}
      </span>
      {problem ? (
        <span className={s.problem} id={problemId}>
          {problem}
        </span>
      ) : null}
    </div>
  );
}

// A stage's card on the lane: its face in the slot the lane's axis runs through, its summary
// beside it. The summary is one button that selects the card; selected, the card opens in place to
// its settings under the summary (no dialog). A disabled stage's summary is dimmed; a problem
// with it is said at its foot.
import type { ReactNode } from "react";

import s from "./Card.module.css";

export interface CardProps {
  /** The stage's name: the summary button says "Edit Implement". */
  label: string;
  /** An agent's face or a shell's glyph, on the lane's axis. */
  face: ReactNode;
  /** The summary: name, phase, agent, prompt, chips, marks. */
  children: ReactNode;
  /** Its settings, drawn opened under the summary: the selected card. */
  open?: ReactNode;
  /** A click on the summary selects it (or closes it again); none draws it read only. */
  onOpen?: () => void;
  /** A disabled stage: dimmed. */
  off?: boolean;
  /** What's wrong with it (a gate inside a loop), at its foot in the blocked ink. */
  problem?: string;
}

/** The summary's one button, under its words. */
function Hit({ label, opened, onOpen }: { label: string; opened: boolean; onOpen: () => void }) {
  const say = `${opened ? "Close" : "Edit"} ${label}`;
  return (
    <button
      type="button"
      className={s.hit}
      aria-expanded={opened}
      aria-label={say}
      title={say}
      onClick={onOpen}
    />
  );
}

/** A data attribute that is there or not. */
const flag = (on: boolean) => on || undefined;

export function Card({ label, face, children, open, onOpen, off, problem }: CardProps) {
  const opened = open !== undefined && open !== null;
  return (
    <div
      className={s.card}
      data-open={flag(opened)}
      data-off={flag(off === true)}
      data-problem={flag(problem !== undefined)}
      data-edit={flag(onOpen !== undefined)}
    >
      <div className={s.summary}>
        {onOpen ? <Hit label={label} opened={opened} onOpen={onOpen} /> : null}
        <span className={s.face}>{face}</span>
        <div className={s.main}>{children}</div>
      </div>
      {problem ? (
        <div className={s.problem} role="note">
          {problem}
        </div>
      ) : null}
      {opened ? <div className={s.body}>{open}</div> : null}
    </div>
  );
}

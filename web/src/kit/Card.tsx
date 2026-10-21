// A card: one object on its own surface, the whole of it one button. Three looks, one surface and
// one activation:
// - stage: a workflow stage on the lane: its face in the slot the lane's axis runs through, its
//   summary beside it; the summary selects it, and selected it opens in place to its settings (no
//   dialog). A disabled stage is dimmed; a problem with it is said at its foot.
// - agent: an agent at work (My queue): its lines one under another, filling the card's height so
//   cards in a row line up; a queued one (`off`) recedes to a hairline. A Meter laid in it lies
//   along its bottom edge.
// - ticket: a ticket on a board (All teams): its lines one under another on a hairline card.
// What the lines say is the screen's; the card draws the surface and opens what it opens.
import type { ReactNode } from "react";

import s from "./Card.module.css";

export interface CardProps {
  /** What it is: a stage's button says "Edit Implement"; the others say this whole ("Peek at …"). */
  label: string;
  /** stage (the default), agent or ticket. */
  look?: "stage" | "agent" | "ticket";
  /** A stage's face (an agent's, a shell's glyph), on the lane's axis. */
  face?: ReactNode;
  /** Its lines: a stage's summary, an agent's or a ticket's lines. */
  children: ReactNode;
  /** A stage's settings, drawn opened under the summary: the selected card. */
  open?: ReactNode;
  /** A click (or Enter) on it: selects a stage, or opens what the card is of; none: read only. */
  onOpen?: () => void;
  /** A disabled stage (dimmed); a queued agent (receded to a hairline). */
  off?: boolean;
  /** What's wrong with a stage (a gate inside a loop), at its foot in the blocked ink. */
  problem?: string;
}

/** The card's one button, under its words so they stay plain text. A stage's says whether it is
 *  open; the others name what they open. */
function Hit({ say, expanded, onOpen }: { say: string; expanded?: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={s.hit}
      aria-expanded={expanded}
      aria-label={say}
      title={say}
      onClick={onOpen}
    />
  );
}

/** A data attribute that is there or not. */
const flag = (on: boolean) => on || undefined;

/** Under the summary: a stage's problem, then its settings while it is open. */
function Foot({ problem, open }: { problem: string | undefined; open: ReactNode }) {
  return (
    <>
      {problem ? (
        <div className={s.problem} role="note">
          {problem}
        </div>
      ) : null}
      {open !== undefined ? <div className={s.body}>{open}</div> : null}
    </>
  );
}

export function Card(props: CardProps) {
  const { label, look = "stage", face, children, open, onOpen, off, problem } = props;
  const stage = look === "stage";
  const opened = stage && open !== undefined && open !== null;
  const say = stage ? `${opened ? "Close" : "Edit"} ${label}` : label;
  return (
    <div
      className={s.card}
      data-look={look}
      data-open={flag(opened)}
      data-off={flag(off === true)}
      data-problem={flag(problem !== undefined)}
      data-edit={flag(onOpen !== undefined)}
    >
      <div className={s.summary} data-face={flag(face !== undefined)}>
        {onOpen ? <Hit say={say} expanded={stage ? opened : undefined} onOpen={onOpen} /> : null}
        {face !== undefined ? <span className={s.face}>{face}</span> : null}
        <div className={s.main}>{children}</div>
      </div>
      <Foot problem={problem} open={opened ? open : undefined} />
    </div>
  );
}

// A card: one object on its own surface, the whole of it one button. Three looks, one surface and
// one activation:
// - stage: a workflow stage on the lane: its face in the slot the lane's axis runs through, its
//   summary beside it; the summary selects it, and selected it opens in place to its settings (no
//   dialog). A disabled stage is dimmed; a problem with it is said at its foot.
// - agent: an agent at work (My queue): its lines one under another, filling the card's height so
//   cards in a row line up; a queued one recedes to a hairline. A Meter drawn `edge` in it lies
//   along its bottom edge (its summary, the card's full height, is the Meter's containing block).
// - ticket: a ticket on a board (All teams): its lines one under another on a hairline card.
// It opens as a whole (./opener): one real button for the keyboard and assistive tech, the focus
// ring round the card, and a click anywhere on it for a pointer. What the lines say is the
// screen's.
import type { ReactNode } from "react";

import s from "./Card.module.css";
import { Opener, openOnClick } from "./opener";

interface Common {
  /** What it is: a stage's button says "Edit Implement"; the others say this whole ("Peek at …").
   *  */
  label: string;
  /** Its lines: a stage's summary, an agent's or a ticket's lines. */
  children: ReactNode;
}

export type CardProps = Common &
  (
    | {
        look?: "stage";
        /** A stage's face (an agent's, a shell's glyph), on the lane's axis. */
        face: ReactNode;
        /** Its settings, drawn opened under the summary: the selected card. */
        open?: ReactNode;
        /** A click (or Enter) selects it; none: read only. */
        onOpen?: () => void;
        /** A disabled stage: dimmed. */
        off?: boolean;
        /** What's wrong with it (a gate inside a loop), at its foot in the blocked ink. */
        problem?: string;
      }
    | {
        look: "agent";
        /** A click (or Enter) opens what the card is of (a peek). */
        onOpen: () => void;
        /** A queued agent: receded to a hairline. */
        off?: boolean;
        face?: never;
        open?: never;
        problem?: never;
      }
    | {
        look: "ticket";
        onOpen: () => void;
        face?: never;
        open?: never;
        problem?: never;
        off?: never;
      }
  );

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

/** A data attribute that is there or not. */
const flag = (on: boolean) => on || undefined;

/** What a card draws, from its case: a stage's face, settings and problem, and what its button
 *  says. */
function caseOf(props: CardProps) {
  if (props.look === "agent" || props.look === "ticket") {
    const off = props.look === "agent" && props.off === true;
    return { face: undefined, open: undefined, off, problem: undefined, say: props.label };
  }
  const opened = props.open !== undefined && props.open !== null;
  return {
    face: props.face,
    open: opened ? props.open : undefined,
    off: props.off === true,
    problem: props.problem,
    say: `${opened ? "Close" : "Edit"} ${props.label}`,
  };
}

export function Card(props: CardProps) {
  const { children, onOpen } = props;
  const stage = props.look === undefined || props.look === "stage";
  const c = caseOf(props);
  return (
    <div
      className={s.card}
      data-look={props.look ?? "stage"}
      data-open={flag(c.open !== undefined)}
      data-off={flag(c.off)}
      data-problem={flag(c.problem !== undefined)}
      data-edit={flag(onOpen !== undefined)}
    >
      {/* jsx-a11y's presentation pattern: the click is a pointer convenience over the button */}
      <div
        role="presentation"
        className={s.summary}
        data-face={flag(c.face !== undefined)}
        onClick={onOpen ? openOnClick(onOpen) : undefined}
      >
        {onOpen ? (
          <Opener
            className={s.hit}
            say={c.say}
            expanded={stage ? c.open !== undefined : undefined}
            onOpen={onOpen}
          />
        ) : null}
        {c.face !== undefined ? <span className={s.face}>{c.face}</span> : null}
        <div className={s.main}>{children}</div>
      </div>
      <Foot problem={c.problem} open={c.open} />
    </div>
  );
}

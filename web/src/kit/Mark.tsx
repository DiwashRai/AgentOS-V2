import { Badge } from "./Badge";
import s from "./Mark.module.css";
import { cx, vars } from "./vars";

export type MarkKind = "run" | "wait" | "you" | "blk" | "done" | "abandoned" | "queued" | "idle";

/** The accessible names of a glyph-only mark. */
const WORD: Record<MarkKind, string> = {
  run: "Running",
  wait: "Waiting on someone",
  you: "Needs you",
  blk: "Blocked",
  done: "Done",
  abandoned: "Abandoned",
  queued: "Queued",
  idle: "Inbox",
};

export interface MarkProps {
  /** One form per state. */
  kind: MarkKind;
  /** The label in the state's colour ("Builder · run #42", "Bea", "Blocked"); `you` shows YOU. */
  name?: string;
  /** The ask: after YOU in the you hue ("Sign off the plan"); after a name, "· ask". */
  ask?: string;
  /** Plain text after the label. */
  text?: string;
  /** The glyph alone (counters, legends, group heads). */
  glyph?: boolean;
  /** The small glyph of counters, pills and group heads. */
  small?: boolean;
  /** Still: no breathing halo (a grid of cards, a board, would pulse all at once). */
  still?: boolean;
  /** A running glyph's pie: how far its run is (Linear's in-progress circle); half without it. */
  progress?: { done: number; total: number } | null;
}

/** The glyph: Linear's status circle, drawn by the stylesheet from the kind. */
function Glyph({ label }: { label?: string }) {
  return label ? <i role="img" aria-label={label} /> : <i aria-hidden="true" />;
}

/** The glyph alone, a running one's pie filled to its progress. */
function GlyphMark({ kind, name, small, still, progress }: MarkProps) {
  const fill = progress && progress.total > 0 ? progress.done / progress.total : null;
  return (
    <span
      className={cx(s.mark, s[kind], small && s.small, still && s.still)}
      style={vars({ "--fill": fill === null ? undefined : `${String(Math.round(fill * 100))}%` })}
    >
      <Glyph label={name ?? WORD[kind]} />
    </span>
  );
}

/** A ticket's or run's state, in exactly one form per state. */
export function Mark(props: MarkProps) {
  if (props.glyph) return <GlyphMark {...props} />;
  return <NamedMark {...props} />;
}

/** YOU stands alone; any other state shows its glyph and its name, and the ask follows the name. */
function NamedMark({ kind, name, ask, text, small }: MarkProps) {
  const named = kind !== "you" && name !== undefined;
  return (
    <span className={cx(s.mark, s[kind], small && s.small)}>
      {kind === "you" ? <Badge kind="you" /> : <Glyph />}
      {named ? <b>{name}</b> : null}
      {ask ? <span className={s.ask}>{named ? `· ${ask}` : ask}</span> : null}
      {text ? <span className={s.text}>{text}</span> : null}
    </span>
  );
}

import { Badge } from "./Badge";
import { Icon } from "./Icon";
import s from "./Mark.module.css";
import { cx } from "./vars";

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
}

function Glyph({ kind, label }: { kind: MarkKind; label?: string }) {
  if (kind === "done") return <Icon name="tick-sm" {...(label ? { label } : {})} />;
  return label ? <i role="img" aria-label={label} /> : <i aria-hidden="true" />;
}

/** A ticket's or run's state, in exactly one form per state. */
export function Mark({ kind, name, ask, text, glyph, small }: MarkProps) {
  const cls = cx(s.mark, s[kind], small && s.small);
  if (glyph) {
    return (
      <span className={cls}>
        <Glyph kind={kind} label={name ?? WORD[kind]} />
      </span>
    );
  }
  // YOU stands alone; any other state shows its glyph and its name, and the ask follows the name.
  const named = kind !== "you" && name !== undefined;
  return (
    <span className={cls}>
      {kind === "you" ? <Badge kind="you" /> : <Glyph kind={kind} />}
      {named ? <b>{name}</b> : null}
      {ask ? <span className={s.ask}>{named ? `· ${ask}` : ask}</span> : null}
      {text ? <span className={s.text}>{text}</span> : null}
    </span>
  );
}

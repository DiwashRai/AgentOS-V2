import { Badge } from "./Badge";
import s from "./Mark.module.css";
import { cx, vars } from "./vars";

export type MarkKind = "run" | "wait" | "you" | "blk" | "done" | "abandoned" | "queued" | "idle";

interface Common {
  /** One form per state. */
  kind: MarkKind;
  /** The small glyph of counters, pills and group heads. */
  small?: boolean;
}

export type MarkProps = Common &
  (
    | {
        /** The glyph alone (counters, legends, group heads, a card's state). */
        glyph: true;
        /** Its name, a choice every glyph makes: the state's word where the glyph is the only sign of
         *  it; `false` where the words beside it say the state (a filter chip, a counter, a head):
         *  it is then drawing alone. */
        name: string | false;
        /** Still: no breathing halo (a grid of cards, a board, would pulse all at once). */
        still?: boolean;
        /** A running glyph's pie, as far as its run is (Linear's in-progress circle); else half. */
        progress?: { done: number; total: number } | null;
        ask?: never;
      }
    | {
        glyph?: false;
        /** The label in the state's colour ("Builder · run #42", "Bea", "Blocked"): a named mark says
         *  its state (the glyph alone is the other form). */
        name: string;
        /** The ask, after the name: "· ask". */
        ask?: string;
        kind: Exclude<MarkKind, "you">;
        still?: never;
        progress?: never;
      }
    | {
        /** YOU stands alone, no name: the ask follows it in the you hue ("Sign off the plan"). */
        kind: "you";
        glyph?: false;
        ask?: string;
        name?: never;
        still?: never;
        progress?: never;
      }
  );
/** The glyph: Linear's status circle, drawn by the stylesheet from the kind. */
function Glyph({ label }: { label?: string | false }) {
  return label ? <i role="img" aria-label={label} /> : <i aria-hidden="true" />;
}

type GlyphProps = Extract<MarkProps, { glyph: true }>;
type NamedProps = Exclude<MarkProps, GlyphProps>;

/** The glyph alone, a running one's pie filled to its progress. */
function GlyphMark({ kind, name, small, still, progress }: GlyphProps) {
  const fill = progress && progress.total > 0 ? progress.done / progress.total : null;
  return (
    <span
      className={cx(s.mark, s[kind], small && s.small, still && s.still)}
      style={vars({ "--fill": fill === null ? undefined : `${String(Math.round(fill * 100))}%` })}
    >
      <Glyph label={name} />
    </span>
  );
}

/** A ticket's or run's state, in exactly one form per state. */
export function Mark(props: MarkProps) {
  return props.glyph === true ? <GlyphMark {...props} /> : <NamedMark {...props} />;
}

/** YOU stands alone; any other state shows its glyph and its name, and the ask follows the name. */
function NamedMark({ kind, name, ask, small }: NamedProps) {
  const named = name !== undefined;
  return (
    <span className={cx(s.mark, s[kind], small && s.small)}>
      {kind === "you" ? <Badge kind="you" /> : <Glyph />}
      {named ? <b>{name}</b> : null}
      {ask ? <span className={s.ask}>{named ? `· ${ask}` : ask}</span> : null}
    </span>
  );
}

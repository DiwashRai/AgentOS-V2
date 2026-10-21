// Linear's label chip, the kit's one pill: a stage, a repo, a skill on a stage, a property, an
// agent's state. A pill on a hairline, regular muted words cut at their end, led by a small glyph
// or a dot in a state's hue (one or the other), with something quieter after the words (a step
// count, or an agent's glyph on its live disc and a face), and, where it can be taken off, a
// remove at its end. A chip that was just added (or clicked for again) scrolls into view and
// flashes once, so a click far from it shows where it landed. What a chip says is the screen's
// to decide; the chip only draws it.
import { useEffect, useRef } from "react";

import { Avatar } from "./Avatar";
import s from "./Chip.module.css";
import { Icon, type IconName } from "./Icon";
import { tokenPx } from "./vars";

/** A state's hue for a chip's dot. */
export type ChipDot = "neutral" | "live" | "you" | "blocked" | "done";

/** A person's face: their name and the seed of their hue. */
interface Face {
  name: string;
  seed: string;
}

/** After the words, one of: a count; or who works on it, an agent (with whose ticket it is) or a
 *  person's face alone. Never a count and a who together, never a who with no one. */
export type ChipAfter =
  | { text: string; agent?: never; face?: never }
  | { agent: string; face?: Face; text?: never }
  | { face: Face; agent?: never; text?: never };

export type ChipProps = {
  /** Its words (tests, AGENTS.md, Implement, northwind/web). */
  label: string;
  /** line: a hairline, no fill (the default); fill: a faint fill on the hairline (an agent card's
   *  chips, a board card's state, a stage's phase); blocked: the words in the blocked ink (a
   *  conflict). */
  tone?: "line" | "fill" | "blocked";
  /** The full text on hover, when it says more than the words. */
  title?: string;
  after?: ChipAfter;
  /** Take it off; none draws it read only. */
  onRemove?: () => void;
  /** Just added: scroll it into view and flash it once, when it mounts. */
  flash?: boolean;
} & (
  | {
      /** A small glyph before the words (skills, files, the repo). */
      lead?: IconName;
      dot?: never;
    }
  | {
      /** A dot in a state's hue before the words, instead of a glyph. */
      dot: ChipDot;
      lead?: never;
    }
);

function useArrival(flash: boolean | undefined) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!flash || !el) return;
    // brought to the middle when it landed near or past an edge, so it is plainly in view
    const r = el.getBoundingClientRect();
    const edge = tokenPx("--h-top");
    if (r.top < edge || r.bottom > window.innerHeight - edge)
      el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [flash]);
  return ref;
}

function Remove({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      className={s.remove}
      aria-label={`Remove ${label}`}
      title={`Remove ${label}`}
      onClick={onRemove}
    >
      <Icon name="close" />
    </button>
  );
}

/** After the words: a quieter count, or the agent's glyph on its live disc and a face. */
function After({ after }: { after: ChipAfter }) {
  if (after.text !== undefined) return <span className={s.count}>{after.text}</span>;
  return (
    <span className={s.who}>
      {after.agent !== undefined ? (
        <span className={s.agent}>
          <Icon name="agents" label={`${after.agent} agent`} />
        </span>
      ) : null}
      {after.face ? <Avatar name={after.face.name} seed={after.face.seed} size="sm" /> : null}
    </span>
  );
}

/** The chip's own data attributes, for its stylesheet: its tone, and what it holds. */
function flags({ lead, after, onRemove, flash, tone = "line" }: ChipProps) {
  const on = (b: boolean) => b || undefined;
  return {
    "data-tone": tone,
    "data-lead": on(lead !== undefined),
    "data-who": on(after !== undefined && after.text === undefined),
    "data-removable": on(onRemove !== undefined),
    "data-flash": on(flash === true),
  };
}

/** What leads the words: a state's dot, or a small glyph. */
function Lead({ dot, lead }: Pick<ChipProps, "dot" | "lead">) {
  if (dot) return <i className={s.dot} data-dot={dot} aria-hidden="true" />;
  return lead ? (
    <span className={s.lead}>
      <Icon name={lead} />
    </span>
  ) : null;
}

export function Chip(props: ChipProps) {
  const { label, title, after, onRemove, flash } = props;
  const ref = useArrival(flash);
  return (
    <span ref={ref} className={s.chip} {...flags(props)} title={title ?? label}>
      <Lead {...(props.dot ? { dot: props.dot } : { lead: props.lead })} />
      <span className={s.label}>{label}</span>
      {after ? <After after={after} /> : null}
      {onRemove ? <Remove label={label} onRemove={onRemove} /> : null}
    </span>
  );
}

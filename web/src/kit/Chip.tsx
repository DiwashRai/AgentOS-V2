// The kit's one tag: a stage, a repo, a skill on a stage, a property, an agent's state. A flat
// tag of faint ink with no outline (borders are for controls), regular muted words cut at their end, led by a small glyph
// or a dot in a state's hue (one or the other), with a quieter step count after the words, and,
// where it can be taken off, a remove at its end. A chip that was just added (or clicked for again) scrolls into view and
// flashes once, so a click far from it shows where it landed. What a chip says is the screen's
// to decide; the chip only draws it.
import { useEffect, useRef } from "react";

import s from "./Chip.module.css";
import { Icon, type IconName } from "./Icon";
import { Tip } from "./tip";
import { tokenPx } from "./vars";

/** A state's hue for a chip's dot. */
export type ChipDot = "neutral" | "live" | "you" | "blocked" | "done";

/** After the words, a quieter count (a running agent's step). */
export interface ChipAfter {
  text: string;
}

export type ChipProps = {
  /** Its words (tests, AGENTS.md, Implement, northwind/web). */
  label: string;
  /** line: a faint fill, no outline (the default; in a list's row, a pill on a hairline); fill: a firmer fill (a stage's phase); edge: a round pill on a hairline, no fill (a board card's state, Linear's
   *  card pill); blocked: the words in the blocked ink (a conflict). */
  tone?: "line" | "fill" | "edge" | "blocked";
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
    <Tip text={`Remove ${label}`} said>
      <button type="button" className={s.remove} aria-label={`Remove ${label}`} onClick={onRemove}>
        <Icon name="close" />
      </button>
    </Tip>
  );
}

/** The chip's own data attributes, for its stylesheet: its tone, and what it holds. */
function flags({ lead, onRemove, flash, tone = "line" }: ChipProps) {
  const on = (b: boolean) => b || undefined;
  return {
    "data-tone": tone,
    "data-lead": on(lead !== undefined),
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
    <Tip text={title ?? label} cut={(title ?? label) === label}>
      <span ref={ref} className={s.chip} {...flags(props)}>
        <Lead {...(props.dot ? { dot: props.dot } : { lead: props.lead })} />
        <span className={s.label}>{label}</span>
        {after ? <span className={s.count}>{after.text}</span> : null}
        {onRemove ? <Remove label={label} onRemove={onRemove} /> : null}
      </span>
    </Tip>
  );
}

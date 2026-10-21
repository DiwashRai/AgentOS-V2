// Linear's label chip, the kit's one pill: a stage, a repo, a skill on a stage, a property, an
// agent's state. A pill on a hairline, regular muted words cut at their end, led by a small glyph
// or a dot in a state's hue, with something quieter after the words (a step count, an agent and a
// face), and, where it can be taken off, a remove at its end. A chip that was just added (or
// clicked for again) scrolls into view and flashes once, so a click far from it shows where it
// landed. What a chip says is the screen's to decide; the chip only draws it.
import { type ReactNode, useEffect, useRef } from "react";

import s from "./Chip.module.css";
import { Icon } from "./Icon";
import { tokenPx } from "./vars";

export interface ChipProps {
  /** Its words (tests, AGENTS.md, Implement, northwind/web). */
  label: string;
  /** A small glyph before the words (an Icon, or a still Mark glyph). */
  lead?: ReactNode;
  /** A dot before the words in a state's hue, instead of a glyph. */
  dot?: "neutral" | "live" | "you" | "blocked" | "done";
  /** line: a hairline, no fill (the default); fill: a faint fill on the hairline (an agent card's
   *  chips, a board card's state); strong: the words in full ink (a ticket's type); blocked: the
   *  words in the blocked ink (a high priority, a conflict). */
  tone?: "line" | "fill" | "strong" | "blocked";
  /** The full text on hover, when it says more than the words. */
  title?: string;
  /** Quieter, after the words: a step count, or an agent's glyph and a face. */
  after?: ReactNode;
  /** Take it off; none draws it read only. */
  onRemove?: () => void;
  /** Just added: scroll it into view and flash it once, when it mounts. */
  flash?: boolean;
}

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

export function Chip(props: ChipProps) {
  const { label, lead, dot, tone = "line", title, after, onRemove, flash } = props;
  const ref = useArrival(flash);
  return (
    <span
      ref={ref}
      className={s.chip}
      data-tone={tone}
      data-removable={onRemove !== undefined || undefined}
      data-flash={flash === true || undefined}
      title={title ?? label}
    >
      {dot ? <i className={s.dot} data-dot={dot} aria-hidden="true" /> : null}
      {lead ? <span className={s.lead}>{lead}</span> : null}
      <span className={s.label}>{label}</span>
      {after !== undefined && after !== null ? <span className={s.after}>{after}</span> : null}
      {onRemove ? <Remove label={label} onRemove={onRemove} /> : null}
    </span>
  );
}

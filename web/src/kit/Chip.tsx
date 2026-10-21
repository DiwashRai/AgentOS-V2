// A library item named on a stage or a workflow (a skill, a file) as Linear's label chip: its
// glyph, its name, and, where it can be taken off, a remove at its end. A chip that was just added
// (or clicked for again) scrolls into view and flashes once, so a click far from it shows where it
// landed.
import { useEffect, useRef } from "react";

import s from "./Chip.module.css";
import { Icon, type IconName } from "./Icon";
import { tokenPx } from "./vars";

export interface ChipProps {
  /** Its name (tests, AGENTS.md). */
  label: string;
  /** What it is (skills, files). */
  icon: IconName;
  /** Take it off; none draws it read only. */
  onRemove?: () => void;
  /** Just added: scroll it into view and flash it once, when it mounts. */
  flash?: boolean;
}

export function Chip({ label, icon, onRemove, flash }: ChipProps) {
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
  return (
    <span
      ref={ref}
      className={s.chip}
      data-removable={onRemove !== undefined || undefined}
      data-flash={flash === true || undefined}
      title={label}
    >
      <Icon name={icon} />
      <span className={s.label}>{label}</span>
      {onRemove ? (
        <button
          type="button"
          className={s.remove}
          aria-label={`Remove ${label}`}
          title={`Remove ${label}`}
          onClick={onRemove}
        >
          <Icon name="close" />
        </button>
      ) : null}
    </span>
  );
}

// Filter pills on a recessed track; the pressed one is a raised sheet. Zero counts stay, receded.
import { Mark, type MarkKind } from "./Mark";
import s from "./Segmented.module.css";

export interface Segment {
  id: string;
  label: string;
  count?: number;
  mark?: MarkKind;
}

export interface SegmentedProps {
  /** The group's accessible name. */
  label: string;
  items: readonly Segment[];
  value: string;
  onChange: (id: string) => void;
}

export function Segmented({ label, items, value, onChange }: SegmentedProps) {
  return (
    <div className={s.track} role="group" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={s.pill}
          data-you={it.mark === "you"}
          aria-pressed={it.id === value}
          onClick={() => {
            onChange(it.id);
          }}
        >
          {it.mark ? <Mark kind={it.mark} glyph small /> : null}
          {it.label}
          {it.count !== undefined ? <em data-zero={it.count === 0}>{it.count}</em> : null}
        </button>
      ))}
    </div>
  );
}

// A ticket's properties as Linear draws them: one row of chips, each label in its tooltip and its
// screen-reader term. A fact is one of: its words, after a muted glyph; other content (a face and a
// name); or a picker, which brings its own padding and hover.
import type { ReactNode } from "react";

import s from "./Facts.module.css";
import { Icon, type IconName } from "./Icon";

export type Fact = {
  label: string;
  /** Quiet words after the value ("from the repo"). */
  note?: string;
} & (
  | {
      /** The value: its words, or other content (a face and a name). */
      value: ReactNode;
      /** A muted glyph before the value. */
      icon?: IconName;
      picker?: never;
    }
  | {
      /** A picker in place of the value (the ticket's owner): it brings its own padding and hover. */
      picker: ReactNode;
      value?: never;
      icon?: never;
    }
);

export interface FactsProps {
  items: readonly Fact[];
  /** A head before the chips, as Linear's "Properties". */
  label?: string;
}

/** A fact's value: a picker as it is, or the glyph, the words and the note in the chip's padding. */
function Value({ f }: { f: Fact }) {
  if (f.picker !== undefined) return <dd className={s.picker}>{f.picker}</dd>;
  return (
    <dd className={s.value}>
      {f.icon ? (
        <span className={s.glyph}>
          <Icon name={f.icon} />
        </span>
      ) : null}
      {f.value}
      {f.note ? <span className={s.note}>{f.note}</span> : null}
    </dd>
  );
}

export function Facts({ items, label }: FactsProps) {
  return (
    <div className={s.facts}>
      {label ? <span className={s.head}>{label}</span> : null}
      <dl className={s.chips}>
        {items.map((f) => (
          <div
            key={f.label}
            className={s.fact}
            data-picker={f.picker !== undefined || undefined}
            title={f.label}
          >
            <dt>{f.label}</dt>
            <Value f={f} />
          </div>
        ))}
      </dl>
    </div>
  );
}

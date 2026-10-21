// A ticket's properties as Linear draws them: one row of chips, each label in its tooltip and its
// screen-reader term. A fact is one of: its words, after a muted glyph; other content (a face and a
// name); or a picker, which brings its own padding and hover.
import { type ReactNode, useId } from "react";

import s from "./Facts.module.css";
import { Icon, type IconName } from "./Icon";
import { Tip } from "./tip";
import u from "./unseen.module.css";

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
      /** A picker in place of the value (the ticket's owner), with its own padding and hover. */
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

/** A fact's value: a picker as it is, or the glyph, the words and the note in the chip. */
function Value({ f }: { f: Fact }) {
  const note = f.note ? <span className={s.note}>{f.note}</span> : null;
  if (f.picker !== undefined)
    return (
      <dd className={s.picker}>
        {f.picker}
        {note}
      </dd>
    );
  return (
    <dd className={s.value}>
      {f.icon ? (
        <span className={s.glyph}>
          <Icon name={f.icon} />
        </span>
      ) : null}
      {f.value}
      {note}
    </dd>
  );
}

export function Facts({ items, label }: FactsProps) {
  const head = useId();
  return (
    <div className={s.facts}>
      {label ? (
        <span className={s.head} id={head}>
          {label}
        </span>
      ) : null}
      <dl className={s.chips} aria-labelledby={label ? head : undefined}>
        {items.map((f) => (
          <Tip key={f.label} text={f.label} said>
            <div className={s.fact} data-picker={f.picker !== undefined || undefined}>
              <dt className={u.unseen}>{f.label}</dt>
              <Value f={f} />
            </div>
          </Tip>
        ))}
      </dl>
    </div>
  );
}

import type { ReactNode } from "react";

import s from "./Facts.module.css";

export interface Fact {
  label: string;
  value: ReactNode;
  /** Quiet words after the value ("from the repo"). */
  note?: string;
}

export interface FactsProps {
  items: readonly Fact[];
  /** A head before the chips, as Linear's "Properties". */
  label?: string;
}

/** A ticket's properties as Linear draws them: one row of chips, each label in its tooltip. */
export function Facts({ items, label }: FactsProps) {
  return (
    <div className={s.facts}>
      {label ? <span className={s.head}>{label}</span> : null}
      <dl className={s.chips}>
        {items.map((f) => (
          <div key={f.label} className={s.fact} title={f.label}>
            <dt>{f.label}</dt>
            <dd>
              {f.value}
              {f.note ? <span className={s.note}>{f.note}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

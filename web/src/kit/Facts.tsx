import type { ReactNode } from "react";

import s from "./Facts.module.css";

export interface Fact {
  label: string;
  value: ReactNode;
}

export interface FactsProps {
  items: readonly Fact[];
}

/** A line of facts: "Owner **Ada** · Workflow **Standard**". */
export function Facts({ items }: FactsProps) {
  return (
    <dl className={s.facts}>
      {items.map((f) => (
        <div key={f.label} className={s.fact}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

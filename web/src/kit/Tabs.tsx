// Underline tabs on one hairline: Base UI does the roving focus and arrow keys; the look is ours.
import { Tabs as Base } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

import s from "./Tabs.module.css";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  /** The tab list's accessible name. */
  label: string;
  items: readonly Tab[];
  value: string;
  onChange: (id: string) => void;
  /** The current tab's panel. */
  children: ReactNode;
}

export function Tabs({ label, items, value, onChange, children }: TabsProps) {
  return (
    <Base.Root
      value={value}
      onValueChange={(v: string) => {
        onChange(v);
      }}
    >
      <Base.List className={s.list} aria-label={label}>
        {items.map((it) => (
          <Base.Tab key={it.id} value={it.id} className={s.tab}>
            {it.label}
            {it.count !== undefined ? <span className={s.count}>{it.count}</span> : null}
          </Base.Tab>
        ))}
      </Base.List>
      <Base.Panel value={value} className={s.panel}>
        {children}
      </Base.Panel>
    </Base.Root>
  );
}

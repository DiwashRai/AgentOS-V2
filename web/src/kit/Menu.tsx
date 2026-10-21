// A menu of choices, one of them current (the theme menu): Base UI's combobox does the keyboard,
// focus, filtering and placement; the look is ours, the kit's one popover: a "Change theme…"
// filter on its first line (as every kit list of choices opens), then each choice,
// its descriptor muted right after its name, the current one ticked at the end. Its trigger is a
// sidebar row's hit area (Frame draws the row's face over it), or with `text` the row itself
// naming the current choice; it opens above the row, anchored to its start, as Linear's
// sidebar-foot menus do: the one place a menu is drawn yet (a page's menu comes with W4).
import { Combobox as Base } from "@base-ui/react/combobox";
import type { ReactNode } from "react";

import { Icon, type IconName } from "./Icon";
import s from "./Menu.module.css";
import p from "./Popover.module.css";
import { cx, tokenPx } from "./vars";

export interface MenuItem {
  id: string;
  label: string;
  detail?: string;
  /** Drawn at the item's start (the theme menu's swatches). */
  aside?: ReactNode;
}

export interface MenuProps {
  /** The trigger's accessible name, and the filter's placeholder ("Change theme…"). */
  label: string;
  icon: IconName;
  /** Draw the trigger as a sidebar row: the icon, this word, the current choice and a chevron. */
  text?: string;
  items: readonly MenuItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Menu({ label, icon, text, items, value, onChange }: MenuProps) {
  const now = items.find((it) => it.id === value) ?? null;
  return (
    <Base.Root
      items={items}
      value={now}
      itemToStringLabel={(it: MenuItem) => it.label}
      isItemEqualToValue={(a: MenuItem, b: MenuItem) => a.id === b.id}
      onValueChange={(it: MenuItem | null) => {
        if (it !== null) onChange(it.id);
      }}
    >
      <Base.Trigger
        className={cx(s.trigger, text !== undefined && s.row)}
        aria-label={text === undefined ? label : undefined}
        title={text === undefined ? label : undefined}
      >
        <Icon name={icon} />
        {text !== undefined ? (
          <>
            <span className={s.text}>{text}</span>
            <span className={s.now}>{now?.label}</span>
            <span className={s.chev}>
              <Icon name="chevron" />
            </span>
          </>
        ) : null}
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner side="top" align="start" sideOffset={() => tokenPx("--sp-2")}>
          <Base.Popup className={cx(p.sheet, s.menu)} aria-label={label}>
            <Base.Input
              className={p.find}
              placeholder={`Change ${label.toLowerCase()}…`}
              aria-label={label}
            />
            <Base.Empty className={p.empty}>No match</Base.Empty>
            <Base.List>
              {(it: MenuItem) => (
                <Base.Item key={it.id} value={it} className={p.row}>
                  {it.aside ? <span className={s.aside}>{it.aside}</span> : null}
                  <span className={s.name}>{it.label}</span>
                  {it.detail ? <span className={p.aside}>{it.detail}</span> : null}
                  <Base.ItemIndicator className={p.check}>
                    <Icon name="check" />
                  </Base.ItemIndicator>
                </Base.Item>
              )}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

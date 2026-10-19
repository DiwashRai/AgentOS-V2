// A menu of choices, one of them current (the theme menu): Base UI does the keyboard, focus,
// typeahead and placement; the look is ours. Its trigger sits on the brand rail and it opens to the
// rail's right: the one place a menu is drawn yet (a page's menu comes with W4).
import { Menu as Base } from "@base-ui/react/menu";
import type { ReactNode } from "react";

import { Icon, type IconName } from "./Icon";
import s from "./Menu.module.css";
import { tokenPx } from "./vars";

export interface MenuItem {
  id: string;
  label: string;
  detail?: string;
  /** Drawn at the item's end (the theme menu's swatches). */
  aside?: ReactNode;
}

export interface MenuProps {
  /** The trigger's accessible name, and the menu's heading. */
  label: string;
  icon: IconName;
  items: readonly MenuItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Menu({ label, icon, items, value, onChange }: MenuProps) {
  return (
    <Base.Root>
      <Base.Trigger className={s.trigger} aria-label={label} title={label}>
        <Icon name={icon} />
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner
          side="right"
          align="end"
          sideOffset={() => tokenPx("--sp-6")}
          alignOffset={() => -tokenPx("--sp-3")}
        >
          <Base.Popup className={s.menu}>
            <Base.Group>
              <Base.GroupLabel className={s.head}>{label}</Base.GroupLabel>
              <Base.RadioGroup
                value={value}
                onValueChange={(id: string) => {
                  onChange(id);
                }}
              >
                {items.map((it) => (
                  <Base.RadioItem key={it.id} value={it.id} className={s.item} closeOnClick>
                    <span className={s.name}>
                      <Base.RadioItemIndicator keepMounted className={s.check}>
                        <Icon name="check" />
                      </Base.RadioItemIndicator>
                      {it.label}
                    </span>
                    {it.detail ? <span className={s.detail}>{it.detail}</span> : null}
                    {it.aside ? <span className={s.aside}>{it.aside}</span> : null}
                  </Base.RadioItem>
                ))}
              </Base.RadioGroup>
            </Base.Group>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

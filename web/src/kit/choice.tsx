// The kit's one single-choice popup (internal: Select and Segmented's overflow draw it). Base UI's
// combobox does the keyboard, filtering and placement; the look is the kit's one popover: a
// "Change owner…" filter on its first line, each option as its owner draws it, the current one
// ticked. The trigger is the owner's: its class, name and body.
import { Combobox as Base } from "@base-ui/react/combobox";
import type { ReactNode } from "react";

import { useDescribed } from "./described";
import { Icon } from "./Icon";
import { useLayer } from "./layer";
import p from "./Popover.module.css";
import { cx, tokenPx } from "./vars";

export interface ChoiceItem {
  id: string;
  label: string;
}

export interface ChoiceProps<T extends ChoiceItem> {
  /** The popup's name, and its filter's placeholder ("Change owner…"). */
  label: string;
  items: readonly T[];
  value: string;
  onChange: (id: string) => void;
  /** The trigger: its class, its name when its body doesn't say it, a flag for its look, its body. */
  trigger: { className: string | undefined; name?: string; current?: boolean; body: ReactNode };
  /** Opens above the trigger (the sidebar's foot) or below it. */
  side?: "top" | "bottom";
  /** The popup sheet's own class (its width). */
  sheet: string | undefined;
  /** An option's row, before its tick. */
  row: (item: T) => ReactNode;
}

export function Choice<T extends ChoiceItem>(props: ChoiceProps<T>) {
  const { label, items, value, onChange, trigger, side = "bottom", sheet, row } = props;
  const layer = useLayer();
  const described = useDescribed();
  return (
    <Base.Root
      items={items}
      value={items.find((it) => it.id === value) ?? null}
      itemToStringLabel={(it: T) => it.label}
      isItemEqualToValue={(a: T, b: T) => a.id === b.id}
      onValueChange={(it: T | null) => {
        if (it !== null) onChange(it.id);
      }}
    >
      <Base.Trigger
        className={trigger.className}
        aria-label={trigger.name}
        {...described}
        data-current={trigger.current}
      >
        {trigger.body}
      </Base.Trigger>
      <Base.Portal {...layer}>
        <Base.Positioner side={side} align="start" sideOffset={() => tokenPx("--sp-2")}>
          <Base.Popup className={cx(p.sheet, sheet)} aria-label={label}>
            <Base.Input
              className={p.find}
              placeholder={`Change ${label.toLowerCase()}…`}
              aria-label={label}
            />
            <Base.Empty className={p.empty}>No match</Base.Empty>
            <Base.List>
              {(it: T) => (
                <Base.Item key={it.id} value={it} className={p.row}>
                  {row(it)}
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

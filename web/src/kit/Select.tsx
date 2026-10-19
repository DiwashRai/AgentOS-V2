// A picker: one of a list (the ticket's owner). Base UI does the keyboard, typeahead and
// placement; the look is ours: inline in a line of facts, a quiet value with a chevron.
import { Select as Base } from "@base-ui/react/select";

import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import s from "./Select.module.css";
import { tokenPx } from "./vars";

export interface Option {
  id: string;
  label: string;
  /** Draw the person's face before the label. */
  face?: boolean;
}

export interface SelectProps {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (id: string) => void;
}

function Label({ option }: { option: Option | undefined }) {
  if (!option) return null;
  return (
    <>
      {option.face ? <Avatar name={option.label} seed={option.id} /> : null}
      <span className={s.text}>{option.label}</span>
    </>
  );
}

export function Select({ label, value, options, onChange }: SelectProps) {
  const current = options.find((o) => o.id === value);
  return (
    <Base.Root
      value={value}
      items={options.map((o) => ({ value: o.id, label: o.label }))}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
    >
      <Base.Trigger className={s.trigger} aria-label={label}>
        <Label option={current} />
        <Base.Icon className={s.chev}>
          <Icon name="chevron" />
        </Base.Icon>
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner
          sideOffset={() => tokenPx("--sp-2")}
          alignItemWithTrigger={false}
          align="start"
        >
          <Base.Popup className={s.popup}>
            <Base.List>
              {options.map((o) => (
                <Base.Item key={o.id} value={o.id} className={s.item}>
                  <Label option={o} />
                  <Base.ItemIndicator className={s.check}>
                    <Icon name="check" />
                  </Base.ItemIndicator>
                </Base.Item>
              ))}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

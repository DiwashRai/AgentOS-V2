// A picker: one of a list (the ticket's owner). Base UI's combobox does the keyboard, filtering and
// placement; the look is ours: a property chip in a properties row (face, name, chevron); open,
// the kit's one popover, a "Change owner…" filter on its first line, the current one ticked.
import { Combobox as Base } from "@base-ui/react/combobox";

import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { useLayer } from "./layer";
import p from "./Popover.module.css";
import s from "./Select.module.css";
import { cx, tokenPx } from "./vars";

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
  /** chip: a property chip (the default); field: the form's field box, as wide as its slot, so a
   *  picker among fields reads as one of them (an agent's runtime beside its name). */
  look?: "chip" | "field";
}

/** `slot`: others in the list have faces, so a faceless one (Unassigned) gets Linear's no-one
 *  glyph, a dashed ring in the muted ink, firm enough to read on the popover. */
function Label({ option, slot }: { option: Option | null; slot: boolean }) {
  if (!option) return null;
  return (
    <>
      {option.face ? <Avatar name={option.label} seed={option.id} /> : null}
      {!option.face && slot ? <span className={s.nobody} aria-hidden="true" /> : null}
      <span className={s.text}>{option.label}</span>
    </>
  );
}

export function Select({ label, value, options, onChange, look = "chip" }: SelectProps) {
  const current = options.find((o) => o.id === value) ?? null;
  const slot = options.some((o) => o.face);
  const layer = useLayer();
  return (
    <Base.Root
      items={options}
      value={current}
      itemToStringLabel={(o: Option) => o.label}
      isItemEqualToValue={(a: Option, b: Option) => a.id === b.id}
      onValueChange={(o: Option | null) => {
        if (o !== null) onChange(o.id);
      }}
    >
      <Base.Trigger className={cx(s.trigger, look === "field" && s.field)} aria-label={label}>
        <Label option={current} slot={slot} />
        <Base.Icon className={s.chev}>
          <Icon name="chevron" />
        </Base.Icon>
      </Base.Trigger>
      <Base.Portal {...layer}>
        <Base.Positioner sideOffset={() => tokenPx("--sp-2")} align="start">
          <Base.Popup className={cx(p.sheet, s.sheet)} aria-label={label}>
            <Base.Input
              className={p.find}
              placeholder={`Change ${label.toLowerCase()}…`}
              aria-label={label}
            />
            <Base.Empty className={p.empty}>No match</Base.Empty>
            <Base.List>
              {(o: Option) => (
                <Base.Item key={o.id} value={o} className={p.row}>
                  <Label option={o} slot={slot} />
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

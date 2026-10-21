// A picker: one of a list (the ticket's owner, an agent's runtime, the theme). Base UI's combobox
// does the keyboard, filtering and placement; the look is ours: closed, a property chip (face, name,
// chevron), a form field, or a sidebar row (its glyph, the label, the current choice muted, a
// chevron pointing up); open, the kit's one popover, a "Change owner…" filter on its first line,
// each option with its picture, name and muted detail, the current one ticked. The sidebar's opens
// above the row, anchored to its start, as Linear's sidebar-foot menus do.
import { Combobox as Base } from "@base-ui/react/combobox";
import type { ReactNode } from "react";

import { Avatar } from "./Avatar";
import { Icon, type IconName } from "./Icon";
import { useLayer } from "./layer";
import p from "./Popover.module.css";
import s from "./Select.module.css";
import { cx, tokenPx } from "./vars";

export interface Option {
  id: string;
  label: string;
  /** Draw the person's face before the label. */
  face?: boolean;
  /** Muted after the name, in the open list (a theme's light or dark). */
  detail?: string;
  /** Its own picture before the name, in the open list (a theme's swatch). */
  aside?: ReactNode;
}

export interface SelectProps {
  /** Its accessible name, the filter's placeholder, and the sidebar row's word. */
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (id: string) => void;
  /** chip: a property chip (the default); field: the form's field box, as wide as its slot (an
   *  agent's runtime beside its name); side: a sidebar row (the theme). */
  look?: "chip" | "field" | "side";
  /** The sidebar row's glyph. */
  icon?: IconName;
}

/** `slot`: others in the list have faces, so a faceless one (Unassigned) gets the empty face. */
function Label({ option, slot }: { option: Option | null; slot: boolean }) {
  if (!option) return null;
  return (
    <>
      {option.face ? <Avatar name={option.label} seed={option.id} /> : null}
      {!option.face && slot ? <Avatar dashed /> : null}
      <span className={s.text}>{option.label}</span>
    </>
  );
}

function Trigger({ label, current, slot, look, icon }: TriggerProps) {
  if (look === "side") {
    return (
      <Base.Trigger className={s.side} aria-label={`${label}: ${current?.label ?? "none"}`}>
        {icon ? <Icon name={icon} /> : null}
        <span className={s.text}>{label}</span>
        <span className={s.now}>{current?.label}</span>
        <span className={cx(s.chev, s.up)}>
          <Icon name="chevron" />
        </span>
      </Base.Trigger>
    );
  }
  return (
    <Base.Trigger className={cx(s.trigger, look === "field" && s.field)} aria-label={label}>
      <Label option={current} slot={slot} />
      <Base.Icon className={s.chev}>
        <Icon name="chevron" />
      </Base.Icon>
    </Base.Trigger>
  );
}

interface TriggerProps {
  label: string;
  current: Option | null;
  slot: boolean;
  look: NonNullable<SelectProps["look"]>;
  icon: IconName | undefined;
}

export function Select({ label, value, options, onChange, look = "chip", icon }: SelectProps) {
  const current = options.find((o) => o.id === value) ?? null;
  const slot = options.some((o) => o.face);
  const layer = useLayer();
  const side = look === "side";
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
      <Trigger label={label} current={current} slot={slot} look={look} icon={icon} />
      <Base.Portal {...layer}>
        <Base.Positioner
          side={side ? "top" : "bottom"}
          align="start"
          sideOffset={() => tokenPx("--sp-2")}
        >
          <Base.Popup className={cx(p.sheet, side ? s.sideSheet : s.sheet)} aria-label={label}>
            <Base.Input
              className={p.find}
              placeholder={`Change ${label.toLowerCase()}…`}
              aria-label={label}
            />
            <Base.Empty className={p.empty}>No match</Base.Empty>
            <Base.List>
              {(o: Option) => (
                <Base.Item key={o.id} value={o} className={p.row}>
                  {o.aside ? <span className={s.aside}>{o.aside}</span> : null}
                  <Label option={o} slot={slot} />
                  {o.detail ? <span className={p.aside}>{o.detail}</span> : null}
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

// A picker: one of a list (the ticket's owner, an agent's runtime, the theme). Base UI's combobox
// does the keyboard, filtering and placement; the look is ours: closed, a property chip (face,
// name, chevron) or a sidebar row (its glyph, the label, the current choice muted, a chevron
// pointing up); open, the kit's one popover, a "Change owner…" filter on its first line,
// each option with its picture, name and muted detail, the current one ticked. The sidebar's opens
// above the row, anchored to its start, as Linear's sidebar-foot menus do.
import type { ReactNode } from "react";

import { Avatar } from "./Avatar";
import { Choice } from "./choice";
import { Icon, type IconName } from "./Icon";
import p from "./Popover.module.css";
import s from "./Select.module.css";
import { cx } from "./vars";

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
  /** chip: a property chip (the default; an agent's runtime among its properties); side: a sidebar
   *  row (the theme). */
  look?: "chip" | "side";
  /** The sidebar row's glyph. */
  icon?: IconName;
}

/** `slot`: others in the list have faces, so a faceless one (Unassigned) gets the empty face. */
function Label({ option, slot }: { option: Option | null; slot: boolean }) {
  if (!option) return null;
  return (
    <>
      {option.face ? <Avatar name={option.label} seed={option.id} beside /> : null}
      {!option.face && slot ? <Avatar dashed /> : null}
      <span className={s.text}>{option.label}</span>
    </>
  );
}

/** The trigger's body: a sidebar row's glyph, word, current choice and upward chevron; else the
 *  current option and a chevron. */
function TriggerBody({ label, current, slot, look, icon }: TriggerProps) {
  if (look === "side") {
    return (
      <>
        {icon ? (
          <span className={s.glyph}>
            <Icon name={icon} />
          </span>
        ) : null}
        {/* the name says the label; the content is the value, the current choice */}
        <span className={s.text} aria-hidden="true">
          {label}
        </span>
        <span className={s.now}>{current?.label}</span>
        <span className={cx(s.chev, s.up)}>
          <Icon name="chevron" />
        </span>
      </>
    );
  }
  return (
    <>
      <Label option={current} slot={slot} />
      <span className={s.chev} aria-hidden="true">
        <Icon name="chevron" />
      </span>
    </>
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
  const side = look === "side";
  return (
    <Choice
      label={label}
      items={options}
      value={value}
      onChange={onChange}
      side={side ? "top" : "bottom"}
      sheet={side ? s.sideSheet : s.sheet}
      trigger={{
        className: side ? s.side : s.trigger,
        name: label,
        body: <TriggerBody label={label} current={current} slot={slot} look={look} icon={icon} />,
      }}
      row={(o) => (
        <>
          {o.aside ? <span className={s.aside}>{o.aside}</span> : null}
          <Label option={o} slot={slot} />
          {o.detail ? <span className={p.aside}>{o.detail}</span> : null}
        </>
      )}
    />
  );
}

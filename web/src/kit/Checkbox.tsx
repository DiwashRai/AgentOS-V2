// A setting that is on or off, said in words beside a box (take a query's issues in by
// themselves), as Linear's checkbox: the box and its label are one target, a quiet line under the
// label says what it means. A switch (Toggle) is for a setting named by the row it sits in; a
// checkbox says its own words. Base UI's checkbox does the role, Space and the form value.
import { Checkbox as Base } from "@base-ui/react/checkbox";
import { useId } from "react";

import s from "./Form.module.css";
import { Icon } from "./Icon";

export interface CheckboxProps {
  /** The words beside the box: its name. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** A quiet line under the words: what it means. */
  note?: string;
}

export function Checkbox({ label, checked, onChange, note }: CheckboxProps) {
  const said = useId();
  return (
    <label className={s.choice}>
      <Base.Root
        className={s.check}
        checked={checked}
        onCheckedChange={(on) => {
          onChange(on);
        }}
        {...(note ? { "aria-describedby": said } : {})}
      >
        <Base.Indicator className={s.mark}>
          <Icon name="check" />
        </Base.Indicator>
      </Base.Root>
      <span className={s.words}>
        {label}
        {note ? (
          <span className={s.note} id={said}>
            {note}
          </span>
        ) : null}
      </span>
    </label>
  );
}

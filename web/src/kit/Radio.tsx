// One of a few, all in view with what each means (how intake takes issues in: ask first, or take
// them all), as Linear's radios: each a ring and its words, one target, a quiet line under the
// words. Select is for one of many in a popup; Segmented is for filters. Base UI's radio group
// does the role, the arrow keys (they move and choose) and the form value; a FormRow's note and
// problem describe the group.
import { Radio as Base } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId } from "react";

import { useDescribed } from "./described";
import s from "./Form.module.css";

export interface RadioOption {
  id: string;
  label: string;
  /** A quiet line under the words: what choosing it means. */
  note?: string;
}

export interface RadioProps {
  /** The group's name (a FormRow's label says it on screen). */
  label: string;
  value: string;
  options: readonly RadioOption[];
  onChange: (id: string) => void;
}

function Choice({ option, id }: { option: RadioOption; id: string }) {
  return (
    <label className={s.choice}>
      <Base.Root
        className={s.radio}
        value={option.id}
        {...(option.note ? { "aria-describedby": id } : {})}
      >
        <Base.Indicator className={s.pip} />
      </Base.Root>
      <span className={s.words}>
        {option.label}
        {option.note ? (
          <span className={s.note} id={id}>
            {option.note}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function Radio({ label, value, options, onChange }: RadioProps) {
  const described = useDescribed();
  const said = useId();
  return (
    <RadioGroup
      className={s.choices}
      aria-label={label}
      {...described}
      value={value}
      onValueChange={(id) => {
        onChange(id);
      }}
    >
      {options.map((o) => (
        <Choice key={o.id} option={o} id={`${said}${o.id}`} />
      ))}
    </RadioGroup>
  );
}

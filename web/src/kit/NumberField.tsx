// A whole number in a range (a timeout in minutes, a loop's rounds, a check's repairs): its digits
// and unit between − and +. Arrow keys step it; typing keeps a draft until it is a number in range.
import { useState } from "react";

import s from "./Form.module.css";
import { Icon } from "./Icon";
import { cx } from "./vars";

export interface NumberFieldProps {
  /** Its accessible name. */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** After the digits (min, rounds). */
  unit?: string;
}

export function NumberField({ label, value, onChange, min, max, unit }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const set = (n: number) => {
    if (Number.isInteger(n) && n >= min && n <= max) onChange(n);
  };
  return (
    <span className={cx(s.box, s.number)}>
      <button
        type="button"
        className={s.step}
        tabIndex={-1}
        aria-label={`Less: ${label}`}
        disabled={value <= min}
        onClick={() => {
          set(value - 1);
        }}
      >
        <Icon name="minus" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={draft ?? String(value)}
        onChange={(e) => {
          setDraft(e.currentTarget.value);
          set(e.currentTarget.valueAsNumber);
        }}
        onBlur={() => {
          setDraft(null);
        }}
      />
      {unit ? <span className={s.unit}>{unit}</span> : null}
      <button
        type="button"
        className={s.step}
        tabIndex={-1}
        aria-label={`More: ${label}`}
        disabled={value >= max}
        onClick={() => {
          set(value + 1);
        }}
      >
        <Icon name="plus" />
      </button>
    </span>
  );
}

// An on/off setting as Linear's switch (enabled, resume, needs a repo, writable by agents): a
// button with the switch role, so Space and a click flip it.
import s from "./Form.module.css";

export interface ToggleProps {
  /** Its accessible name and tooltip (a FormRow's label says it on screen). */
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
}

export function Toggle({ label, on, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      className={s.switch}
      onClick={() => {
        onChange(!on);
      }}
    />
  );
}

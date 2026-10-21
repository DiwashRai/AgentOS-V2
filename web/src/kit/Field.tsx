// A one-line text field (a name, a shell command, a model id): Linear's input, as wide as its slot.
import s from "./Form.module.css";
import { cx } from "./vars";

export interface FieldProps {
  /** Its accessible name (a FormRow's label says it on screen). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Monospace, for a command or a path. */
  mono?: boolean;
}

export function Field({ label, value, onChange, placeholder, mono }: FieldProps) {
  return (
    <input
      type="text"
      className={cx(s.box, s.field, mono && s.mono)}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      spellCheck={!mono}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
    />
  );
}

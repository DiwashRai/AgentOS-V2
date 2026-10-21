// A one-line text field (a name, a shell command, a model id): Linear's input, as wide as its slot.
// A search field (a panel's own list) leads with the search glyph, is the page's search input to
// the sidebar's Search, and Esc clears it (then leaves it).
import { Icon } from "./Icon";
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
  /** A search over a list: the glyph before it, and Esc to clear. */
  search?: boolean;
}

export function Field({ label, value, onChange, placeholder, mono, search }: FieldProps) {
  const input = (
    <input
      type={search ? "search" : "text"}
      className={cx(s.box, s.field, mono && s.mono, search && s.find)}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      spellCheck={!mono && !search}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
      onKeyDown={(e) => {
        if (!search || e.key !== "Escape") return;
        if (value === "") e.currentTarget.blur();
        else onChange("");
      }}
    />
  );
  if (!search) return input;
  return (
    <span className={s.searchWrap}>
      <Icon name="search" />
      {input}
    </span>
  );
}

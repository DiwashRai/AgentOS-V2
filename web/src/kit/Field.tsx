// A one-line text field (a name, a shell command, a model id): Linear's input, as wide as its slot.
// A search field (a view's search in its top bar, a panel's own list) is the kit's one search box:
// the search glyph, the text, a "/" keycap. "/" focuses the search of the top layer; Esc clears it,
// then leaves it, and never also closes the overlay it is in.
import { type RefObject, useEffect, useRef } from "react";

import { Badge } from "./Badge";
import s from "./Form.module.css";
import { Icon } from "./Icon";
import { useDescribed } from "./described";
import { activeSearch, isShortcut } from "./search";
import { cx } from "./vars";

export interface FieldProps {
  /** Its accessible name (a FormRow's label says it on screen). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Monospace, for a command or a path. */
  mono?: boolean;
  /** A search over a list or a view: the search box. */
  search?: boolean;
  /** A document's own words, unboxed on the page: an item's name as its title, its description as
   *  the lead under it, a block's name as its heading. */
  look?: "title" | "lead" | "heading";
}

/** "/" focuses this search when it is the top layer's. */
function useSlash(ref: RefObject<HTMLInputElement | null>, on: boolean) {
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || !isShortcut(e) || activeSearch() !== ref.current) return;
      e.preventDefault();
      ref.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, on]);
}

export function Field({ label, value, onChange, placeholder, mono, search, look }: FieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const described = useDescribed();
  useSlash(ref, search === true);
  const input = (
    <input
      ref={ref}
      type={search ? "search" : "text"}
      aria-keyshortcuts={search ? "/" : undefined}
      className={
        search ? s.findInput : cx(s.box, s.field, mono && s.mono, look && s.ghost, look && s[look])
      }
      aria-label={label}
      {...described}
      value={value}
      placeholder={placeholder}
      spellCheck={!mono && !search}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
      onKeyDown={(e) => {
        if (!search || e.key !== "Escape") return;
        // the search's own: an overlay it sits in stays open
        e.preventDefault();
        e.stopPropagation();
        if (value === "") e.currentTarget.blur();
        else onChange("");
      }}
    />
  );
  if (!search) return input;
  return (
    <label className={s.search}>
      <Icon name="search" />
      {input}
      <span aria-hidden="true">
        <Badge kind="kbd">/</Badge>
      </span>
    </label>
  );
}

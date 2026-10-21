// Markdown in a monospace area (an agent's instructions, a SKILL.md, a stage's prompt, a block of
// AGENTS.md): at least `lines` tall and growing with its text, or filling its column. Every area
// can pop out to the whole window, for long text: the same value, edited at a readable measure,
// and Done or Esc brings it back (inside an overlay too: it opens over it).
import { useState } from "react";

import { Button } from "./Button";
import { Dialog } from "./Dialog";
import s from "./Form.module.css";
import { Page } from "./Page";
import { cx, vars } from "./vars";

export interface TextAreaProps {
  /** Its accessible name, and the popped-out window's title. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Its least height in lines (3 by default); it grows with its text. */
  lines?: number;
  /** Fill the height of the column it is in and scroll inside (an item editor's body). */
  fill?: boolean;
}

export function TextArea({ label, value, onChange, placeholder, lines = 3, fill }: TextAreaProps) {
  const [out, setOut] = useState(false);
  const area = (full: boolean) => (
    <textarea
      className={cx(s.box, s.area, (full || fill === true) && s.fill)}
      style={vars({ "--lines": String(lines) })}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      spellCheck={false}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
    />
  );
  const close = () => {
    setOut(false);
  };
  return (
    <div className={cx(s.areaWrap, fill && s.fill)}>
      {area(false)}
      <span className={s.pop}>
        <Button
          variant="quiet"
          size="xs"
          icon="expand"
          title={`Edit ${label} in the whole window`}
          onClick={() => {
            setOut(true);
          }}
        />
      </span>
      <Dialog label={label} open={out} onClose={close} look="full">
        <Page
          title={label}
          action={
            <Button variant="ink" size="sm" onClick={close}>
              Done
            </Button>
          }
        >
          <div className={s.popped}>{area(true)}</div>
        </Page>
      </Dialog>
    </div>
  );
}

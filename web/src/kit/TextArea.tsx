// Markdown in a monospace area (an agent's instructions, a SKILL.md, a stage's prompt, a block of
// AGENTS.md): at least `lines` tall and growing with its text, or filling its column; an item
// editor's is a framed sheet under its own head strip. Every area
// can pop out to the whole window, for long text: the same value, edited at a readable measure,
// and Done or Esc brings it back (inside an overlay too: it opens over it).
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { Button } from "./Button";
import { describe, useDescription } from "./described";
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
  /** A sheet: this strip over the text (an item editor's content: its title, or a block's name,
   *  length and moves), the pop-out at its end, the whole ringed while the text has the focus. */
  head?: ReactNode;
  /** Folded to its head strip alone (a block of AGENTS.md; its head says the first line). */
  folded?: boolean;
}

export function TextArea(props: TextAreaProps) {
  const { label, value, onChange, placeholder, lines = 3, fill, head, folded } = props;
  const sheet = head !== undefined;
  const [out, setOut] = useState(false);
  const popped = useRef<HTMLTextAreaElement>(null);
  const description = useDescription();
  const words = useId();
  // popped out, the text has the focus (after the window's own, which takes it as it opens)
  useEffect(() => {
    if (!out) return;
    const f = requestAnimationFrame(() => popped.current?.focus());
    return () => {
      cancelAnimationFrame(f);
    };
  }, [out]);
  // popped out, the row's note and problem are out of reach (the page under the window is inert):
  // the popped area is described by its own copies of them, under it
  const inline = description ? describe(description.id, description) : {};
  const own = description ? describe(words, description) : {};
  const area = (full: boolean) => (
    <textarea
      ref={full ? popped : undefined}
      className={cx(s.box, s.area, (full || fill === true) && s.fill, sheet && !full && s.leaf)}
      style={vars({ "--lines": String(lines) })}
      aria-label={label}
      {...(full ? own : inline)}
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
  const pop = (
    <Pop
      label={label}
      corner={!sheet}
      onPop={() => {
        setOut(true);
      }}
    />
  );
  return (
    <div className={cx(s.areaWrap, fill && s.areaFill, sheet && s.sheet)}>
      {sheet ? (
        <>
          <div className={s.sheetHead}>
            {head}
            {pop}
          </div>
          {folded ? null : area(false)}
        </>
      ) : (
        <>
          {area(false)}
          {pop}
        </>
      )}
      <Dialog label={label} open={out} onClose={close} look="full">
        <Page
          title={label}
          action={
            <Button variant="ink" size="sm" onClick={close}>
              Done
            </Button>
          }
        >
          <div className={s.popped}>
            <Words id={words} note={description?.note} problem={description?.problem}>
              {area(true)}
            </Words>
          </div>
        </Page>
      </Dialog>
    </div>
  );
}

/** The pop-out: at a sheet's head strip's end, or in a plain area's top right corner. */
function Pop({ label, corner, onPop }: { label: string; corner: boolean; onPop: () => void }) {
  return (
    <span className={corner ? s.pop : undefined}>
      <Button
        variant="quiet"
        size="xs"
        icon="expand"
        title={`Edit ${label} in the whole window`}
        onClick={onPop}
      />
    </span>
  );
}

/** The popped-out area with its own copies of the row's note and problem under it. */
function Words({ id, note, problem, children }: WordsProps) {
  return (
    <div className={s.poppedCol}>
      {children}
      {note ? (
        <span className={s.note} id={`${id}n`}>
          {note}
        </span>
      ) : null}
      {problem ? (
        <span className={s.problem} id={`${id}p`}>
          {problem}
        </span>
      ) : null}
    </div>
  );
}

interface WordsProps {
  id: string;
  note: string | undefined;
  problem: string | undefined;
  children: ReactNode;
}

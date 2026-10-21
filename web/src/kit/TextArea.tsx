// Markdown in a monospace area (an agent's instructions, a SKILL.md, a stage's prompt, a block of
// AGENTS.md): at least `lines` tall and growing with its text; an item editor's is a section of
// its document, a ruled head strip over its text read as a document (headings, lists, `code`, front
// matter, a fenced block) over its hidden source, which a click edits in place. Every area
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
  /** A sheet: this strip over the text (an item editor's content: its title and length, or a
   *  block's fold and name), the pop-out at its end, its rule lit while the text has the focus. */
  head?: ReactNode;
  /** A sheet's controls at its head's end, before the pop-out (a block's moves, then its handle):
   *  all but the last show while the sheet is hovered or holds the focus. */
  tools?: ReactNode;
  /** Folded to its head strip alone (a block of AGENTS.md; its head says the first line). */
  folded?: boolean;
}

export function TextArea(props: TextAreaProps) {
  const { label, value, onChange, placeholder, lines = 3, head, tools, folded } = props;
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
      className={cx(
        s.box,
        s.area,
        full && s.fill,
        sheet && !full && s.leaf,
        folded !== undefined && s.under,
      )}
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
    <div className={cx(s.areaWrap, sheet && s.sheet)}>
      {sheet ? (
        <>
          <div className={s.sheetHead}>
            {head}
            {tools !== undefined ? <span className={s.tools}>{tools}</span> : null}
            {pop}
          </div>
          {folded ? null : (
            <Read value={value} under={folded !== undefined}>
              {area(false)}
            </Read>
          )}
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

/** A sheet's source (`children`) under its text read as a document, which hides while the source
 *  has the focus. */
function Read({ value, under, children }: { value: string; under: boolean; children: ReactNode }) {
  return (
    <div className={s.read}>
      {children}
      <div className={cx(s.leaf, s.prose, under && s.under)} aria-hidden>
        {prose(value)}
      </div>
    </div>
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

/** A run of words: its `code` a chip, its **strong** words strong (the split's odd parts). */
function span(w: string, i: number): ReactNode {
  const Tag = w.startsWith("`") ? "code" : "strong";
  return i % 2 ? <Tag key={i}>{w.replace(/^(`|\*\*)|(`|\*\*)$/g, "")}</Tag> : w;
}
const runs = (text: string) => text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/).map(span);

const item = (l: string) => <li key={l}>{runs(l.slice(2))}</li>;

/** A paragraph: front matter as a code block, a list when every line is an item, a heading, or
 *  plain words. */
function para(text: string, key: string): ReactNode {
  if (text.startsWith("---")) return <pre key={key}>{text}</pre>;
  const items = text.split("\n");
  if (items.every((l) => /^[-*] /.test(l))) return <ul key={key}>{items.map(item)}</ul>;
  const Tag = text.startsWith("#") ? "h4" : "p";
  return <Tag key={key}>{runs(text.replace(/^#+\s*/, ""))}</Tag>;
}

/** Markdown read as a document: its paragraphs, and its fences' insides (the split's odd parts)
 *  as code blocks. */
const prose = (text: string) =>
  text
    .split(/^```.*$/m)
    .flatMap((part, i) =>
      i % 2
        ? [<pre key={i}>{part.replace(/^\n|\n$/g, "")}</pre>]
        : (part.match(/\S.*(\n.+)*/g) ?? []).map((p, k) => para(p, `${String(i)}.${String(k)}`)),
    );

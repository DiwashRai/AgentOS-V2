// A named part of a view, as Linear's: a heading, quiet words after it (a count, "2 of 5 done") or
// a line under it (what the part is for, or a subline of chips), something at the head's end
// (faces, an Edit), then its body. It is a <section> named by its heading (and described by its
// line), so assistive tech can list and jump to it. In a side panel (the peek) each Section is one
// of the panel's parts, padded and ruled off from the next; a Section inside a part, or anything
// opened from one, is not a part itself.
import { createContext, type ReactNode, useContext, useId } from "react";

import s from "./Section.module.css";
import t from "./Text.module.css";
import { cx } from "./vars";

/** A side panel's body: the Sections directly in it are its parts. */
export const InPanel = createContext(false);

export type SectionProps = { children: ReactNode } & (
  | {
      /** The heading, and the part's name. */
      title: string;
      /** Quiet words right after the heading, with a glyph if it has one (a plan's pie, "2/5"). */
      aside?: ReactNode;
      /** A quiet line under the heading: what the part is for, or its subline (a copy's drift). */
      note?: ReactNode;
      /** At the head's end: who is in it, its one action. */
      end?: ReactNode;
      label?: never;
    }
  | {
      /** No head of its own (a ticket's head, its title the heading inside it): the part's name
       *  for assistive tech only. */
      label: string;
      title?: never;
      aside?: never;
      note?: never;
      end?: never;
    }
);

interface HeadProps {
  id: string;
  title: string;
  aside: ReactNode;
  note: ReactNode;
  end: ReactNode;
}

function SectionHead({ id, title, aside, note, end }: HeadProps) {
  return (
    <div className={s.head}>
      <div className={s.line}>
        <h2 className={cx(t.text, t.heading, s.title)} id={`${id}h`}>
          {title}
        </h2>
        {aside ? <span className={s.aside}>{aside}</span> : null}
        {end ? <span className={s.end}>{end}</span> : null}
      </div>
      {note ? (
        <div className={s.note} id={`${id}n`}>
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function Section(props: SectionProps) {
  const { aside, note, end, children } = props;
  const id = useId();
  const panel = useContext(InPanel);
  const named =
    props.title !== undefined
      ? { "aria-labelledby": `${id}h`, ...(note ? { "aria-describedby": `${id}n` } : {}) }
      : { "aria-label": props.label };
  return (
    <section className={cx(s.section, panel && s.part)} {...named}>
      {props.title !== undefined ? (
        <SectionHead id={id} title={props.title} aside={aside} note={note} end={end} />
      ) : null}
      <InPanel value={false}>{children}</InPanel>
    </section>
  );
}

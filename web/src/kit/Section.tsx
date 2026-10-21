// A named part of a view, as Linear's: a heading, quiet words after it (a count, "2 of 5 done") or
// a line under it (what the part is for), something at the head's end (faces, an Edit), then its
// body. It is a <section> named by its heading, so assistive tech can list and jump to it. In a
// side panel (the peek) each Section is one of the panel's parts, padded and ruled off from the
// next; anywhere else it is just the heading over the body.
import { createContext, type ReactNode, useContext, useId } from "react";

import s from "./Section.module.css";
import { cx } from "./vars";

/** A side panel's body: its Sections are its parts. */
export const InPanel = createContext(false);

export type SectionProps = { children: ReactNode } & (
  | {
      /** The heading, and the part's name. */
      title: string;
      /** Quiet words right after the heading ("2 of 5 done"). */
      aside?: string | undefined;
      /** A quiet line under the heading: what the part is for. */
      note?: string;
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

function SectionHead({
  id,
  title,
  aside,
  note,
  end,
}: {
  id: string;
  title: string;
  aside: string | undefined;
  note: string | undefined;
  end: ReactNode;
}) {
  return (
    <div className={s.head}>
      <div className={s.line}>
        <h2 className={s.title} id={id}>
          {title}
        </h2>
        {aside ? <span className={s.aside}>{aside}</span> : null}
        {end ? <span className={s.end}>{end}</span> : null}
      </div>
      {note ? <p className={s.note}>{note}</p> : null}
    </div>
  );
}

export function Section(props: SectionProps) {
  const { aside, note, end, children } = props;
  const id = useId();
  const panel = useContext(InPanel);
  const named =
    props.title !== undefined ? { "aria-labelledby": id } : { "aria-label": props.label };
  return (
    <section className={cx(s.section, panel && s.part)} {...named}>
      {props.title !== undefined ? (
        <SectionHead id={id} title={props.title} aside={aside} note={note} end={end} />
      ) : null}
      {children}
    </section>
  );
}

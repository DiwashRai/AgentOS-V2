import type { ReactNode } from "react";

import s from "./Surface.module.css";
import { cx, type Space, space, vars } from "./vars";

export interface SurfaceProps {
  children: ReactNode;
  /** recess: the one zone per view, flush on the sheet; sheet: a panel of tone held over it (a
   *  hairline, a soft shadow); list: a section of a view under its own head (a zone of My queue,
   *  an Intake query), no card, parted from the one before by room and a hairline. */
  level?: "recess" | "sheet" | "list";
  /** Fill the page's height; only the content inside scrolls. */
  fill?: boolean;
  /** Its children are its parts (an options panel's sections, as Linear's): a hairline between
   *  each and the next, its padding's room on both sides of it. */
  parts?: boolean;
  pad?: Space;
  label?: string;
}

export function Surface({ children, level = "recess", fill, parts, pad = 0, label }: SurfaceProps) {
  return (
    <section
      className={cx(s.surface, s[level], fill && s.fill, parts && s.parts)}
      style={vars({ "--pad": space(pad) })}
      aria-label={label}
    >
      {children}
    </section>
  );
}

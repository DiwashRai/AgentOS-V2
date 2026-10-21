import type { ReactNode } from "react";

import s from "./Surface.module.css";
import { cx, type Space, space, vars } from "./vars";

export interface SurfaceProps {
  children: ReactNode;
  /** recess: the one sunken zone per view; sheet: a raised panel resting on it; list: a sheet whose
   *  list rows run to its edges (an Intake query), clipped to its corners. */
  level?: "recess" | "sheet" | "list";
  /** Fill the page's height; only the content inside scrolls. */
  fill?: boolean;
  pad?: Space;
  label?: string;
}

export function Surface({ children, level = "recess", fill, pad = 0, label }: SurfaceProps) {
  return (
    <section
      className={cx(s.surface, s[level], fill && s.fill)}
      style={vars({ "--pad": space(pad) })}
      aria-label={label}
    >
      {children}
    </section>
  );
}

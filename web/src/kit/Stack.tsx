import type { ReactNode } from "react";

import s from "./Stack.module.css";
import { cx, type Space, space, vars } from "./vars";

export interface StackProps {
  children?: ReactNode;
  /** row: side by side; column (the default): one under another. */
  dir?: "row" | "column";
  gap?: Space;
  align?: "start" | "center" | "baseline";
  justify?: "end" | "between";
  wrap?: boolean;
  /** Take the free space, and let the content shrink below its own width. */
  grow?: boolean;
  /** Lay the children out in equal columns instead: 3, the agents' cards; 2, a form's settings
   *  side by side, one under another where the column is too narrow for two. */
  cols?: 2 | 3;
}

/** The one layout box: screens lay out with it instead of raw <div>s. */
export function Stack({
  children,
  dir = "column",
  gap = 0,
  align,
  justify,
  wrap,
  grow,
  cols,
}: StackProps) {
  return (
    <div
      className={cx(s.stack, wrap && s.wrap, grow && s.grow, cols && s.cols)}
      data-dir={dir}
      data-align={align}
      data-justify={justify}
      data-cols={cols}
      style={vars({ "--gap": space(gap), "--n": cols ? String(cols) : undefined })}
    >
      {children}
    </div>
  );
}

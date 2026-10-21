import type { ReactNode } from "react";

import s from "./Text.module.css";
import { cx, type Tone } from "./vars";

export type TextVariant =
  "display" | "title" | "heading" | "body" | "label" | "ui" | "meta" | "code";

export interface TextProps {
  children: ReactNode;
  /** The type role: its size, weight, line height and default ink. */
  variant?: TextVariant;
  tone?: Tone;
  /** 400 sets a label-sized line in the regular weight (a run's step, a card's title). */
  weight?: 400 | 500 | 600;
  /** One line (or two), cut with an ellipsis; give the full text as `title`. */
  truncate?: boolean | 2;
  /** Figures of one width, so counts and times line up. */
  tabular?: boolean;
  title?: string;
  /** The element: a heading or paragraph where the document needs one, else a span. */
  as?: "span" | "p" | "h1" | "h2";
}

/** All text on a screen: a role from the type scale, never a raw size. */
export function Text({
  children,
  variant = "ui",
  tone,
  weight,
  truncate,
  tabular,
  title,
  as,
}: TextProps) {
  const Tag = as ?? "span";
  return (
    <Tag
      className={cx(
        s.text,
        s[variant],
        truncate === true && s.truncate,
        truncate === 2 && s.clamp,
        tabular && s.tabular,
      )}
      data-tone={tone}
      data-weight={weight}
      title={title}
    >
      {children}
    </Tag>
  );
}

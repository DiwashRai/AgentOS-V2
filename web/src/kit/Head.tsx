// The head over a zone (My queue), a group (Compact, Intake) or a rack group: name, count pill,
// note, hairline, and a summary slot. A head with `fold` collapses its group; the screen then
// leaves the group's rows out.
import type { ReactNode } from "react";

import { Badge } from "./Badge";
import s from "./Head.module.css";
import { Icon } from "./Icon";
import { cx } from "./vars";

export interface HeadProps {
  name: string;
  count?: number;
  /** Before the name: a status glyph, or a project key. */
  icon?: ReactNode;
  /** you: the name and count in the you hue (Needs you); done: in green. */
  tone?: "neutral" | "you" | "done";
  /** Quiet, right after the count ("Longest wait first"). */
  note?: string;
  /** After the hairline: a stat, links. */
  summary?: ReactNode;
  /** zone: My queue's 15px heading; group: the dense lists' head; rack: a small static head. */
  level?: "zone" | "group" | "rack";
  /** Collapsible: whether the group is open, and how to flip it. */
  fold?: { open: boolean; toggle: () => void };
}

export function Head({
  name,
  count,
  icon,
  tone = "neutral",
  note,
  summary,
  level = "group",
  fold,
}: HeadProps) {
  const title = (
    <>
      {icon ? <span className={s.icon}>{icon}</span> : null}
      <span className={s.name}>{name}</span>
      {count !== undefined ? (
        <Badge kind="count" tone={tone}>
          {count}
        </Badge>
      ) : null}
    </>
  );
  return (
    <div className={cx(s.head, s[level], s[tone])}>
      {fold ? (
        <button type="button" className={s.toggle} aria-expanded={fold.open} onClick={fold.toggle}>
          <span className={s.chev}>
            <Icon name="chevron" />
          </span>
          {title}
        </button>
      ) : (
        <h2 className={s.static}>{title}</h2>
      )}
      {note ? <span className={s.note}>{note}</span> : null}
      <span className={s.rule} aria-hidden="true" />
      {summary ? <span className={s.summary}>{summary}</span> : null}
    </div>
  );
}

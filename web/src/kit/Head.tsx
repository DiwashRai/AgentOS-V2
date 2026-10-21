// The head over a group (Compact, My queue's lists), a zone (My queue's cards) or a list's run of
// lines (Intake): name, count, note, and a summary slot at the far end. A zone or group head is a
// band; a line head is a plain line of the list. A head with `fold` collapses its group; the
// screen then leaves the group's rows out.
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
  /** you: the count in the you hue (Needs you); done: in green. The name stays in ink. */
  tone?: "neutral" | "you" | "done";
  /** Quiet, right after the count ("Longest wait first"). */
  note?: string;
  /** At the far end: a stat, links. */
  summary?: ReactNode;
  /** group: a list's edge-to-edge band (with or without a fold), its glyph over the rows' first
   *  cell; zone: the same band run through its surface's padding (over My queue's agent cards);
   *  line: a plain line of the list, on its hairline, lit on hover like a row (it is the row a
   *  Swap in its summary answers to), its fold reaching across it (Intake's queries). */
  level?: "zone" | "group" | "line";
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
    <div
      className={cx(s.head, s[level], s[tone])}
      data-head={level}
      data-row={level === "line" ? "" : undefined}
    >
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

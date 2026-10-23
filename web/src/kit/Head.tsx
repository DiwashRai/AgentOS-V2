// The head over a group (Compact, My queue's zones) or a list's run of lines (Intake): name,
// count, note, and a summary slot at the far end. Every head is a heading set apart by room, never
// a band. A head with `fold` collapses its group; the screen then leaves the group's rows out.
import { type ReactNode, useContext } from "react";

import { Badge } from "./Badge";
import s from "./Head.module.css";
import { Icon } from "./Icon";
import { Scrolling } from "./Table";
import { cx } from "./vars";

export interface HeadProps {
  name: string;
  count?: number | undefined;
  /** Before the name: a status glyph, or a project key. */
  icon?: ReactNode;
  /** The group's state: its count says it (you: Needs you, in the accent; live, blocked, done a
   *  step firmer in ink). The heading keeps one look and the name in ink. */
  tone?: "neutral" | "you" | "live" | "blocked" | "done";
  /** Quiet, right after the count ("Longest wait first"). */
  note?: string | undefined;
  /** At the far end: a stat, links. */
  summary?: ReactNode;
  /** group: a list's heading, parted from the group before by room, no band (with or without a
   *  fold), its glyph hung on the list's column edge, the rows' words inset under it; line: a
   *  query's head, parted from the run before by room, held at the list's top, lit on hover like a
   *  row (it is the row a Swap in its summary answers to), its fold reaching across it, the chevron
   *  on the column edge (Intake's). */
  level?: "group" | "line";
  /** Collapsible: whether the group is open, and how to flip it. */
  fold?: { open: boolean; toggle: () => void };
}

interface TitleProps {
  name: string;
  count: number | undefined;
  icon: ReactNode;
  tone: NonNullable<HeadProps["tone"]>;
  note: ReactNode;
}

/** The glyph or key, the name, the count, and a line's note. */
function Title({ name, count, icon, tone, note }: TitleProps) {
  return (
    <>
      {icon ? <span className={s.icon}>{icon}</span> : null}
      <span className={s.name}>{name}</span>
      {count !== undefined ? (
        <Badge kind="count" tone={tone}>
          {count}
        </Badge>
      ) : null}
      {note}
    </>
  );
}

/** The title as a heading; when the group folds, the heading holds the fold's button (the
 *  disclosure pattern), so heading navigation finds every group. */
function Lead({ fold, title }: { fold: HeadProps["fold"]; title: ReactNode }) {
  if (!fold) return <h2 className={s.static}>{title}</h2>;
  return (
    <h2 className={s.holds}>
      <button type="button" className={s.toggle} aria-expanded={fold.open} onClick={fold.toggle}>
        <span className={s.chev}>
          <Icon name="chevron" />
        </span>
        {title}
      </button>
    </h2>
  );
}

function useSticky(level: NonNullable<HeadProps["level"]>): boolean {
  return useContext(Scrolling) && level === "group";
}

export function Head(props: HeadProps) {
  const { name, count, icon, tone = "neutral", note, summary, level = "group", fold } = props;
  // a line's note belongs to its name ("didn't answer"), inside the fold that reaches across it
  const noteEl = note ? <span className={s.note}>{note}</span> : null;
  const inFold = level === "line" && fold !== undefined;
  // a group head in a list that scrolls inside its surface stays at its top
  const sticky = useSticky(level);
  const title = (
    <Title name={name} count={count} icon={icon} tone={tone} note={inFold ? noteEl : null} />
  );
  return (
    <div
      className={cx(s.head, s[level], sticky && s.sticky)}
      data-row={level === "line" ? "" : undefined}
    >
      <Lead fold={fold} title={title} />
      {inFold ? null : noteEl}
      <span className={s.rule} aria-hidden="true" />
      {summary ? <span className={s.summary}>{summary}</span> : null}
    </div>
  );
}

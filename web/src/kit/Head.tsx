// The head over a group (Compact, My queue's lists), a zone (My queue's cards) or a list's run of
// lines (Intake): name, count, note, and a summary slot at the far end. A zone or group head is a
// band; a line head is a plain line of the list. A head with `fold` collapses its group; the
// screen then leaves the group's rows out.
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
  /** The group's state: its band is washed in that hue and its count written in it (you: Needs
   *  you; live: running; blocked; done). The name stays in ink. */
  tone?: "neutral" | "you" | "live" | "blocked" | "done";
  /** Quiet, right after the count ("Longest wait first"). */
  note?: string | undefined;
  /** At the far end: a stat, links. */
  summary?: ReactNode;
  /** group: a list's edge-to-edge band (with or without a fold), its glyph over the rows' first
   *  cell; zone: the same band run through its surface's padding (over My queue's agent cards);
   *  line: a query card's head, a faint band on its hairline, lit on hover like a row (it is the
   *  row a Swap in its summary answers to), its fold reaching across it (Intake's queries). */
  level?: "zone" | "group" | "line";
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
      data-tone={tone}
      data-row={level === "line" ? "" : undefined}
    >
      <Lead fold={fold} title={title} />
      {inFold ? null : noteEl}
      <span className={s.rule} aria-hidden="true" />
      {summary ? <span className={s.summary}>{summary}</span> : null}
    </div>
  );
}

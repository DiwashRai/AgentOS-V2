// A plan's items: a green tick or an open ring, with an optional section head and "+N more".
import { Icon } from "./Icon";
import s from "./Checklist.module.css";
import { Tip } from "./tip";
import { cx } from "./vars";

export interface CheckItem {
  text: string;
  done: boolean;
  /** The section this item opens ("Server", "Client"). */
  section?: string;
}

export interface ChecklistProps {
  items: readonly CheckItem[];
  /** Items left out after these. */
  more?: number;
  /** bare: an expanded row's list; page: rows at body size (the ticket's plan); peek: the same, a
   *  little shorter. */
  look?: "bare" | "page" | "peek";
}

export function Checklist({ items, more = 0, look = "bare" }: ChecklistProps) {
  return (
    <ul className={cx(s.list, look !== "bare" && s.large, look === "peek" && s.peek)}>
      {items.map((it, i) => (
        <li key={i} className={s.item} data-done={it.done}>
          {it.section ? <span className={s.section}>{it.section}</span> : null}
          <span className={s.line}>
            {it.done ? (
              <Icon name="tick" label="Done" />
            ) : (
              <span className={s.todo} role="img" aria-label="Open" />
            )}
            <Tip text={it.text} cut>
              <span className={s.text}>{it.text}</span>
            </Tip>
          </span>
        </li>
      ))}
      {more > 0 ? <li className={s.more}>{`+${String(more)} more`}</li> : null}
    </ul>
  );
}

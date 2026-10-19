// A plan's items: a green tick or an open ring, with an optional section head and "+N more".
import { Icon } from "./Icon";
import s from "./Checklist.module.css";

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
}

export function Checklist({ items, more = 0 }: ChecklistProps) {
  return (
    <ul className={s.list}>
      {items.map((it, i) => (
        <li key={i} className={s.item} data-done={it.done}>
          {it.section ? <span className={s.section}>{it.section}</span> : null}
          <span className={s.line}>
            {it.done ? (
              <Icon name="tick" label="Done" />
            ) : (
              <span className={s.todo} role="img" aria-label="Open" />
            )}
            <span className={s.text} title={it.text}>
              {it.text}
            </span>
          </span>
        </li>
      ))}
      {more > 0 ? <li className={s.more}>{`+${String(more)} more`}</li> : null}
    </ul>
  );
}

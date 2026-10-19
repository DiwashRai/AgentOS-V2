// A dense list on one grid: an optional column head, the rows (groups of them), an optional foot.
// Every Row inside lays its cells out on the table's columns, so a column lines up across groups.
import { createContext, type ReactNode, useContext } from "react";

import s from "./Table.module.css";
import { cx, vars, type Width, width } from "./vars";

export interface Column {
  label: string;
  width: Width;
  /** Right-align the column (ages, actions). */
  end?: boolean;
  /** A vertical hairline between two halves of a row; it takes no cell. */
  rule?: boolean;
}

/** The columns rows lay their cells on; a Row resets it for what it holds. */
export const Columns = createContext<readonly Column[]>([]);

export function useColumns(): readonly Column[] {
  return useContext(Columns);
}

export interface TableProps {
  columns: readonly Column[];
  /** Draw the column head (default); off for lists whose cells say what they are. */
  head?: boolean;
  /** Fill the surface and scroll inside it (default); off for a list in a longer page. */
  scroll?: boolean;
  /** A bar under the list: key hints, a summary. */
  foot?: ReactNode;
  children: ReactNode;
}

export function Table({ columns, head = true, scroll = true, foot, children }: TableProps) {
  const cols = columns.map((c) => width(c.width)).join(" ");
  return (
    <Columns.Provider value={columns}>
      <div className={cx(s.table, scroll && s.scroll)} style={vars({ "--cols": cols })}>
        {head ? (
          <div className={s.head} aria-hidden="true">
            {columns.map((c, i) => (
              <span key={i} data-end={c.end}>
                {c.label}
              </span>
            ))}
          </div>
        ) : null}
        <div className={s.list}>{children}</div>
        {foot ? <footer className={s.foot}>{foot}</footer> : null}
      </div>
    </Columns.Provider>
  );
}

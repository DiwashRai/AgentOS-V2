// A dense list on one grid: an optional column head, the rows (groups of them), an optional foot.
// Every Row inside lays its cells out on the table's columns, so a column lines up across groups.
import { createContext, type ReactNode, useContext } from "react";

import s from "./Table.module.css";
import { cx, vars, type Length, type Width, width } from "./vars";

/** How a column takes its width: its width as set; or as wide as each row's own content, up to it
 *  (`hug`); or a fill column that keeps a floor (`min`). One of them, never two. */
type Track =
  | { width: Width; hug?: never; min?: never }
  | {
      width: Length;
      /** As wide as each row's own content, up to width: the free width goes to the fill columns.
       *  Each row sizes it alone, so it suits a headless list (Linear's right cluster). */
      hug: true;
      min?: never;
    }
  | {
      width: "fill";
      /** A fill column's floor: it keeps this width before a hugging column takes more (a title
       *  over its chips, when the list is narrow). */
      min: Length;
      hug?: never;
    };

export type Column = Track & {
  label: string;
  /** Right-align the column (ages, actions). */
  end?: boolean;
  /** Never narrower than its content (a row's buttons): when the list is narrow, the chips give
   *  way, not the buttons. */
  keep?: boolean;
};

function track(c: Column): string {
  if (c.hug) return `fit-content(${width(c.width)})`;
  return c.min ? `minmax(${width(c.min)}, 1fr)` : width(c.width);
}
/** The columns rows lay their cells on; a Row resets it for what it holds. */
export const Columns = createContext<readonly Column[]>([]);

/** Whether the list scrolls inside its surface, so a group head stays at its top (Head asks). */
export const Scrolling = createContext(false);

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
  /** Run through the padding of the surface it sits in, edge to edge (My queue's lists, whose
   *  surface pads only the agents' cards). */
  bleed?: boolean;
  /** Out to the main sheet's edges with no surface of its own, under a head on a grey band, its
   *  first cell under the bar's title (Linear's lists: the library's, Intake's, All teams'). */
  edge?: boolean;
  children: ReactNode;
}

export function Table(props: TableProps) {
  const { columns, head = true, scroll = true, foot, bleed, edge, children } = props;
  const cols = columns.map(track);
  return (
    <Columns.Provider value={columns}>
      <Scrolling.Provider value={scroll}>
        <div
          className={cx(s.table, scroll && s.scroll, bleed && s.bleed, edge && s.edge)}
          style={vars({ "--cols": cols.join(" ") })}
          data-edge={edge}
        >
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
      </Scrolling.Provider>
    </Columns.Provider>
  );
}

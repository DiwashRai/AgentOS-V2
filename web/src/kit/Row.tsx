// One item of a list: its cells on the Table's columns. A line and an item are flat,
// a rounded patch on the list's column edge (its words inset) washed on hover, focus and open; a
// list out at the sheet's edges rules them apart faintly. A rack is a bare entry. A card on its
// own surface is a Card. Nothing changes size.
import { Children, type ReactNode } from "react";

import { Opener, openOnClick } from "./opener";

import s from "./Row.module.css";
import { Columns, useColumns } from "./Table";
import { cx } from "./vars";

export interface Action {
  label: string;
  run: () => void;
}

export interface RowProps {
  /** The cells, one per column; with fewer, the last spans the rest, and one past the columns is
   *  not drawn. Outside a table they stack. */
  children: ReactNode;
  /** line: a list's one-line row (Compact, My queue, All teams, the library); item: a roomy
   *  two-line row (a ticket's context); rack: a bare entry (a run's stage). */
  kind?: "line" | "item" | "rack";
  /** It opens something (a peek, its expansion): a click, Enter or Space anywhere on it. `label`
   *  names what it opens, for assistive tech. */
  action?: Action;
  /** It is the open one: selected, with `more` under it. */
  open?: boolean;
  more?: ReactNode;
  /** One line under it, said at once (a failed action). */
  alert?: string;
}

function useCells(children: ReactNode, stack: boolean): ReactNode[] {
  const columns = useColumns();
  const cells = Children.toArray(children);
  if (stack) return cells;
  return cells.slice(0, columns.length).map((cell, i) => {
    const last = i === cells.length - 1 && i < columns.length - 1;
    const column = last ? columns[columns.length - 1] : columns[i];
    return (
      <span
        key={i}
        className={cx(s.cell, last && s.rest)}
        data-end={column?.end}
        data-keep={column?.keep}
      >
        {cell}
      </span>
    );
  });
}

interface InnerProps {
  action: Action | undefined;
  stack: boolean;
  open: boolean;
  more: ReactNode;
  children: ReactNode;
}

/** The cells, and for a row that opens something its button and click. The click is a pointer
 *  convenience over the button (jsx-a11y's presentation pattern), so the cells keep their own
 *  hover, tooltips and selection. */
function Inner({ action, stack, open, more, children }: InnerProps) {
  const cls = cx(s.inner, stack && s.stack);
  const cells = <Columns.Provider value={[]}>{children}</Columns.Provider>;
  if (!action) return <div className={cls}>{cells}</div>;
  return (
    <div role="presentation" className={cx(cls, s.opens)} onClick={openOnClick(action.run)}>
      <Opener
        className={s.hit}
        say={action.label}
        expanded={more === undefined ? undefined : open}
        onOpen={action.run}
      />
      {cells}
    </div>
  );
}

/** Under the row: its expansion while open, and an alert line. */
function Tail({
  open,
  more,
  alert,
}: {
  open: boolean;
  more: ReactNode;
  alert: string | undefined;
}) {
  return (
    <>
      {open && more ? <div className={s.more}>{more}</div> : null}
      {alert ? (
        <p className={s.alert} role="alert">
          {alert}
        </p>
      ) : null}
    </>
  );
}

export function Row(props: RowProps) {
  const { children, kind = "line", action, open = false, more, alert } = props;
  const columns = useColumns();
  const stack = columns.length === 0;
  const cells = useCells(children, stack);
  return (
    <div className={cx(s.row, s[kind], open && s.open)} data-row="">
      <Inner action={action} stack={stack} open={open} more={more}>
        {cells}
      </Inner>
      <Tail open={open} more={more} alert={alert} />
    </div>
  );
}

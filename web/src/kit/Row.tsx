// One item of a list: its cells on the Table's columns. Raised items are actionable, flat ones
// settled; a status edge says what the item waits on. Hover and focus light a line up and lift an
// item, a tile or a rack line; nothing ever changes size.
import { Children, type MouseEvent, type ReactNode } from "react";

import s from "./Row.module.css";
import { Columns, useColumns } from "./Table";
import { cx } from "./vars";

export interface Action {
  label: string;
  run: () => void;
}

export interface RowProps {
  /** The cells, one per column (a rule column takes none); with fewer, the last spans the rest.
   *  A tile stacks them. */
  children: ReactNode;
  /** raised: actionable (default); flat: settled; you: raised with the needs-you wash. */
  look?: "raised" | "flat" | "you";
  /** The 3px status edge at the left. */
  edge?: "you" | "live" | "blocked" | "done" | "quiet";
  /** line: a dense list's row (lights up); item: My queue's taller row (lifts); tile: a card
   *  (lifts); rack: a bare entry (lifts); band: a board's tall row, its cells ruled apart. */
  kind?: "line" | "item" | "tile" | "rack" | "band";
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
  const out: ReactNode[] = [];
  let next = 0;
  columns.forEach((col, i) => {
    if (col.rule) {
      out.push(<span key={`rule${String(i)}`} className={s.rule} aria-hidden="true" />);
      return;
    }
    if (next >= cells.length) return;
    const last = next === cells.length - 1 && columns.slice(i + 1).some((c) => !c.rule);
    out.push(
      <span
        key={i}
        className={cx(s.cell, last && s.rest)}
        data-end={(last ? columns[columns.length - 1] : col)?.end}
      >
        {cells[next]}
      </span>,
    );
    next += 1;
  });
  return out;
}

/** What the row does, for the keyboard and assistive tech: a real button, visually hidden (the
 *  focus ring goes round the row), saying whether the row is expanded when it has an expansion. */
function Hit({ action, open, more }: { action: Action; open: boolean; more: ReactNode }) {
  return (
    <button
      type="button"
      className={s.hit}
      aria-label={action.label}
      aria-expanded={more === undefined ? undefined : open}
      onClick={action.run}
    />
  );
}

/** For a pointer, a click anywhere on the row opens it too: not one on a control inside it (its
 *  own meaning, and the row's button handles its own), nor the end of a text selection. */
function openOnClick(action: Action) {
  return (e: MouseEvent) => {
    const control = e.target instanceof Element && e.target.closest("a, button, [role=combobox]");
    if (!control && document.getSelection()?.isCollapsed !== false) action.run();
  };
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
    <div role="presentation" className={cx(cls, s.opens)} onClick={openOnClick(action)}>
      <Hit action={action} open={open} more={more} />
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
  const {
    children,
    look = "raised",
    edge,
    kind = "line",
    action,
    open = false,
    more,
    alert,
  } = props;
  const columns = useColumns();
  const stack = kind === "tile" || columns.length === 0;
  const cells = useCells(children, stack);
  // A rack line is bare: it has no surface to raise or settle.
  const surface = kind === "rack" ? undefined : s[look];
  return (
    <div className={cx(s.row, s[kind], surface, open && s.open)} data-row="" data-edge={edge}>
      <Inner action={action} stack={stack} open={open} more={more}>
        {cells}
      </Inner>
      <Tail open={open} more={more} alert={alert} />
    </div>
  );
}

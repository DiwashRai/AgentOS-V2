// A view: the top bar (title, context, counters, the view's own middle, search, one button) and the
// body under it, which fills the rest of the window.
import { type ReactNode, useEffect } from "react";
import { Link } from "react-router";

import { Field } from "./Field";
import { Mark, type MarkKind } from "./Mark";
import s from "./Page.module.css";
import { cx } from "./vars";

export interface Counter {
  n: number;
  label: string;
  mark?: MarkKind;
}

export interface Search {
  value: string;
  onChange: (q: string) => void;
  placeholder: string;
}

export interface PageProps {
  /** The view's name; a pair is Linear's breadcrumb (the ticket: the view it came from, a link
   *  back,
   *  then its key), the last step the name, drawn at crumb size rather than as a view's heading. */
  title: string | readonly [{ label: string; href: string }, string];
  /** After the title, quiet: the Space, a scope. */
  context?: string | undefined;
  /** The number carries the weight, a zero recedes; "|" draws a separator. */
  counters?: readonly (Counter | "|")[];
  /** The view's own controls after the counters (filter pills, a crumb). */
  middle?: ReactNode | undefined;
  search?: Search;
  /** The bar's buttons at its right end (New ticket; a ticket's actions). */
  action?: ReactNode;
  /** A full-height column beside the body, ruled off by one hairline. column: a reading column (the
   *  ticket's Talk, the workflow editor's library); rail: a narrow rail of settings (an item
   *  editor's properties), the body beside it an editor out to the rail's gutter. */
  side?: { look?: "column" | "rail"; content: ReactNode };
  children: ReactNode;
}

function Counters({ items }: { items: readonly (Counter | "|")[] }) {
  return (
    <span className={s.counters} aria-live="polite">
      {items.map((c, i) =>
        c === "|" ? (
          <span key={`sep${String(i)}`} className={s.sep} />
        ) : (
          <span
            key={c.label}
            className={cx(s.counter, c.n === 0 && s.zero, c.n > 0 && c.mark === "you" && s.you)}
          >
            {c.mark ? <Mark kind={c.mark} glyph small name={false} /> : null}
            <b>{c.n}</b> {c.label}
          </span>
        ),
      )}
    </span>
  );
}

export function Page({
  title,
  context,
  counters,
  middle,
  search,
  action,
  side,
  children,
}: PageProps) {
  const [crumb, name] = typeof title === "string" ? [null, title] : title;
  // A view over another (a full-window editor over the ticket) gives the tab back when it closes.
  useEffect(() => {
    const before = document.title;
    document.title = `${name} · AgentOS`;
    return () => {
      document.title = before;
    };
  }, [name]);
  return (
    <div className={s.page}>
      <header className={s.top}>
        {crumb !== null ? (
          <span className={s.crumb}>
            <Link to={crumb.href}>{crumb.label}</Link>
            <span aria-hidden="true">›</span>
          </span>
        ) : null}
        <h1 className={cx(s.title, crumb !== null && s.step)}>{name}</h1>
        {context ? <span className={s.context}>{context}</span> : null}
        {counters ? <Counters items={counters} /> : null}
        {middle}
        <span className={s.grow} />
        {search ? (
          <span className={s.search}>
            <Field
              search
              label={search.placeholder}
              placeholder={search.placeholder}
              value={search.value}
              onChange={search.onChange}
            />
          </span>
        ) : null}
        {action ? <span className={s.actions}>{action}</span> : null}
      </header>
      {side ? (
        <div className={s.split} data-side={side.look ?? "column"}>
          <div className={s.body}>
            <div className={s.measure}>{children}</div>
          </div>
          <aside className={s.side}>{side.content}</aside>
        </div>
      ) : (
        <div className={s.body}>{children}</div>
      )}
    </div>
  );
}

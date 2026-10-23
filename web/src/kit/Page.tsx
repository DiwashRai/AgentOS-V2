// A view: the top bar (title, context, the view's own middle, search, one button) and the
// body under it, which fills the rest of the window.
import { type ReactNode, useEffect } from "react";
import { Link } from "react-router";

import { Field } from "./Field";
import s from "./Page.module.css";
import { cx } from "./vars";

export interface Search {
  value: string;
  onChange: (q: string) => void;
  placeholder: string;
}

export interface PageProps {
  /** The view's name; a pair is Linear's breadcrumb (the ticket: the view it came from, a link
   *  back, then its key), the last step the name, drawn at crumb size rather than as a view's
   *  heading. */
  title: string | readonly [{ label: string; href: string }, string];
  /** After the title, quiet: the Space, a scope. */
  context?: string | undefined;
  /** The view's own controls after the title (a list's filter chips, a crumb). */
  middle?: ReactNode | undefined;
  search?: Search;
  /** The bar's buttons at its right end (New ticket; a ticket's actions). */
  action?: ReactNode;
  /** column: a full-height reading column beside the body, the sheet itself past one hairline
   *  (the ticket's Talk, the workflow editor's library); doc: none, what would sit there (an item
   *  editor's properties) is in the body, one centred document, as Linear's project page. */
  side?: { look?: "column"; content: ReactNode } | { look: "doc"; content?: never };
  children: ReactNode;
}

export function Page({ title, context, middle, search, action, side, children }: PageProps) {
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
      <Body side={side}>{children}</Body>
    </div>
  );
}

/** Under the bar: the body alone, one centred document, or the body beside its column. */
function Body({ side, children }: Pick<PageProps, "side" | "children">) {
  if (!side) return <div className={s.body}>{children}</div>;
  if (side.look === "doc")
    return (
      <div className={cx(s.body, s.doc)}>
        <div className={s.measure}>{children}</div>
      </div>
    );
  return (
    <div className={s.split}>
      <div className={s.body}>
        <div className={s.measure}>{children}</div>
      </div>
      <aside className={s.side}>{side.content}</aside>
    </div>
  );
}

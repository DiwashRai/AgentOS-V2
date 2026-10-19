// A view: the top bar (title, context, counters, the view's own middle, search, one button) and the
// body under it, which fills the rest of the window.
import { type ReactNode, useEffect, useRef } from "react";

import { Badge } from "./Badge";
import { Icon } from "./Icon";
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
  title: string;
  /** After the title, quiet: the Space, a scope. */
  context?: string;
  /** The number carries the weight, a zero recedes; "|" draws a separator. */
  counters?: readonly (Counter | "|")[];
  /** The view's own controls after the counters (filter pills, a crumb). */
  middle?: ReactNode;
  search?: Search;
  /** The bar's one button (New ticket, a close). */
  action?: ReactNode;
  /** A full-height column beside the body (the ticket's Talk). */
  side?: ReactNode;
  children: ReactNode;
}

/** Single-key shortcuts never fire while typing or with a modifier held. */
function isShortcut(e: KeyboardEvent): boolean {
  const t = e.target;
  const typing =
    t instanceof HTMLElement &&
    (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  return !e.metaKey && !e.ctrlKey && !e.altKey && !typing;
}

function SearchField({ value, onChange, placeholder }: Search) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || !isShortcut(e)) return;
      e.preventDefault();
      ref.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <label className={s.search}>
      <Icon name="search" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          if (value === "") e.currentTarget.blur();
          else onChange("");
        }}
      />
      <Badge kind="kbd">/</Badge>
    </label>
  );
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
            {c.mark ? <Mark kind={c.mark} glyph small /> : null}
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
  useEffect(() => {
    document.title = `${title} · AgentOS`;
  }, [title]);
  return (
    <div className={s.page}>
      <header className={s.top}>
        <h1 className={s.title}>{title}</h1>
        {context ? <span className={s.context}>{context}</span> : null}
        {counters ? <Counters items={counters} /> : null}
        {middle}
        <span className={s.grow} />
        {search ? <SearchField {...search} /> : null}
        {action}
      </header>
      {side ? (
        <div className={s.split}>
          <div className={s.body}>{children}</div>
          <aside className={s.side}>{side}</aside>
        </div>
      ) : (
        <div className={s.body}>{children}</div>
      )}
    </div>
  );
}

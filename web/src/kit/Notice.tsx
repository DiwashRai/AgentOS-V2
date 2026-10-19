import type { ReactNode } from "react";

import s from "./Notice.module.css";

export interface NoticeProps {
  /** status: a quiet loading or error line; empty: the dashed row of an empty zone; problem: what
   *  went wrong, its lead in the blocked colour; more: the strip under a capped list ("+3 more"). */
  kind: "status" | "empty" | "problem" | "more";
  /** The lead word, in 600 ("All quiet", "Jira didn't answer"). */
  lead?: string;
  children?: ReactNode;
  /** A status line that reports a failure (said at once, in the blocked colour). */
  error?: boolean;
}

/** Loading, empty and failure states, in the quiet language: no spinners, no toasts. */
export function Notice({ kind, lead, children, error }: NoticeProps) {
  if (kind === "status") {
    return (
      <p className={s.status} role={error ? "alert" : "status"} data-error={error}>
        {lead ? <b>{lead}</b> : null}
        {children}
      </p>
    );
  }
  return (
    <div className={s[kind]} role={kind === "problem" ? "status" : undefined}>
      {kind === "empty" ? <i aria-hidden="true" /> : null}
      {lead ? <b>{lead}</b> : null}
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

import s from "./Notice.module.css";

export interface NoticeProps {
  /** status: a quiet loading or error line; empty: the quiet row of an empty zone; problem: what
   *  went wrong, a line of the list on a blocked edge, at a reading measure; more: the strip
   *  under a capped list ("Show 3 more"). */
  kind: "status" | "empty" | "problem" | "more";
  /** The lead words, a step firmer than the rest ("All quiet"); a dash sets them off from it. */
  lead?: string;
  children?: ReactNode;
  /** A status line that reports a failure (said at once, in the blocked colour). */
  error?: boolean;
  /** item: a line of a two-line item list (Intake), in the items' size; an empty ring or a
   *  problem's blocked dot sits where the group labels' chevrons do, the words just after it.
   *  end: a status that closes a list, its words at the rows' far end ("checked 2m ago").
   *  Otherwise its words line up with a group head's name. */
  align?: "item" | "end";
  /** A problem's second line, muted: what can be done about it, apart from what went wrong. */
  fix?: ReactNode;
}

/** The lead, set off from what follows by a dash, so the two never run on. */
function Said({ lead, children }: { lead: string | undefined; children: ReactNode }) {
  return (
    <>
      {lead ? <b>{lead}</b> : null}
      {lead && children ? <span className={s.dash}>—</span> : null}
      {children}
    </>
  );
}

/** Loading, empty and failure states, in the quiet language: no spinners, no toasts. */
export function Notice({ kind, lead, children, error, align, fix }: NoticeProps) {
  if (kind === "status") {
    return (
      <p
        className={s.status}
        role={error ? "alert" : "status"}
        data-error={error}
        data-align={align}
      >
        {lead ? <b>{lead}</b> : null}
        {children}
      </p>
    );
  }
  if (kind === "problem") {
    return (
      <div className={s.problem} role="status" data-align={align}>
        {lead ? <b>{lead}</b> : null}
        <p>{children}</p>
        {fix ? <p className={s.fix}>{fix}</p> : null}
      </div>
    );
  }
  return (
    <div className={s[kind]} data-align={align}>
      {kind === "empty" ? <i aria-hidden="true" /> : null}
      <Said lead={lead}>{children}</Said>
    </div>
  );
}

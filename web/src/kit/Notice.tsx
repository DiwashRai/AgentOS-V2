import type { ReactNode } from "react";

import { Button } from "./Button";
import s from "./Notice.module.css";

/** A problem's second line, muted: what can be done about it, words with a link inside them
 *  ("An admin can fix the query in" Settings › Intake "."). */
export type NoticeFix =
  string | { before: string; link: { label: string; href: string }; after?: string };

interface Said {
  /** The lead words, a step firmer than the rest: set off by a dash on an empty line or a +N strip
   *  ("All quiet — …"), a problem's first line. */
  lead?: string;
  children?: ReactNode;
}

/** One of four quiet lines, each with only what it draws. status: a quiet loading or error line;
 *  empty: the quiet row of an empty zone; problem: what went wrong, a line of the list on a blocked
 *  edge, at a reading measure; more: the strip under a capped list ("Show 3 more"). */
export type NoticeProps = Said &
  (
    | {
        kind: "status";
        /** A status is its words alone. */
        lead?: never;
        /** A status line that reports a failure (said at once, in the blocked colour). */
        error?: boolean;
        /** end: a status that closes a list, its words at the rows' far end ("checked 2m ago").
         *  Otherwise its words line up with a group head's name. */
        align?: "end";
        fix?: never;
        more?: never;
      }
    | {
        kind: "problem";
        /** item: a line of a two-line item list (Intake), in the items' size; the blocked dot sits
         *  where the group labels' chevrons do, the words just after it. */
        align?: "item";
        /** The problem's second line: what can be done about it. */
        fix?: NoticeFix;
        error?: never;
        more?: never;
      }
    | {
        kind: "empty";
        /** item: as a problem's, the empty ring in the chevrons' slot. */
        align?: "item";
        error?: never;
        fix?: never;
        more?: never;
      }
    | {
        kind: "more";
        /** The button that shows the rest ("Show 3 more"), its title saying how many in all. */
        more?: { label: string; title: string; run: () => void };
        error?: never;
        align?: never;
        fix?: never;
      }
  );
/** The lead, set off from what follows by a dash, so the two never run on. */
function Said({ lead, children }: Said) {
  return (
    <>
      {lead ? <b>{lead}</b> : null}
      {lead && children ? <span className={s.dash}>—</span> : null}
      {children}
    </>
  );
}

/** A problem's fix: its words, a link inside them drawn as a word of the sentence. */
function Fix({ fix }: { fix: NoticeFix }) {
  if (typeof fix === "string") return <p className={s.fix}>{fix}</p>;
  return (
    <p className={s.fix}>
      {`${fix.before} `}
      <Button variant="link" href={fix.link.href}>
        {fix.link.label}
      </Button>
      {fix.after ?? ""}
    </p>
  );
}

/** Loading, empty and failure states, in the quiet language: no spinners, no toasts. */
export function Notice(props: NoticeProps) {
  const { kind, lead, children } = props;
  if (kind === "status") {
    return (
      <p
        className={s.status}
        role={props.error ? "alert" : "status"}
        data-error={props.error}
        data-align={props.align}
      >
        {children}
      </p>
    );
  }
  if (kind === "problem") {
    return (
      <div className={s.problem} role="status" data-align={props.align}>
        {lead ? <b>{lead}</b> : null}
        <p>{children}</p>
        {props.fix !== undefined ? <Fix fix={props.fix} /> : null}
      </div>
    );
  }
  if (kind === "more") {
    return (
      <div className={s.more}>
        {props.more ? (
          <Button variant="quiet" size="xs" title={props.more.title} onClick={props.more.run}>
            {props.more.label}
          </Button>
        ) : null}
        <Said lead={lead}>{children}</Said>
      </div>
    );
  }
  return (
    <div className={s.empty} data-align={props.align}>
      <i aria-hidden="true" />
      <Said lead={lead}>{children}</Said>
    </div>
  );
}

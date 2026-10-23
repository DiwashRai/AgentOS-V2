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
 *  empty: the quiet row of an empty zone; problem: what went wrong, on a blocked edge (under a
 *  query's head, a panel of the blocked wash), at a reading measure; more: the strip under a
 *  capped list ("Show 3 more"). */
export type NoticeProps = Said &
  (
    | {
        kind: "status";
        /** A status is its words alone. */
        lead?: never;
        /** A status line that reports a failure (said at once, in the blocked colour). */
        error?: boolean;
        align?: never;
        fix?: never;
        more?: never;
      }
    | {
        kind: "problem";
        /** item: a query's whole answer (Intake's): a panel of the blocked hue's wash on the
         *  column edge, the blocked dot on a halo before its words. */
        align?: "item";
        /** The problem's second line: what can be done about it. */
        fix?: NoticeFix;
        error?: never;
        more?: never;
      }
    | {
        kind: "empty";
        /** item: a line under a head, the empty ring where the rows' words start (by default it
         *  stands for a group, its ring on the column edge as a head's glyph). */
        align?: "item";
        error?: never;
        fix?: never;
        more?: never;
      }
    | {
        kind: "more";
        /** The button that shows the rest ("Show all 11"), its title saying how many in all. */
        more?: { label: string; title: string; run: () => void };
        /** item: the +N on a disc where the rows' words start, the button after it. */
        align?: "item";
        error?: never;
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
      <p className={s.status} role={props.error ? "alert" : "status"} data-error={props.error}>
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
      <div className={s.more} data-align={props.align}>
        <Said lead={lead}>{children}</Said>
        {props.more ? (
          <Button variant="quiet" size="xs" title={props.more.title} onClick={props.more.run}>
            {props.more.label}
          </Button>
        ) : null}
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

import type { ReactNode } from "react";

import s from "./Badge.module.css";
import { Icon } from "./Icon";
import { keyHue } from "./identity";
import { cx } from "./vars";

export type BadgeProps =
  /** A ticket or project key, tinted by its project's identity hue. */
  | { kind: "key"; children: string; size?: "sm" | "md" | "lg"; title?: string; href?: string }
  /** The count pill of heads and pills. */
  | { kind: "count"; children: number; tone?: "neutral" | "you" | "done" }
  /** A keycap ("/", "Esc", "J"). */
  | { kind: "kbd"; children: string }
  /** A kicker tag; `tone` blocked for a high priority, quiet for the repo. */
  | { kind: "tag"; children: ReactNode; tone?: "neutral" | "blocked" | "quiet"; title?: string }
  /** A status as another system names it (a Jira status): one neutral ring. */
  | { kind: "status"; children: string; title?: string }
  /** The YOU pill: the only YOU form, and the only mono caps in the product. */
  | { kind: "you" };

type KeyProps = Extract<BadgeProps, { kind: "key" }>;

function Key({ children, size = "md", title, href }: KeyProps) {
  const chip = (
    <span className={cx(s.key, s[keyHue(children)], s[size])} title={title}>
      {children}
    </span>
  );
  if (href === undefined) return chip;
  return (
    <a className={s.out} href={href} target="_blank" rel="noopener noreferrer" title={title}>
      {chip}
      <Icon name="out" />
    </a>
  );
}

export function Badge(props: BadgeProps) {
  switch (props.kind) {
    case "key":
      return <Key {...props} />;
    case "count":
      return (
        <span className={s.count} data-tone={props.tone ?? "neutral"}>
          {props.children}
        </span>
      );
    case "kbd":
      return <kbd className={s.kbd}>{props.children}</kbd>;
    case "tag":
      return (
        <span className={s.tag} data-tone={props.tone ?? "neutral"} title={props.title}>
          {props.children}
        </span>
      );
    case "status":
      return (
        <span className={s.status} title={props.title}>
          <i aria-hidden="true" />
          <span>{props.children}</span>
        </span>
      );
    case "you":
      return <b className={s.you}>YOU</b>;
  }
}

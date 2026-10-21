import type { ReactNode } from "react";

import s from "./Badge.module.css";
import { Icon, type IconName } from "./Icon";
import { cx } from "./vars";

export type BadgeProps =
  /** A ticket or project key: quiet tabular text. */
  | { kind: "key"; children: string; size?: "sm" | "md"; title?: string }
  /** The bare count of heads and pills. */
  | { kind: "count"; children: number; tone?: "neutral" | "you" | "done" }
  /** A keycap ("/", "Esc", "J"). */
  | { kind: "kbd"; children: string }
  /** A label chip; `tone` blocked for a high priority, quiet for a stage or repo, fill for a chip
   *  with no edge. */
  | {
      kind: "tag";
      children: ReactNode;
      tone?: "neutral" | "blocked" | "quiet" | "fill";
      title?: string;
    }
  /** A row's property chip (its stage, its repo), Linear's label: a pill on a hairline, a dot in
   *  the state's hue (`dot`) or a small glyph, then muted words. */
  | {
      kind: "prop";
      children: string;
      icon?: IconName;
      dot?: "neutral" | "live" | "you" | "blocked" | "done";
      title?: string;
    }
  /** The YOU pill: the only YOU form, and the only mono caps in the product. */
  | { kind: "you" };

type KeyProps = Extract<BadgeProps, { kind: "key" }>;

function Key({ children, size = "md", title }: KeyProps) {
  return (
    <span className={cx(s.key, s[size])} title={title}>
      {children}
    </span>
  );
}

type PropProps = Extract<BadgeProps, { kind: "prop" }>;

function Prop({ children, icon, dot = "neutral", title }: PropProps) {
  return (
    <span className={s.prop} title={title ?? children}>
      {icon ? <Icon name={icon} /> : <i aria-hidden="true" data-dot={dot} />}
      <span>{children}</span>
    </span>
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

    case "prop":
      return <Prop {...props} />;
    case "you":
      return <b className={s.you}>YOU</b>;
  }
}

// The small text forms: a key, a count, a keycap, YOU. A labelled pill is a Chip.
import s from "./Badge.module.css";
import { cx } from "./vars";

export type BadgeProps =
  /** A ticket or project key: quiet tabular text. */
  | { kind: "key"; children: string; size?: "sm" | "md"; title?: string }
  /** The bare count of heads and pills. */
  | { kind: "count"; children: number; tone?: "neutral" | "you" | "done" }
  /** A keycap ("/", "Esc", "J"). */
  | { kind: "kbd"; children: string }
  /** The YOU pill: the only YOU form, and the only mono caps in the product. */
  | { kind: "you" };

export function Badge(props: BadgeProps) {
  switch (props.kind) {
    case "key":
      return (
        <span className={cx(s.key, s[props.size ?? "md"])} title={props.title}>
          {props.children}
        </span>
      );
    case "count":
      return (
        <span className={s.count} data-tone={props.tone ?? "neutral"}>
          {props.children}
        </span>
      );
    case "kbd":
      return <kbd className={s.kbd}>{props.children}</kbd>;
    case "you":
      return <b className={s.you}>YOU</b>;
  }
}

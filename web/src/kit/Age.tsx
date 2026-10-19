import s from "./Age.module.css";
import { cx } from "./vars";

export interface AgeProps {
  /** An age as the screens write it: `38m`, `3h 05m`, `2d`, `now`. */
  text: string;
  /** The Needs-you age: larger and in ink. */
  strong?: boolean;
  title?: string;
}

/** An age: tabular figures, each unit a size smaller. */
export function Age({ text, strong, title }: AgeProps) {
  const parts = text.split(" ").map((p) => /^(\d+)([a-z]+)$/.exec(p));
  return (
    <span className={cx(s.age, strong && s.strong)} title={title}>
      {parts.every((m): m is RegExpExecArray => m !== null)
        ? parts.map((m, i) => (
            <span key={i}>
              {i > 0 ? " " : null}
              {m[1]}
              <span className={s.unit}>{m[2]}</span>
            </span>
          ))
        : text}
    </span>
  );
}

// A value set over another it replaces (a stage's effort over its agent's): a small neutral dot,
// the value set, then the one it replaces struck through after it, so an override reads without
// hovering and without borrowing a state's hue. Whose values they are is the screen's to say.
import s from "./Override.module.css";

export interface OverrideProps {
  /** The value set (xhigh). */
  value: string;
  /** The value it replaces (high). */
  own: string;
}

export function Override({ value, own }: OverrideProps) {
  const say = `${value}, replacing ${own}`;
  return (
    <span className={s.over} title={say} aria-label={say}>
      <i aria-hidden="true" />
      <b>{value}</b>
      <s aria-hidden="true">{own}</s>
    </span>
  );
}

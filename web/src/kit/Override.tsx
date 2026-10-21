// A setting a stage sets over its agent's own (a model, an effort): a small neutral dot, the value
// set here, then the agent's own struck through after it, so an override reads without hovering
// and without borrowing a state's hue.
import s from "./Override.module.css";

export interface OverrideProps {
  /** The value set on the stage (xhigh). */
  value: string;
  /** The agent's own, which it replaces (high). */
  own: string;
}

export function Override({ value, own }: OverrideProps) {
  const say = `${value}, set on this stage over the agent's ${own}`;
  return (
    <span className={s.over} title={say} aria-label={say}>
      <i aria-hidden="true" />
      <b>{value}</b>
      <s aria-hidden="true">{own}</s>
    </span>
  );
}

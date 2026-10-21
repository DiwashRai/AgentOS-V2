// A value set over another it replaces (a stage's effort over its agent's): a small neutral dot,
// the value set, then the one it replaces struck through after it, so an override reads without
// hovering and without borrowing a state's hue. Whose values they are is the screen's to say.
import s from "./Override.module.css";
import { Tip } from "./tip";
import u from "./unseen.module.css";

export interface OverrideProps {
  /** The value set (xhigh). */
  value: string;
  /** The value it replaces (high). */
  own: string;
}

export function Override({ value, own }: OverrideProps) {
  return (
    <Tip text={`${value}, replacing ${own}`} said>
      <span className={s.over}>
        <i aria-hidden="true" />
        <b>{value}</b>
        <s aria-hidden="true">{own}</s>
        {/* what the struck value says, in words for assistive tech */}
        <span className={u.unseen}>{`, replacing ${own}`}</span>
      </span>
    </Tip>
  );
}

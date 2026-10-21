// A run's progress: one segment per step; the step in progress sweeps. One form, two sizes: inline
// in a row (the default), and a hairline track along the bottom edge of the agent Card it is in.
import s from "./Meter.module.css";
import { cx } from "./vars";

export interface MeterProps {
  /** Steps finished. */
  done: number;
  total: number;
  size?: "row" | "edge";
}

type Seg = "done" | "now" | "next";

function segments(done: number, total: number): Seg[] {
  return Array.from({ length: total }, (_, i): Seg =>
    i < done ? "done" : i === done ? "now" : "next",
  );
}

export function Meter({ done, total, size = "row" }: MeterProps) {
  return (
    <span
      className={cx(s.meter, s[size])}
      role="img"
      aria-label={`${String(done)}/${String(total)} steps`}
    >
      {segments(done, total).map((seg, i) => (
        <i key={i} className={s.seg} data-seg={seg} />
      ))}
    </span>
  );
}

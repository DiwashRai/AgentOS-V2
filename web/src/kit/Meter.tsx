// A run's progress: one segment per step; the step in progress sweeps. One form, three sizes:
// a hairline track along an agent card's bottom edge; inline in a row; and the strip with each
// step's name under it.
import s from "./Meter.module.css";
import { cx } from "./vars";

export interface MeterProps {
  /** Steps finished. */
  done: number;
  total: number;
  size?: "tile" | "row" | "strip";
  /** strip only: each step's name, under its segment. */
  names?: readonly string[];
}

type Seg = "done" | "now" | "next";

function segments(done: number, total: number): Seg[] {
  return Array.from({ length: total }, (_, i): Seg =>
    i < done ? "done" : i === done ? "now" : "next",
  );
}

export function Meter({ done, total, size = "tile", names }: MeterProps) {
  const segs = segments(done, total);
  const label = `${String(done)}/${String(total)} steps`;
  const cls = cx(s.meter, s[size]);
  if (size === "strip") {
    return (
      <ol className={cls} aria-label={label}>
        {segs.map((seg, i) => (
          <li key={i} data-seg={seg}>
            <i className={s.seg} data-seg={seg} />
            <span className={s.k}>
              {seg === "now" ? "Now" : segs[i - 1] === "now" ? "Next" : `Step ${String(i + 1)}`}
            </span>
            <span className={s.step}>{names?.[i] ?? ""}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <span className={cls} role="img" aria-label={label}>
      {segs.map((seg, i) => (
        <i key={i} className={s.seg} data-seg={seg} />
      ))}
    </span>
  );
}

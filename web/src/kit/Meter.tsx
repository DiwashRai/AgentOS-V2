// A run's progress: one segment per step. Two looks: in a row beside its step (the default), the
// step in progress sweeping; and still in a list of runs (a column of meters would sweep all at
// once), each finished step solid and the one under way a soft step of it. A queued run has no
// steps yet: its track is dashed, so a list of runs keeps its column.
import s from "./Meter.module.css";
import { cx } from "./vars";

export type MeterProps = { size?: "row" | "list" } & (
  | {
      /** Steps finished. */
      done: number;
      total: number;
      queued?: never;
    }
  | {
      /** Waiting for a runner: no steps yet, the track dashed; the words beside it say so. */
      queued: true;
      done?: never;
      total?: never;
    }
);

type Seg = "done" | "now" | "next";

function segments(done: number, total: number): Seg[] {
  return Array.from({ length: total }, (_, i): Seg =>
    i < done ? "done" : i === done ? "now" : "next",
  );
}

export function Meter(props: MeterProps) {
  const size = props.size ?? "row";
  if (props.queued) return <span className={cx(s.meter, s[size], s.queued)} aria-hidden="true" />;
  const { done, total } = props;
  return (
    <span
      className={cx(s.meter, s[size])}
      role="img"
      aria-label={`${String(done)} of ${String(total)} steps done`}
    >
      {segments(done, total).map((seg, i) => (
        <i key={i} className={s.seg} data-seg={seg} />
      ))}
    </span>
  );
}

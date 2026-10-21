// A workflow at a glance, in a list row (the library's Workflows): a segment per stage in its
// phase's hue (a turned-off stage dashed), a gate's diamond where its stage ends, a bracket under
// the stages a loop repeats, then the words. It draws a workflow as written, not a ticket's way
// through it (that is the Stepper's).
import s from "./Strip.module.css";
import { vars } from "./vars";

export interface StripStage {
  name: string;
  phase: "plan" | "build" | "verify" | "review";
  /** Turned off: still in its place, dashed. */
  off: boolean;
  /** The gate after it, by name. */
  gate: string | null;
}

export interface StripProps {
  /** The words after it (5 stages · loops up to 3 rounds). */
  label: string;
  stages: readonly StripStage[];
  /** By the index of their first and last stage. */
  loops: readonly { first: number; last: number; rounds: number }[];
}

/** Each stage's grid column (from 1): a gate takes a column of its own after its stage. */
function columns(stages: readonly StripStage[]): number[] {
  let c = 1;
  return stages.map((st) => {
    const at = c;
    c += st.gate ? 2 : 1;
    return at;
  });
}

function pathOf({ stages, loops }: StripProps): string {
  const steps = stages.flatMap((st) => [
    `${st.name} (${st.phase}${st.off ? ", off" : ""})`,
    ...(st.gate ? [`gate: ${st.gate}`] : []),
  ]);
  const rounds = loops.map(
    (l) =>
      `${stages[l.first]?.name ?? ""} to ${stages[l.last]?.name ?? ""} loops up to ${String(l.rounds)} rounds`,
  );
  // in words, as a reader says them (no arrows or diamonds)
  return [steps.join(", then "), ...rounds].join(". ");
}

export function Strip(props: StripProps) {
  const { label, stages, loops } = props;
  const col = columns(stages);
  const path = pathOf(props);
  const cols = stages.flatMap((st) => (st.gate ? ["minmax(0, 1fr)", "auto"] : ["minmax(0, 1fr)"]));
  return (
    <span className={s.strip} role="img" aria-label={`${label}: ${path}`} title={path}>
      <span className={s.track} style={vars({ "--cols": cols.join(" ") })}>
        {stages.flatMap((st, i) => [
          <i key={`s${String(i)}`} data-phase={st.phase} data-off={st.off || undefined} />,
          ...(st.gate ? [<u key={`g${String(i)}`} />] : []),
        ])}
        {loops.map((l) => (
          <span
            key={`l${String(l.first)}`}
            className={s.loop}
            style={vars({
              "--from": String(col[l.first] ?? 1),
              "--to": String((col[l.last] ?? 1) + 1),
            })}
          />
        ))}
      </span>
      <b>{label}</b>
    </span>
  );
}

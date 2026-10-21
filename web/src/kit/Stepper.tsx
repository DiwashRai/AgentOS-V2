// A ticket's way through its workflow, as the labelled stepper of the ticket page, the peek and an
// expanded row: one equal column per stage, its name under its own segment, a gate's diamond where
// its stage ends; with what happens now, the stages and that line share one run card. It lays out
// the model the screen built; it never decides a stage's state.
import type { ReactNode } from "react";

import { Icon } from "./Icon";
import s from "./Stepper.module.css";
import { cx, vars } from "./vars";

export interface StepGate {
  label: string;
  short: string;
  state: "pending" | "passed" | "waiting" | "you";
  person?: string;
}

export interface Step {
  name: string;
  state: "done" | "current" | "upcoming" | "skipped" | "failed";
  gate?: StepGate;
  round?: { n: number; of: number };
}

export interface StepperModel {
  stages: readonly Step[];
  /** A run is on a runner: the current segment draws live. */
  live: boolean;
  /** Abandoned: its stopped stage is where it was closed. */
  closed: boolean;
}

export interface StepperProps {
  model: StepperModel;
  /** Smaller names, every inactive gate a bare diamond (an expanded row). */
  compact?: boolean;
  /** What happens now (the live run, a gate's ask, a blocked reason): a full-width line under the
   *  stages, joined to them so the two read as one object. */
  now?: ReactNode;
}

const parked = (g: StepGate) => g.state === "you" || g.state === "waiting";

/** Reached Done with nothing failed: the whole path draws green. */
function finished(m: StepperModel): boolean {
  const last = m.stages[m.stages.length - 1];
  return (
    (last?.state === "current" || last?.state === "done") &&
    !m.stages.some((st) => st.state === "failed")
  );
}

const roundText = (r: { n: number; of: number }) => `Round ${String(r.n)} of ${String(r.of)}`;

function caption(step: Step, last: boolean, model: StepperModel, done: boolean): string {
  if (last && done) return "Complete";
  if (step.state === "skipped") return "Skipped";
  if (step.state === "failed") return model.closed ? "Closed" : "Blocked";
  if (step.state === "current") return model.live ? "Live" : last ? "" : "Now";
  return "";
}

const GATE_SUB: Record<StepGate["state"], (g: StepGate) => string> = {
  you: () => "Your move",
  waiting: (g) => g.person ?? "",
  pending: () => "",
  passed: () => "",
};

/** A gate: its diamond on the track where its stage ends, its name a caption under the stage's;
 *  bare (the diamond alone, named by its knot) when compact and the ticket isn't parked. */
function GateCaption({ g, bare }: { g: StepGate; bare: boolean }) {
  if (bare && !parked(g)) return null;
  const sub = GATE_SUB[g.state](g);
  return (
    <span className={s.gatecap} data-state={g.state} title={g.label}>
      <span>{g.short}</span>
      {sub ? <b>{sub}</b> : null}
    </span>
  );
}

/** The gate's diamond on the track: drawing alone where its caption names it; bare, it is the
 *  gate's only sign, named for assistive tech too. */
function Knot({ g, bare }: { g: StepGate; bare: boolean }) {
  if (!bare || parked(g))
    return <span className={s.knot} data-state={g.state} aria-hidden="true" />;
  return (
    <span
      className={s.knot}
      data-state={g.state}
      role="img"
      aria-label={`Gate: ${g.label}`}
      title={g.label}
    />
  );
}

interface StageProps {
  step: Step;
  final: boolean;
  text: string;
  bare: boolean;
}

function StageStep({ step, final, text, bare }: StageProps) {
  const at = step.state === "current" || step.state === "failed";
  return (
    <li
      className={cx(s.step, final && s.final)}
      data-state={step.state}
      aria-current={at ? "step" : undefined}
    >
      <span className={s.bar}>{step.gate ? <Knot g={step.gate} bare={bare} /> : null}</span>
      <span className={s.name} title={step.name}>
        {final ? <Icon name="tick-sm" /> : null}
        {step.name}
      </span>
      {text ? <span className={s.sub}>{text}</span> : null}
      {step.round && at ? <span className={s.sub}>{roundText(step.round)}</span> : null}
      {step.gate ? <GateCaption g={step.gate} bare={bare} /> : null}
    </li>
  );
}

export function Stepper({ model, compact = false, now }: StepperProps) {
  const done = finished(model);
  const bare = compact || model.stages.filter((st) => st.gate).length > 2;
  const last = model.stages.length - 1;
  return (
    <div
      className={cx(
        s.flow,
        model.live && s.live,
        compact && s.compact,
        now !== undefined && s.card,
      )}
      style={vars({ "--n": String(model.stages.length) })}
    >
      <ol className={s.steps} aria-label="Workflow">
        {model.stages.map((step, i) => (
          <StageStep
            key={i}
            step={step}
            final={i === last && done}
            text={caption(step, i === last, model, done)}
            bare={bare}
          />
        ))}
      </ol>
      {now !== undefined ? <div className={s.now}>{now}</div> : null}
    </div>
  );
}

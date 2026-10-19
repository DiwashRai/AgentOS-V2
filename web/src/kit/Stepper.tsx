// A ticket's way through its workflow: one segment per stage, a diamond per gate. `glyph` is the
// rows' 81px slot with the stage's name beside it; `steps` is the labelled stepper of the ticket
// page and the peek. It lays out the model the screen built; it never decides a stage's state.
import { Icon } from "./Icon";
import s from "./Stepper.module.css";
import { cx, tokenPx } from "./vars";

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
  label: string;
  round?: { n: number; of: number };
  live: boolean;
  closed: boolean;
}

export interface StepperProps {
  model: StepperModel;
  look?: "glyph" | "steps";
  /** steps only: every inactive gate a bare diamond (the peek, an expanded row). */
  compact?: boolean;
}

type Item = { gate: false; step: Step; i: number } | { gate: true; g: StepGate; i: number };

function items(stages: readonly Step[]): Item[] {
  return stages.flatMap((step, i): Item[] =>
    step.gate
      ? [
          { gate: false, step, i },
          { gate: true, g: step.gate, i },
        ]
      : [{ gate: false, step, i }],
  );
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

/** Too many stages for the slot at the small size: draw at the extra-small one. The widths are
 *  Stepper.module.css's own (`--seg`, `--cur`, `--dia` and its margins, the gap), read from the
 *  tokens they're made of. */
function tight(m: StepperModel): boolean {
  const seg = tokenPx("--sp-4");
  const cur = tokenPx("--sp-5") + tokenPx("--line-1");
  const gate = tokenPx("--sp-3") + 2 * tokenPx("--line-1");
  const widths = items(m.stages).map((it) =>
    it.gate ? gate : it.step.state === "current" || it.step.state === "failed" ? cur : seg,
  );
  const gaps = (widths.length - 1) * tokenPx("--sp-1");
  return widths.reduce((a, b) => a + b, 0) + gaps > tokenPx("--w-glyph");
}

const roundText = (r: { n: number; of: number }, short = false) =>
  short ? `${String(r.n)}/${String(r.of)}` : `Round ${String(r.n)} of ${String(r.of)}`;

function Glyph({ model }: { model: StepperModel }) {
  const gate = model.stages.map((st) => st.gate).find((g) => g && parked(g));
  const done = finished(model);
  const path = items(model.stages)
    .map((it) =>
      it.gate
        ? `◆ ${it.g.label}`
        : it.step.name + (it.step.state === "skipped" ? " (skipped)" : ""),
    )
    .join(" → ");
  return (
    <span
      className={cx(s.glyph, tight(model) && s.xs, model.live && s.live, done && s.finished)}
      data-gate={gate?.state}
      data-blocked={!gate && model.stages.some((st) => st.state === "failed")}
      role="img"
      aria-label={`${model.label}: ${path}`}
      title={path}
    >
      <span className={s.segs}>
        {items(model.stages).map((it) =>
          it.gate ? (
            <u key={`g${String(it.i)}`} data-state={it.g.state} />
          ) : (
            <i key={`s${String(it.i)}`} data-state={it.step.state} />
          ),
        )}
      </span>
      {model.label ? (
        <b>
          {done ? <Icon name="tick-sm" /> : null}
          {model.label}
          {model.round && !done ? (
            <span className={s.round}>{roundText(model.round, true)}</span>
          ) : null}
        </b>
      ) : null}
    </span>
  );
}

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

/** A gate's diamond; bare (its name in the title only) when the stepper is compact and it isn't
 *  where the ticket is parked. */
function GateStep({ g, bare }: { g: StepGate; bare: boolean }) {
  const plain = bare && !parked(g);
  const sub = GATE_SUB[g.state](g);
  return (
    <li className={cx(s.gate, plain && s.bare)} data-state={g.state} title={g.label}>
      <u />
      {plain ? null : <span className={s.name}>{g.short}</span>}
      {!plain && sub ? <span className={s.sub}>{sub}</span> : null}
    </li>
  );
}

function StageStep({ step, final, text }: { step: Step; final: boolean; text: string }) {
  const at = step.state === "current" || step.state === "failed";
  return (
    <li
      className={cx(s.step, final && s.final)}
      data-state={step.state}
      aria-current={at ? "step" : undefined}
    >
      <span className={s.bar} />
      <span className={s.name}>
        {final ? <Icon name="tick" /> : null}
        {step.name}
      </span>
      {text ? <span className={s.sub}>{text}</span> : null}
      {step.round && at ? <span className={s.sub}>{roundText(step.round)}</span> : null}
    </li>
  );
}

function Steps({ model, compact }: { model: StepperModel; compact: boolean }) {
  const done = finished(model);
  const bare = compact || model.stages.filter((st) => st.gate).length > 2;
  const last = model.stages.length - 1;
  return (
    <ol className={cx(s.steps, model.live && s.live, bare && s.compact)} aria-label="Workflow">
      {items(model.stages).map((it) =>
        it.gate ? (
          <GateStep key={`g${String(it.i)}`} g={it.g} bare={bare} />
        ) : (
          <StageStep
            key={`s${String(it.i)}`}
            step={it.step}
            final={it.i === last && done}
            text={caption(it.step, it.i === last, model, done)}
          />
        ),
      )}
    </ol>
  );
}

export function Stepper({ model, look = "glyph", compact = false }: StepperProps) {
  return look === "glyph" ? <Glyph model={model} /> : <Steps model={model} compact={compact} />;
}

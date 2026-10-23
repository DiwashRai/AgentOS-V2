// A stage's card face and summary, the same in the editor and on the ticket's Workflow tab: its
// name and phase, its agent (face and name, model, effort; an override marked with the agent's own
// struck through) or its command, the prompt's first line, its own skills and files, and whether
// it is a check or a maker, as plain words (nothing on a card looks like a button). The ticket's
// tab draws it compact (no prompt) with the stage's last run as a status glyph before its name.
// In the editor its handle ends its first line. Under the lane, a loop's foot says what it repeats.
import type { ReactNode } from "react";

import type { Stage, WorkflowBody } from "../api/types";
import {
  agentOf,
  isCheck,
  type Library,
  phaseWord,
  type RefKind,
  refName,
  runtimeName,
} from "../domain/workflow";
import { Avatar, Chip, Icon, Mark, NumberField, Override, Stack, Text } from "../kit";

export function StageFace({ stage, lib }: { stage: Stage; lib: Library }) {
  if (stage.kind === "shell") return <Icon name="shell" label="Shell stage" />;
  const a = agentOf(lib, stage.agent);
  // the card writes the agent's name under it: the face is drawing alone
  return <Avatar name={a?.name ?? stage.agent} seed={`agent:${stage.agent}`} beside />;
}

function markText(s: Stage): string {
  if (!isCheck(s)) return "Maker";
  if (s.kind === "shell" || s.check === null || s.check.repairs === 0) return "Check";
  return `Check · ${String(s.check.repairs)} ${s.check.repairs === 1 ? "repair" : "repairs"}`;
}

/** Check or maker, as quiet words (a check with its tick): a property, not a control. */
function RoleMark({ stage }: { stage: Stage }) {
  return (
    <Stack dir="row" gap={2} align="center">
      {isCheck(stage) ? <Icon name="check" /> : null}
      <Text variant="meta" tone="2">
        {markText(stage)}
      </Text>
    </Stack>
  );
}

function Who({ stage, lib }: { stage: Stage; lib: Library }) {
  if (stage.kind === "shell")
    return (
      <Text variant="code" tone="2" truncate title={stage.command}>
        {stage.command}
      </Text>
    );
  const a = agentOf(lib, stage.agent);
  if (!a) return <Text tone="2">{stage.agent}</Text>;
  const o = stage.overrides;
  const parts = [
    ...(o.runtime
      ? [[runtimeName(lib.runtimes, o.runtime), runtimeName(lib.runtimes, a.runtime)] as const]
      : []),
    [o.model, a.model] as const,
    [o.effort, a.effort] as const,
  ];
  return (
    <Stack dir="row" gap={3} align="center" wrap>
      <Text tone="2" weight={500}>
        {a.name}
      </Text>
      {parts.map(([mine, own], i) => (
        <Stack key={i} dir="row" gap={3} align="center">
          <Text variant="meta">·</Text>
          {mine === null ? <Text tone="3">{own}</Text> : <Override value={mine} own={own} />}
        </Stack>
      ))}
    </Stack>
  );
}

const firstLine = (text: string) => text.split("\n").find((l) => l.trim() !== "") ?? "";

/** A chip that just landed on a stage (by a click or a drop): its ref, and a count that remounts
 *  it so a second click flashes it again. */
export interface Fresh {
  ref: string;
  n: number;
}

/** The stage's own skills and files as chips; `onRemove` makes them removable. */
export function StageChips({
  stage,
  lib,
  onRemove,
  fresh,
}: {
  stage: Stage;
  lib: Library;
  onRemove?: (kind: RefKind, id: string) => void;
  fresh?: Fresh | null;
}) {
  const refs = (["skills", "files"] as const).flatMap((kind) =>
    stage.context[kind].map((id) => ({ kind, id, ref: `${kind}:${id}` })),
  );
  if (refs.length === 0) return null;
  return (
    <Stack dir="row" gap={3} wrap>
      {refs.map(({ kind, id, ref }) => {
        const flash = fresh?.ref === ref;
        return (
          <Chip
            key={flash ? `${ref}:${String(fresh.n)}` : ref}
            lead={kind}
            label={refName(lib, kind, id)}
            flash={flash}
            {...(onRemove
              ? {
                  onRemove: () => {
                    onRemove(kind, id);
                  },
                }
              : {})}
          />
        );
      })}
    </Stack>
  );
}

/** A stage's last run on the ticket: how it stands (under way, failed, done), and its words (the
 *  stepper's). */
export interface LastRun {
  kind: "live" | "failed" | "done";
  /** Its words, its state's first ("Live · round 2 of 3"): the glyph beside them is drawing. */
  text: string;
  title: string;
}

interface SummaryProps {
  stage: Stage;
  lib: Library;
  /** Where the stage is seen: the workflow editor's lane, or the ticket's Workflow tab, which
   *  leaves out the prompt's line. */
  on: "editor" | "ticket";
  /** The stage open for editing in the editor: its settings under it show the prompt and the
   *  chips, so the card has neither. */
  editing?: boolean;
  /** The stage's last run (the ticket's tab): a glyph before the name, its words after it. */
  run?: LastRun | null;
  fresh?: Fresh | null;
  /** The editor's: the stage's handle, at its first line's end. */
  grip?: ReactNode;
}

/** A last run's glyph: the running one, a blocked one for a failure, a done one. */
const MARK = { live: "run", failed: "blk", done: "done" } as const;

/** The card's first line: the last run's glyph, the name, the phase in quiet words (unless the name
 *  says it), the run's words; at its end, Skipped, the check or maker mark and the editor's handle. */
function HeadLine({ stage, run, grip }: { stage: Stage; run: LastRun | null; grip: ReactNode }) {
  const phase = phaseWord(stage.phase);
  const samePhase = phase.toLowerCase() === stage.name.toLowerCase();
  return (
    <Stack dir="row" gap={4} align="center">
      {run ? <Mark kind={MARK[run.kind]} glyph small name={false} /> : null}
      <Text variant="label" truncate>
        {stage.name}
      </Text>
      {samePhase ? null : (
        <Text variant="meta" tone="3" title={`Phase: ${phase}`}>
          {phase}
        </Text>
      )}
      {run ? (
        <Text variant="meta" tone="2" title={run.title}>
          {run.text}
        </Text>
      ) : null}
      <Stack grow />
      {stage.enabled ? null : (
        <Text variant="meta" tone="2">
          Skipped
        </Text>
      )}
      <RoleMark stage={stage} />
      {grip}
    </Stack>
  );
}

export function StageSummary({ stage, lib, on, editing = false, run, fresh, grip }: SummaryProps) {
  const prompt = stage.kind === "agent" && on === "editor" && !editing ? stage.prompt : "";
  return (
    <Stack gap={3}>
      <HeadLine stage={stage} run={run ?? null} grip={grip} />
      <Who stage={stage} lib={lib} />
      {prompt ? (
        <Text tone="3" truncate title={prompt}>
          {firstLine(prompt)}
        </Text>
      ) : null}
      {editing ? null : <StageChips stage={stage} lib={lib} fresh={fresh ?? null} />}
    </Stack>
  );
}

/** A loop's foot: what it repeats, its rounds, and what's wrong with it. */
export function LoopFoot({
  body,
  i,
  problem,
  setTo,
}: {
  body: WorkflowBody;
  i: number;
  problem: string | undefined;
  setTo?: (n: number) => void;
}) {
  const l = body.loops[i];
  if (!l) return null;
  const name = (id: string) => body.stages.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <Icon name="loop" />
      <Text variant="meta" tone="2">{`Back to ${name(l.first)} until its checks pass, up to`}</Text>
      {setTo ? (
        <NumberField
          label="Rounds"
          value={l.rounds}
          min={1}
          max={5}
          unit="rounds"
          onChange={setTo}
        />
      ) : (
        <Text variant="meta" tone="2" weight={500}>{`${String(l.rounds)} rounds`}</Text>
      )}
      {problem ? (
        <Text variant="meta" tone="blocked" weight={500}>
          {problem}
        </Text>
      ) : null}
    </>
  );
}

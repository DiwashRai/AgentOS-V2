// A stage's card face and summary, the same in the editor and on the ticket's Workflow tab: its
// name and phase, its agent (face and name, model, effort; an override marked with the agent's own
// struck through) or its command, the prompt's first line, its own skills and files, and whether
// it is a check or a maker, as plain words (nothing on a card looks like a button). The ticket's
// tab draws it compact (no prompt) with the stage's last run as a status glyph before its name.
import type { Stage } from "../../api/types";
import { Avatar, Chip, Icon, Mark, type MarkKind, Override, Stack, Text } from "../../kit";
import { agentOf, type Library, refName, runtimeName } from "./library";
import { isCheck, phaseWord, type RefKind } from "./model";

export function StageFace({ stage, lib }: { stage: Stage; lib: Library }) {
  if (stage.kind === "shell") return <Icon name="shell" label="Shell stage" />;
  const a = agentOf(lib, stage.agent);
  return <Avatar name={a?.name ?? stage.agent} seed={`agent:${stage.agent}`} />;
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
    ...(o.runtime ? [[runtimeName(lib, o.runtime), runtimeName(lib, a.runtime)] as const] : []),
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
            lead={<Icon name={kind} />}
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

/** A stage's last run on the ticket: its glyph's state, and its words (the stepper's). */
export interface LastRun {
  kind: Extract<MarkKind, "run" | "blk" | "done">;
  word: string;
  text: string;
  title: string;
}

interface SummaryProps {
  stage: Stage;
  lib: Library;
  /** all: the editor's closed card; compact: the ticket's tab, no prompt line; head: an opened
   *  card, whose settings under it show the prompt and the chips. */
  show?: "all" | "compact" | "head";
  /** The stage's last run (the ticket's tab): a glyph before the name, its words after it. */
  run?: LastRun | null;
  fresh?: Fresh | null;
}

/** The card's first line: the last run's glyph, the name, the phase (unless the name says it), the
 *  run's words; at its end, Skipped and the check or maker mark. */
function HeadLine({ stage, run }: { stage: Stage; run: LastRun | null }) {
  const phase = phaseWord(stage.phase);
  const samePhase = phase.toLowerCase() === stage.name.toLowerCase();
  return (
    <Stack dir="row" gap={4} align="center">
      {run ? <Mark kind={run.kind} glyph small name={run.word} /> : null}
      <Text variant="label" truncate>
        {stage.name}
      </Text>
      {samePhase ? null : <Chip tone="fill" label={phase} title={`Phase: ${phase}`} />}
      {run ? (
        <Text variant="meta" tone="2" title={run.title}>
          {run.text}
        </Text>
      ) : null}
      <Stack grow />
      {stage.enabled ? null : <Text variant="meta">Skipped</Text>}
      <RoleMark stage={stage} />
    </Stack>
  );
}

export function StageSummary({ stage, lib, show = "all", run, fresh }: SummaryProps) {
  const prompt = stage.kind === "agent" && show === "all" ? stage.prompt : "";
  return (
    <Stack gap={3}>
      <HeadLine stage={stage} run={run ?? null} />
      <Who stage={stage} lib={lib} />
      {prompt ? (
        <Text variant="code" truncate title={prompt}>
          {firstLine(prompt)}
        </Text>
      ) : null}
      {show === "head" ? null : <StageChips stage={stage} lib={lib} fresh={fresh ?? null} />}
    </Stack>
  );
}

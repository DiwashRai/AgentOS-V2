// The ticket's Runs tab (?tab=runs): its runs, newest first, in the app's list style. Each line is
// one run: its key, its state glyph and where it is (the stage and round it is on, or where it
// stopped, in the past tense once it has ended) with the stage it started from receding after it,
// its time against its budget, how long ago it started and who started it. The newest is open: who
// started it when, its route and the time it has left, then its stages in the order they ran, a
// loop's once per round, and the gate it stopped at as the stepper's diamond. A stage's glyph says
// its state; a check's verdict sits at the right end, or a word where it has none yet.
import { useState } from "react";

import { useRuns, useTicketWorkflow } from "../../api/queries";
import type { Run, RunState, StageRun, Ticket, TicketWorkflow } from "../../api/types";
import { firstName } from "../../domain/format";
import {
  Avatar,
  Badge,
  Chip,
  type Column,
  Icon,
  Mark,
  type MarkKind,
  Notice,
  Row,
  Stack,
  Table,
  Text,
} from "../../kit";
import { useBoard } from "../shared/board";

// Compact's line: the key, then the glyph and what the run is doing, then one quiet cluster at the
// far end (its time, when it started, who started it), each on a fixed column so they line up.
const COLUMNS: readonly Column[] = [
  { label: "Run", width: "xs" },
  { label: "Where", width: "fill", min: "xl" },
  { label: "Time", width: "xl", hug: true, end: true },
  { label: "Started", width: "sm", end: true },
  { label: "By", width: "face", end: true },
];

// The open run's stages: the stage (or gate) on its glyph, its round, and at the right end a
// check's verdict or what it is doing.
const STAGE_COLUMNS: readonly Column[] = [
  { label: "Stage", width: "lg" },
  { label: "Verdict", width: "md" },
  { label: "Round", width: "fill" },
];

const RUN_MARK: Record<RunState, { kind: MarkKind; word: string }> = {
  queued: { kind: "queued", word: "Queued" },
  launched: { kind: "queued", word: "Starting" },
  running: { kind: "run", word: "Running" },
  // a run ends at a gate (R30): its part is done, and the ticket waits there, not the run
  gated: { kind: "done", word: "Stopped at a gate" },
  succeeded: { kind: "done", word: "Finished" },
  failed: { kind: "blk", word: "Failed" },
  cancelled: { kind: "abandoned", word: "Cancelled" },
};

const ROUTE = { runner: "on the runner", mailbox: "by mailbox", client: "on a client" } as const;

const STAGE_MARK: Record<StageRun["state"], { kind: MarkKind; name: string }> = {
  pending: { kind: "queued", name: "Pending" },
  running: { kind: "run", name: "Running" },
  done: { kind: "done", name: "Done" },
  failed: { kind: "blk", name: "Failed" },
};

/** A stage run's glyph: a failed verdict draws as a failure, though the stage itself ran. */
const stageMark = (s: StageRun) =>
  s.verdict === "fail" ? { kind: "blk" as const, name: "Failed its check" } : STAGE_MARK[s.state];

/** How many rounds the loop around a stage allows, from the ticket's copy; null outside a loop. */
function roundsOf(w: TicketWorkflow | undefined, stageId: string): number | null {
  if (!w) return null;
  const at = (id: string) => w.stages.findIndex((s) => s.id === id);
  const i = at(stageId);
  const loop = w.loops.find((l) => at(l.first) <= i && i <= at(l.last));
  return loop ? loop.rounds : null;
}

const stageName = (w: TicketWorkflow | undefined, id: string) =>
  w?.stages.find((s) => s.id === id)?.name ?? id;

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Minutes the run has taken: to its end, or to now while it goes on. */
function minutes(r: Run, now: number): number {
  if (r.started_at === null) return 0;
  const end = r.ended_at === null ? now : Date.parse(r.ended_at);
  return Math.max(0, Math.round((end - Date.parse(r.started_at)) / 60_000));
}

/** The gate a run stopped at: the one after the last stage it ran. */
function gateOf(r: Run, w: TicketWorkflow | undefined) {
  if (r.state !== "gated" || !w) return null;
  const last = r.stages.filter((s) => s.state === "done").at(-1);
  const i = w.stages.findIndex((s) => s.id === last?.stage_id);
  const stage = w.stages[i];
  if (!stage?.gate) return null;
  // signing it off is continuing (R29): a later run from the next stage that's on
  const next = w.stages.slice(i + 1).find((s) => s.enabled);
  return { stage: stage.id, label: stage.gate.label, next: next?.id ?? null };
}

/** The sign-off of the gate a run stopped at: the later run that continued past it, by whom and
 *  when. */
function signedOff(r: Run, runs: readonly Run[], w: TicketWorkflow | undefined) {
  const gate = gateOf(r, w);
  if (!gate) return null;
  const on = runs.find((x) => x.id > r.id && x.from_stage === gate.next);
  if (!on) return null;
  return { run: on.id, who: on.by ? firstName(on.by.name) : "Someone", at: clock(on.created_at) };
}

/** How long ago, to the hour once past one: "47m ago", "2h ago", "3d ago". */
function ago(iso: string, now: number): string {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 60) return `${String(m)}m ago`;
  return m < 1440 ? `${String(Math.floor(m / 60))}h ago` : `${String(Math.floor(m / 1440))}d ago`;
}

/** Where the run is: the stage it's on and its round, or where it stopped, said in the past; and
 *  whether those words say the run's state (a gate stop or the state's own word do; a stage's name
 *  doesn't), so its glyph knows whether to say it. */
function whereOf(r: Run, w: TicketWorkflow | undefined): { text: string; saysState: boolean } {
  const on = r.stages.find((s) => s.state === "running");
  if (on) {
    const of = roundsOf(w, on.stage_id);
    const text = of === null ? on.name : `${on.name}, round ${String(on.round)} of ${String(of)}`;
    return { text, saysState: false };
  }
  const gate = gateOf(r, w);
  if (gate) return { text: `Stopped at ${gate.label}`, saysState: true };
  return { text: r.reason ?? RUN_MARK[r.state].word, saysState: r.reason === null };
}
/** Whether a stage line's end says its state (a verdict, running, pending). */
const endSaysState = (s: StageRun) =>
  s.verdict !== null || s.state === "running" || s.state === "pending";

interface RunProps {
  r: Run;
  runs: readonly Run[];
  w: TicketWorkflow | undefined;
  now: number;
}

function RunLine({ r, runs, w, now }: RunProps) {
  const mark = RUN_MARK[r.state];
  const where = whereOf(r, w);
  const signed = signedOff(r, runs, w);
  const after = `from ${stageName(w, r.from_stage)}${signed ? ` · signed off ${signed.at}` : ""}`;
  const time = `${String(minutes(r, now))}m of ${String(r.budget_min)}m`;
  const started = r.started_at ?? r.created_at;
  return [
    <Badge key="key" kind="key">{`#${String(r.id)}`}</Badge>,
    <Stack key="where" dir="row" gap={4} align="center">
      <Mark kind={mark.kind} glyph name={where.saysState ? false : mark.word} />
      <Text tone="3" truncate title={`${where.text} · ${after}`}>
        <Text weight={500} tone="1">
          {where.text}
        </Text>
        {`\u2002${after}`}
      </Text>
    </Stack>,
    <Text key="time" variant="meta" tone="3" tabular title={`${time} budget`}>
      {time}
    </Text>,
    <Text key="age" variant="meta" tone="3" tabular title={`Started ${clock(started)}`}>
      {ago(started, now)}
    </Text>,
    r.by ? <Avatar key="by" name={r.by.name} seed={String(r.by.id)} /> : <Avatar key="by" />,
  ];
}

/** Beside a stage's name: a check's verdict, else what it's doing while it has none, in plain words
 *  (the glyph at the line's start already shows the state in its hue, so the words take none). */
function Verdict({ s }: { s: StageRun }) {
  if (s.verdict)
    return (
      <Text variant="meta" tone="2">
        {s.verdict === "pass" ? "Passed" : "Failed"}
      </Text>
    );
  if (s.state === "running")
    return (
      <Text variant="meta" tone="2">
        Running
      </Text>
    );
  if (s.state === "pending")
    return (
      <Text variant="meta" tone="3">
        Pending
      </Text>
    );
  return <Text variant="meta">{""}</Text>;
}

function StageLine({ s, w }: { s: StageRun; w: TicketWorkflow | undefined }) {
  const of = roundsOf(w, s.stage_id);
  const m = stageMark(s);
  return (
    <Row kind="rack">
      <Stack dir="row" gap={4} align="center">
        <Mark kind={m.kind} glyph name={endSaysState(s) ? false : m.name} />
        <Text weight={500} tone={s.state === "pending" ? "3" : "1"}>
          {s.name}
        </Text>
      </Stack>
      <Verdict s={s} />
      {of === null ? (
        <Text variant="meta">{""}</Text>
      ) : (
        <Stack dir="row" gap={3} align="center">
          <Icon name="loop" />
          <Text variant="meta" tone="3" tabular>
            {`Round ${String(s.round)} of ${String(of)}`}
          </Text>
        </Stack>
      )}
    </Row>
  );
}

/** The gate the run stopped at, on the stepper's diamond: who signed it off and when, and the run
 *  that went on; or waiting. */
function GateLine({ label, signed }: { label: string; signed: ReturnType<typeof signedOff> }) {
  return (
    <Row kind="rack">
      <Stack dir="row" gap={4} align="center">
        <Icon name="gate" />
        <Text weight={500} tone="1">
          {label}
        </Text>
      </Stack>
      <Text variant="meta" tone="3">
        {signed
          ? `${signed.who} signed it off at ${signed.at}; run #${String(signed.run)} went on`
          : ""}
      </Text>
      <Chip dot={signed ? "done" : "you"} label={signed ? "Signed off" : "Waiting"} />
    </Row>
  );
}

/** The open run: who started it when, its route and how it ended or the time it has left (its time
 *  and the stage it started from are on its line); then its stages as they ran, and its gate. */
function RunDetail({ r, runs, w, now }: RunProps) {
  const left = Math.max(0, r.budget_min - minutes(r, now));
  const end = r.ended_at === null ? `${String(left)}m left` : `ended ${clock(r.ended_at)}`;
  const gate = gateOf(r, w);
  return (
    <Stack gap={6}>
      <Stack dir="row" gap={3} align="center">
        {r.by ? (
          <Avatar size="sm" name={r.by.name} seed={String(r.by.id)} beside />
        ) : (
          <Avatar size="sm" />
        )}
        <Text tone="3">
          <Text tone="1">{r.by?.name ?? "Nobody"}</Text>
          {` ${r.started_at ? `started it at ${clock(r.started_at)}` : "queued it"} · ${ROUTE[r.route]} · ${end}`}
        </Text>
      </Stack>
      <Table columns={STAGE_COLUMNS} head={false} scroll={false}>
        {r.stages.map((s, i) => (
          <StageLine key={i} s={s} w={w} />
        ))}
        {gate ? <GateLine label={gate.label} signed={signedOff(r, runs, w)} /> : null}
      </Table>
    </Stack>
  );
}

export function RunsTab({ t }: { t: Ticket }) {
  const runs = useRuns(t.key);
  const w = useTicketWorkflow(t.key).data;
  const { now } = useBoard();
  const items = runs.data?.items ?? [];
  // the newest is open until another is picked; picking the open one closes it
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const open = picked === undefined ? items[0]?.id : picked;
  if (runs.isPending) return <Notice kind="status">Loading runs</Notice>;
  if (items.length === 0)
    return (
      <Notice kind="empty" lead="No runs yet">
        Dispatch the ticket to start one.
      </Notice>
    );
  return (
    <Table columns={COLUMNS} head={false} scroll={false}>
      {items.map((r) => (
        <Row
          key={r.id}
          action={{
            label: `Run ${String(r.id)}: ${whereOf(r, w).text}`,
            run: () => {
              setPicked(open === r.id ? null : r.id);
            },
          }}
          open={open === r.id}
          more={<RunDetail r={r} runs={items} w={w} now={now} />}
        >
          {RunLine({ r, runs: items, w, now })}
        </Row>
      ))}
    </Table>
  );
}

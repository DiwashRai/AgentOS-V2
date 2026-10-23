// The ticket's Workflow tab (?tab=workflow): its copy of its workflow, read only and compact: its
// name as the editor's title says it (NW-17's copy of Standard v3) with the one Edit beside it,
// who edited it and its drift; the workflow context as chips; the stages as the editor's lane
// with none of its editing affordances (the same cards, without their prompts), its gates and
// loops, each stage with its last run as a status glyph before its name, in the stepper's words.
// Edit opens the editor full window over the ticket (?edit=workflow); nothing is edited here.
import { useNow, useRuns, useTicketWorkflow } from "../../api/queries";
import type { Run, Ticket, TicketWorkflow } from "../../api/types";
import { Button, Card, Chip, Lane, Notice, Section, Stack, Text } from "../../kit";
import { LoopFoot } from "../workflow/Editor";
import { type Library, refName, useLibrary } from "../workflow/library";
import { type LastRun, StageFace, StageSummary } from "../workflow/StageCard";
import { authorText } from "../workflow/who";
import { copyTitle } from "./copy";
import { ticketHref, WORKFLOW } from "./tabs";
import { DriftChips } from "./WorkflowOverlay";

/** A run's state at a stage, in the stepper's words (Live, as the stepper says a running stage). */
const WORD: Record<LastRun["kind"], string> = { run: "Live", blk: "Failed", done: "Done" };

/** A stage's last run: the newest run that reached it, at its latest round there. */
function lastRun(runs: readonly Run[], stage: string, rounds: number): LastRun | null {
  for (const run of runs) {
    const at = run.stages.filter((s) => s.stage_id === stage && s.state !== "pending").at(-1);
    if (!at) continue;
    const failed = at.state === "failed" || at.verdict === "fail";
    const kind: LastRun["kind"] = at.state === "running" ? "run" : failed ? "blk" : "done";
    const round = rounds > 1 ? ` · round ${String(at.round)} of ${String(rounds)}` : "";
    return {
      kind,
      text: `${WORD[kind]}${round}`,
      title: `Run #${String(run.id)}`,
    };
  }
  return null;
}

/** The rounds of the loop a stage is in (1 outside a loop). */
function roundsOf(w: TicketWorkflow, i: number): number {
  const ids = w.stages.map((s) => s.id);
  const loop = w.loops.find((l) => ids.indexOf(l.first) <= i && i <= ids.indexOf(l.last));
  return loop?.rounds ?? 1;
}

function Stages({ w, runs, lib }: { w: TicketWorkflow; runs: readonly Run[]; lib: Library }) {
  return (
    <Lane
      label="Stages"
      stages={w.stages.map((s, i) => ({
        id: s.id,
        label: s.name,
        gate: s.gate?.label ?? null,
        content: () => (
          <Card label={s.name} face={<StageFace stage={s} lib={lib} />} off={!s.enabled}>
            <StageSummary
              stage={s}
              lib={lib}
              show="compact"
              run={s.enabled ? lastRun(runs, s.id, roundsOf(w, i)) : null}
            />
          </Card>
        ),
      }))}
      loops={w.loops.map((l, i) => ({
        first: l.first,
        last: l.last,
        foot: <LoopFoot body={w} i={i} problem={undefined} />,
      }))}
    />
  );
}

function Context({ w, lib }: { w: TicketWorkflow; lib: Library }) {
  return (
    <Stack dir="row" gap={4} align="center" wrap>
      <Text variant="meta" tone="2" weight={500}>
        Every stage gets
      </Text>
      {(["skills", "files"] as const).flatMap((kind) =>
        w.context[kind].map((id) => (
          <Chip key={`${kind}:${id}`} lead={kind} label={refName(lib, kind, id)} />
        )),
      )}
    </Stack>
  );
}

export function WorkflowTab({ t }: { t: Ticket }) {
  const w = useTicketWorkflow(t.key);
  const runs = useRuns(t.key).data?.items ?? [];
  const lib = useLibrary();
  const now = useNow(60_000);
  if (!w.data)
    return (
      <Notice kind="status" error={w.isError}>
        {w.isError ? `${t.key} has no workflow` : "Loading the workflow"}
      </Notice>
    );
  const copy = w.data;
  return (
    <Section
      title={copyTitle(copy.ticket, copy.name, copy.from.version)}
      end={
        <Button icon="compose" href={ticketHref(t.key, "workflow", WORKFLOW)}>
          Edit
        </Button>
      }
      note={
        <Stack dir="row" gap={4} align="center" wrap>
          <DriftChips w={copy} />
          <Text variant="meta">{`Edited by ${authorText(copy.updated_by, copy.updated_at, now)}`}</Text>
        </Stack>
      }
    >
      <Context w={copy} lib={lib} />
      <Stages w={copy} runs={runs} lib={lib} />
    </Section>
  );
}

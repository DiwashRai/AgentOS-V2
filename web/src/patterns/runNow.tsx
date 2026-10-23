// A run's Now on a ticket's line, as the lists that show runs draw it (My queue, All teams): the
// agent at work in plain words, the step under way of all quieter after it, and a still meter at the
// cell's end, so the meters line up down the list; the run and its step in one tooltip. A queued
// run says only that it is queued, quiet, over a dashed track.
import type { Iso } from "../api/types";
import { type AtWork, stepText } from "../domain/board";
import { ago } from "../domain/format";
import { Meter, Stack, Text } from "../kit";

export function RunNow({ run, since, now }: { run: AtWork; since: Iso; now: number }) {
  const id = `#${String(run.run_id)}`;
  if (run.kind === "queued")
    return (
      <Stack dir="row" gap={5} align="center" justify="between" grow>
        <Text tone="3" truncate title={`Run ${id} · queued ${ago(since, now)}`}>
          Queued
        </Text>
        <Meter size="list" queued />
      </Stack>
    );
  const p = run.progress;
  const step = p ? stepText(p) : null;
  return (
    <Stack dir="row" gap={5} align="center" justify="between" grow>
      <Text
        tone="2"
        truncate
        title={[run.agent, `run ${id}`, step ? `step ${step}` : null].filter(Boolean).join(" · ")}
      >
        {run.agent}
        {step ? <Text tone="3" tabular>{`\u2002${step}`}</Text> : null}
      </Text>
      {p ? <Meter size="list" done={p.done} total={p.total} /> : null}
    </Stack>
  );
}

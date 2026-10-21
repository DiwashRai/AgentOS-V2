// What happens now, as the run card's foot on the ticket page and in the peek: the live run on one
// line (who, its run, its step, how long; its log and its Cancel on the right) with the plan step
// it is on under it, or the ticket's state (a gate's ask, a blocked reason) when nothing runs. One
// type size and regular weight throughout, so the run reads as one object; its glyph is its colour.
import type { Person, Ticket } from "../../api/types";
import { markOf, stepText } from "../../domain/board";
import { elapsed } from "../../domain/format";
import type { PlanItem } from "../../domain/plan";
import { Button, Mark, Meter, Stack, Text } from "../../kit";
import { ActionButton } from "../shared/Actions";

interface NowProps {
  t: Ticket;
  me: Person | null;
  now: number;
  plan: readonly PlanItem[];
}

export function Now({ t, me, now, plan }: NowProps) {
  const a = t.attention;
  const cancel = t.actions.find((x) => x.id === "cancel");
  const stop = cancel ? <ActionButton action={cancel} /> : null;
  if (a.kind !== "running") {
    return (
      <Stack dir="row" gap={5} align="center">
        <Mark {...markOf(a, me)} />
        <Text weight={400} tone="2">
          {a.kind === "blocked" ? a.reason : t.now}
        </Text>
        <Stack grow />
        {stop}
      </Stack>
    );
  }
  const p = a.progress;
  const step = plan.length === p?.total ? plan[Math.min(p.done, p.total - 1)]?.text : undefined;
  const run = `${a.agent} · run #${String(a.run_id)}`;
  return (
    <Stack gap={5}>
      <Stack dir="row" gap={4} align="center">
        <Mark kind="run" glyph name={`${run}, running`} progress={p ?? null} />
        <Text tone="1" truncate title={`${run} · ${a.step}`}>
          {`${run} · `}
          <Text tone="2">{a.step}</Text>
          <Text tone="3" tabular>{` · ${elapsed(t.since, now)}`}</Text>
        </Text>
        <Stack grow />
        <Button variant="link">Log →</Button>
        {stop}
      </Stack>
      {p ? (
        <Stack dir="row" gap={5} align="center">
          <Meter size="row" done={p.done} total={p.total} />
          <Text tone="3" truncate title={step}>
            {`Step ${stepText(p).replace("/", " of ")}`}
            {step ? ` · ${step}` : ""}
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}

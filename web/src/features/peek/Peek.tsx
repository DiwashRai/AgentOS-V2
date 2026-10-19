// The peek (`?peek=KEY`, over any view): the ticket's plan, run or status, and its conversation,
// without leaving the list. It never carries gate actions; those live on the row and the ticket.
import { useSearchParams } from "react-router";

import { useMessages, usePlan, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { markOf, runLine, stageModel, stagesText } from "../../domain/board";
import { firstName, repoShort } from "../../domain/format";
import { parsePlan, unsectioned } from "../../domain/plan";
import {
  Badge,
  Button,
  Checklist,
  Dialog,
  Facts,
  Mark,
  Meter,
  Stack,
  Stepper,
  Text,
  Thread,
} from "../../kit";
import { threadMessage, useBoard } from "../shared/board";

interface BodyProps {
  t: Ticket;
  me: Person | null;
  now: number;
  onClose: () => void;
}

function Head({ t, me, onClose }: Omit<BodyProps, "now">) {
  return (
    <Stack gap={4}>
      <Stack dir="row" gap={4} align="center">
        <Text variant="code">{t.source ? `Jira ${t.source.ref}` : t.key}</Text>
        {t.repo ? <Text variant="code">{`· ${repoShort(t.repo)}`}</Text> : null}
        <Stack grow />
        <Stepper model={stageModel(t, me)} />
        <Button size="sm" href={`/t/${t.key}`}>
          Open
        </Button>
        <Button size="sm" icon="close" title="Close peek" onClick={onClose} />
      </Stack>
      <Text variant="title" as="h2">
        {t.title}
      </Text>
      <Text tone="2" truncate={2}>
        {t.description.split("\n\n")[0] ?? ""}
      </Text>
      <Facts
        items={[
          { label: "Owner", value: firstName(t.owner?.name ?? "Nobody") },
          { label: "Workflow", value: `${t.workflow.name} · ${stagesText(t)}` },
        ]}
      />
    </Stack>
  );
}

function Plan({ t, me }: { t: Ticket; me: Person | null }) {
  const plan = parsePlan(usePlan(t.key).data ?? "");
  const done = plan.filter((i) => i.done).length;
  return (
    <Stack gap={4}>
      <Text variant="meta" weight={500}>
        {plan.length > 0 ? `Plan · ${String(done)} of ${String(plan.length)} done` : "Plan"}
      </Text>
      {plan.length > 0 ? (
        <Checklist items={unsectioned(plan)} />
      ) : (
        <Text tone="3">No plan yet.</Text>
      )}
      <Stepper model={stageModel(t, me)} look="steps" compact />
    </Stack>
  );
}

/** The live run, or the ticket's state when nothing runs. */
function Now({ t, me, now }: Omit<BodyProps, "onClose">) {
  const a = t.attention;
  if (a.kind !== "running") {
    return (
      <Stack gap={4}>
        <Text variant="meta" weight={500}>
          Status
        </Text>
        <Mark {...markOf(a, me)} />
        <Text tone="2">{a.kind === "blocked" ? a.reason : t.now}</Text>
      </Stack>
    );
  }
  return (
    <Stack gap={4}>
      <Stack dir="row" gap={3} align="center">
        <Mark kind="run" glyph />
        <Text variant="meta" tone="live" weight={500}>
          {runLine(t, now)}
        </Text>
      </Stack>
      {a.progress ? <Meter done={a.progress.done} total={a.progress.total} /> : null}
      <Text tone="2">{a.step}</Text>
    </Stack>
  );
}

function Talk({ t, me }: { t: Ticket; me: Person | null }) {
  const messages = useMessages(t.key).data?.items ?? [];
  return (
    <Stack gap={4}>
      <Text variant="meta" weight={500}>
        Talk · Just people here. Agents don&apos;t read this.
      </Text>
      <Thread
        messages={messages.map((m) => threadMessage(m, me))}
        compose={`Say something about ${t.key}`}
      />
    </Stack>
  );
}

function Body({ t, me, now, onClose }: BodyProps) {
  return (
    <>
      <Head t={t} me={me} onClose={onClose} />
      <Plan t={t} me={me} />
      <Now t={t} me={me} now={now} />
      <Talk t={t} me={me} />
      <Stack dir="row" gap={3} align="center">
        <Badge kind="kbd">Esc</Badge>
        <Text variant="meta">close</Text>
        <Stack grow />
        <Button variant="link" href={`/t/${t.key}`}>
          Open ticket →
        </Button>
      </Stack>
    </>
  );
}
function Loaded({ ticketKey, ...rest }: Omit<BodyProps, "t"> & { ticketKey: string }) {
  const ticket = useTicket(ticketKey);
  if (ticket.data) return <Body t={ticket.data} {...rest} />;
  return ticket.isError ? (
    <Text tone="blocked">{`Ticket not found · ${ticketKey}`}</Text>
  ) : (
    <Text tone="3">Loading</Text>
  );
}

export function Peek() {
  const [params, setParams] = useSearchParams();
  const key = params.get("peek");
  const { me, now } = useBoard();
  const close = () => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      out.delete("peek");
      return out;
    });
  };
  return (
    <Dialog label={key ? `Peek at ${key}` : "Peek"} open={key !== null} onClose={close}>
      {key ? <Loaded ticketKey={key} me={me} now={now} onClose={close} /> : null}
    </Dialog>
  );
}

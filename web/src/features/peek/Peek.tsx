// The peek (`?peek=KEY`, over any view): the ticket's head as the ticket page draws it (its title and
// lead, its properties, the stepper with what happens now under it), its conversation, then its
// plan, with the reply box pinned at the panel's foot, without leaving the list. It never carries
// gate actions; those live on the row and the ticket. The run's Cancel sits on the run's own line,
// as on the ticket page.
import { useSearchParams } from "react-router";

import { useMessages, usePlan, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { stageModel } from "../../domain/board";
import { parsePlan, type PlanItem } from "../../domain/plan";
import {
  Avatar,
  Button,
  Checklist,
  Composer,
  Dialog,
  Stack,
  Stepper,
  Text,
  Thread,
} from "../../kit";
import { threadMessage, useBoard } from "../shared/board";
import { Now } from "../ticket/now";
import { Properties } from "../ticket/properties";
import { TalkHead } from "../ticket/talk";

interface BodyProps {
  t: Ticket;
  me: Person | null;
  now: number;
  onClose: () => void;
}

/** The ticket's head, as the ticket page's: key, title, its lead, properties, the stepper. */
function Head({ t, me, now, onClose, plan }: BodyProps & { plan: readonly PlanItem[] }) {
  return (
    <Stack gap={8}>
      <Stack dir="row" gap={4} align="center">
        <Text tone="2" weight={500} tabular>
          {t.source ? `${t.key} · Jira ${t.source.ref}` : t.key}
        </Text>
        <Stack grow />
        <Button size="sm" href={`/t/${t.key}`}>
          Open ticket
        </Button>
        <Button size="sm" icon="close" title="Close peek (Esc)" onClick={onClose} />
      </Stack>
      <Stack gap={4}>
        <Text variant="title" as="h2">
          {t.title}
        </Text>
        <Text variant="body" as="p">
          {t.description.split("\n\n")[0] ?? ""}
        </Text>
      </Stack>
      <Properties
        t={t}
        now={now}
        owner={
          t.owner ? (
            <>
              <Avatar name={t.owner.name} seed={String(t.owner.id)} />
              {t.owner.name}
            </>
          ) : (
            "Nobody"
          )
        }
      />
      <Stepper model={stageModel(t, me)} now={<Now t={t} me={me} now={now} plan={plan} />} />
    </Stack>
  );
}

function Plan({ plan }: { plan: readonly PlanItem[] }) {
  const done = plan.filter((i) => i.done).length;
  return (
    <Stack gap={5}>
      <Stack dir="row" gap={4} align="baseline">
        <Text variant="heading" as="h2">
          Plan
        </Text>
        {plan.length > 0 ? (
          <Text variant="meta">{`${String(done)} of ${String(plan.length)} done`}</Text>
        ) : null}
      </Stack>
      {plan.length > 0 ? (
        <Checklist items={plan} look="peek" />
      ) : (
        <Text tone="3">No plan yet.</Text>
      )}
    </Stack>
  );
}

function Talk({ t, me }: { t: Ticket; me: Person | null }) {
  const messages = useMessages(t.key).data?.items ?? [];
  const people = [...new Map(messages.map((m) => [m.author.id, m.author])).values()];
  return (
    <Stack gap={8}>
      <TalkHead people={people} />
      <Thread messages={messages.map((m) => threadMessage(m, me))} />
    </Stack>
  );
}

function Body(props: BodyProps) {
  const plan = parsePlan(usePlan(props.t.key).data ?? "");
  return (
    <>
      <Head {...props} plan={plan} />
      <Talk t={props.t} me={props.me} />
      <Plan plan={plan} />
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

/** The reply box, pinned at the panel's foot once the ticket is there. */
function Reply({ ticketKey }: { ticketKey: string }) {
  const ticket = useTicket(ticketKey);
  return ticket.data ? <Composer label={`Say something about ${ticketKey}`} /> : null;
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
    <Dialog
      label={key ? `Peek at ${key}` : "Peek"}
      open={key !== null}
      onClose={close}
      foot={key ? <Reply ticketKey={key} /> : null}
    >
      {key ? <Loaded ticketKey={key} me={me} now={now} onClose={close} /> : null}
    </Dialog>
  );
}

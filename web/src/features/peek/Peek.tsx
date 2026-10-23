// The peek (`?peek=KEY`, over any view): the ticket's head as the ticket page draws it (its title and
// lead, its properties, the stepper with what happens now under it), its conversation, then its
// plan, with the reply box pinned at the panel's foot, without leaving the list. It never carries
// gate actions; those live on the row and the ticket. The run's Cancel sits on the run's own line,
// as on the ticket page.
import { useState } from "react";
import { useSearchParams } from "react-router";

import { useMessages, usePlan, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { stageModel } from "../../domain/board";
import { parsePlan, type PlanItem } from "../../domain/plan";
import {
  Avatar,
  Button,
  Composer,
  Dialog,
  Icon,
  Notice,
  Section,
  Stack,
  Stepper,
  Text,
  Thread,
} from "../../kit";
import { threadMessage, useBoard } from "../shared/board";
import { TicketMenu } from "../shared/TicketMenu";
import { Now } from "../ticket/now";
import { PlanSection } from "../ticket/plan";
import { Properties } from "../ticket/properties";
import { TalkSection } from "../ticket/talk";

interface BodyProps {
  t: Ticket;
  me: Person | null;
  now: number;
}

/** The panel's bar, pinned over it: the ticket's key (and its Jira issue), then Open ticket, the
 *  ticket's menu and the close. */
function Bar({ ticketKey, onClose }: { ticketKey: string; onClose: () => void }) {
  const t = useTicket(ticketKey).data;
  return (
    <Stack dir="row" gap={3} align="center" grow>
      {t ? <Icon name={t.type} /> : null}
      <Text tone="2" weight={500} tabular>
        {t?.source ? `${ticketKey} · Jira ${t.source.ref}` : ticketKey}
      </Text>
      <Stack grow />
      {/* the three in one look: the controls' own, each its own fill */}
      <Button size="sm" icon="out" href={`/t/${ticketKey}`}>
        Open ticket
      </Button>
      {t ? <TicketMenu t={t} size="sm" /> : null}
      <Button size="sm" icon="close" title="Close peek (Esc)" onClick={onClose} />
    </Stack>
  );
}

/** The ticket's head, as the ticket page's: title, its lead, properties, the stepper. */
function Head({ t, me, now, plan }: BodyProps & { plan: readonly PlanItem[] }) {
  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <Text variant="display" as="h2">
          {t.title}
        </Text>
        <Text variant="body" as="p">
          {t.description.split("\n\n")[0] ?? ""}
        </Text>
      </Stack>
      <Properties
        t={t}
        now={now}
        owner={{
          value: t.owner ? (
            <>
              <Avatar name={t.owner.name} seed={String(t.owner.id)} beside />
              {t.owner.name}
            </>
          ) : (
            "Nobody"
          ),
        }}
      />
      <Stepper model={stageModel(t, me)} now={<Now t={t} me={me} now={now} plan={plan} />} />
    </Stack>
  );
}

function Talk({ t, me }: { t: Ticket; me: Person | null }) {
  const messages = useMessages(t.key).data?.items ?? [];
  const people = [...new Map(messages.map((m) => [m.author.id, m.author])).values()];
  return (
    <TalkSection people={people}>
      <Thread messages={messages.map((m) => threadMessage(m, me))} />
    </TalkSection>
  );
}

function Body(props: BodyProps) {
  const plan = parsePlan(usePlan(props.t.key).data ?? "");
  return (
    <>
      <Section label={props.t.title}>
        <Head {...props} plan={plan} />
      </Section>
      <Talk t={props.t} me={props.me} />
      <PlanSection plan={plan} look="peek" />
    </>
  );
}

function Loaded({ ticketKey, ...rest }: Omit<BodyProps, "t"> & { ticketKey: string }) {
  const ticket = useTicket(ticketKey);
  if (ticket.data) return <Body t={ticket.data} {...rest} />;
  return (
    <Section label={ticketKey}>
      <Notice kind="status" error={ticket.isError}>
        {ticket.isError ? `Ticket not found · ${ticketKey}` : `Loading ${ticketKey}`}
      </Notice>
    </Section>
  );
}

/** The reply box, pinned at the panel's foot once the ticket is there. */
function Reply({ ticketKey }: { ticketKey: string }) {
  const ticket = useTicket(ticketKey);
  const [draft, setDraft] = useState("");
  return ticket.data ? (
    <Composer
      label={`Say something about ${ticketKey}`}
      value={draft}
      onChange={setDraft}
      // W0 is static: sending arrives with the API, so the draft stays
      onSend={() => undefined}
    />
  ) : null;
}

export function Peek() {
  const [params, setParams] = useSearchParams();
  // an empty ?peek= is no peek
  const asked = params.get("peek");
  const key = asked === "" ? null : asked;
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
      // keyed by the ticket: a draft is one ticket's
      bar={key ? <Bar ticketKey={key} onClose={close} /> : null}
      foot={key ? <Reply key={key} ticketKey={key} /> : null}
    >
      {key ? <Loaded ticketKey={key} me={me} now={now} /> : null}
    </Dialog>
  );
}

// The peek (`?peek=KEY`, over any view): the ticket's head as the ticket page draws it (its title and
// lead, its properties, the stepper with what happens now under it), its conversation, then its
// plan, with the reply box pinned at the panel's foot, without leaving the list. It never carries
// gate actions; those live on the row and the ticket. The run's Cancel sits on the run's own line,
// as on the ticket page.
import { useState } from "react";
import { useSearchParams } from "react-router";

import { loadOf, useMessages, usePlan, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { parsePlan } from "../../domain/plan";
import { Button, Composer, Dialog, Icon, Section, Stack, Text, Thread } from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { PlanSection, TalkSection, TicketHead } from "../../patterns/ticketHead";
import { CancelButton } from "../shared/Actions";
import { threadMessage, useBoard } from "../shared/board";
import { TicketMenu } from "../shared/TicketMenu";

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
        <TicketHead {...props} plan={plan} place="peek" stop={<CancelButton t={props.t} />} />
      </Section>
      <Talk t={props.t} me={props.me} />
      <PlanSection plan={plan} place="peek" />
    </>
  );
}

function Loaded({ ticketKey, ...rest }: Omit<BodyProps, "t"> & { ticketKey: string }) {
  const ticket = loadOf(useTicket(ticketKey));
  if (ticket.kind === "ready") return <Body t={ticket.data} {...rest} />;
  return (
    <Section label={ticketKey}>
      <LoadNotice load={ticket} noun="ticket" id={ticketKey} />
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

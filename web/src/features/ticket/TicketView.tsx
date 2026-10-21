// The ticket page (/t/:key), as Linear's issue page: the bar (My queue › the key, the crumb the way
// back; search; the ticket's actions), then one calm column with no cards (the title and lead, the
// properties, the workflow's stepper with what happens now under it, the tabs) and Talk in the
// column beside it, its reply box at the window's foot. W0 draws Overview; the other tabs arrive with their tickets (W5 runs, W6 context, W7
// workflow).
import { useState } from "react";
import { useParams } from "react-router";

import { useItems, useMessages, usePeople, usePlan, useRuns, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { stageModel } from "../../domain/board";
import { firstName } from "../../domain/format";
import { parsePlan, type PlanItem } from "../../domain/plan";
import {
  Badge,
  Checklist,
  Notice,
  Page,
  Select,
  Stack,
  Stepper,
  Tabs,
  Text,
  Thread,
} from "../../kit";
import { ActionButton, headerActions } from "../shared/Actions";
import { threadMessage, useBoard } from "../shared/board";
import { useSearch } from "../shared/useSearch";
import { Now } from "./now";
import { Properties } from "./properties";
import { TalkHead } from "./talk";

/** The owner, as a picker in its chip. */
function Owner({ t }: { t: Ticket }) {
  const people = usePeople().data ?? [];
  const [owner, setOwner] = useState(t.owner ? String(t.owner.id) : "");
  return (
    <Select
      label="Owner"
      value={owner}
      options={[
        { id: "", label: "Unassigned" },
        ...people.map((p) => ({ id: String(p.id), label: p.name, face: true })),
      ]}
      onChange={setOwner}
    />
  );
}

interface HeaderProps {
  t: Ticket;
  me: Person | null;
  now: number;
  plan: readonly PlanItem[];
}

function Header({ t, me, now, plan }: HeaderProps) {
  const lead = t.description.split("\n\n")[0] ?? "";
  return (
    <Stack gap={10}>
      <Stack gap={5}>
        <Text variant="display" as="h1">
          {t.title}
        </Text>
        <Text variant="body" as="p">
          {lead}
        </Text>
      </Stack>
      <Properties t={t} now={now} owner={<Owner t={t} />} />
      <Stepper
        model={stageModel(t, me)}
        look="steps"
        now={<Now t={t} me={me} now={now} plan={plan} />}
      />
    </Stack>
  );
}
function Overview({
  t,
  plan,
  items,
}: {
  t: Ticket;
  plan: readonly PlanItem[];
  items: readonly string[];
}) {
  const rest = t.description.split("\n\n").slice(1);
  const done = plan.filter((i) => i.done).length;
  return (
    <Stack gap={10}>
      {rest.map((p, i) => (
        <Text key={i} variant="body" as="p">
          {p}
        </Text>
      ))}
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
          <Checklist items={plan} look="page" />
        ) : (
          <Text tone="3">No plan yet.</Text>
        )}
      </Stack>
      <Stack gap={5}>
        <Text variant="heading" as="h2">
          The agent reads
        </Text>
        <Stack dir="row" gap={3} wrap>
          {items.map((name) => (
            <Badge key={name} kind="tag" tone="quiet">
              {name}
            </Badge>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

/** Talk, in the column beside the page: who is in it, the thread, and the reply box at its foot. */
function Talk({ t, me }: { t: Ticket; me: Person | null }) {
  const messages = useMessages(t.key).data?.items ?? [];
  const people = [...new Map(messages.map((m) => [m.author.id, m.author])).values()];
  const others = people.filter((p) => p.id !== me?.id).map((p) => firstName(p.name));
  return (
    <Stack gap={9} grow>
      <TalkHead people={people} />
      <Thread
        messages={messages.map((m) => threadMessage(m, me))}
        compose={others.length > 0 ? `Say something to ${others.join(" and ")}` : "Say something"}
      />
    </Stack>
  );
}

function Body({ t, me, now }: { t: Ticket; me: Person | null; now: number }) {
  const plan = parsePlan(usePlan(t.key).data ?? "");
  const runs = useRuns(t.key).data?.items ?? [];
  const items = useItems(t.key).data?.items ?? [];
  const [tab, setTab] = useState("overview");
  return (
    <Stack gap={10}>
      <Header t={t} me={me} now={now} plan={plan} />
      <Tabs
        label="Ticket sections"
        value={tab}
        onChange={setTab}
        items={[
          { id: "overview", label: "Overview" },
          { id: "runs", label: "Runs", count: runs.length },
          { id: "context", label: "Context", count: items.length },
          { id: "workflow", label: "Workflow" },
        ]}
      >
        {tab === "overview" ? (
          <Overview t={t} plan={plan} items={items.map((i) => i.name)} />
        ) : (
          <Notice kind="status">This tab arrives with its own ticket.</Notice>
        )}
      </Tabs>
    </Stack>
  );
}

export function TicketView() {
  const { key = "" } = useParams();
  const ticket = useTicket(key);
  const { me, now } = useBoard();
  const { search } = useSearch();
  const t = ticket.data;
  return (
    <Page
      title={[{ label: "My queue", href: "/" }, key]}
      search={search}
      {...(t
        ? {
            action: headerActions(t.actions.filter((a) => a.id !== "cancel")).map((a) => (
              <ActionButton key={a.id} action={a} size="md" header />
            )),
            side: <Talk t={t} me={me} />,
          }
        : {})}
    >
      {t ? (
        <Body t={t} me={me} now={now} />
      ) : (
        <Notice kind="status" error={ticket.isError}>
          {ticket.isError ? `Ticket not found · ${key}` : `Loading ${key}`}
        </Notice>
      )}
    </Page>
  );
}

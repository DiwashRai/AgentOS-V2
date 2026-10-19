// The ticket page (/t/:key): the header (kicker, actions, title, facts, the workflow's stepper),
// the band that says what happens now, the tabs, and Talk beside it all. W0 draws Overview; the
// other tabs arrive with their tickets (W5 runs, W6 context, W7 workflow).
import { useState } from "react";
import { useParams } from "react-router";

import { useItems, useMessages, usePeople, usePlan, useRuns, useTicket } from "../../api/queries";
import type { Person, Ticket } from "../../api/types";
import { markOf, stageModel, stagesText, stepText } from "../../domain/board";
import { age, elapsed, firstName, repoShort } from "../../domain/format";
import { parsePlan, type PlanItem } from "../../domain/plan";
import {
  Avatar,
  Badge,
  Button,
  Checklist,
  Facts,
  Icon,
  Mark,
  Meter,
  Notice,
  Page,
  Select,
  Stack,
  Stepper,
  Surface,
  Tabs,
  Text,
  Thread,
} from "../../kit";
import { ActionButton, headerActions } from "../shared/Actions";
import { threadMessage, useBoard, useSpace } from "../shared/board";
import { useSearch } from "../shared/useSearch";

const TYPE_WORD = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
} as const;
const FROM = { hand: "set by hand", jira: "from Jira", repo: "from the repo" } as const;

function Header({ t, me, now }: { t: Ticket; me: Person | null; now: number }) {
  const people = usePeople().data ?? [];
  const [owner, setOwner] = useState(t.owner ? String(t.owner.id) : "");
  const lead = t.description.split("\n\n")[0] ?? "";

  return (
    <Stack gap={6}>
      <Stack dir="row" gap={8} justify="between" align="start">
        <Stack dir="row" gap={3} align="center" wrap>
          <Badge kind="key" size="lg">
            {t.key}
          </Badge>
          {t.source ? <Badge kind="tag">{`Jira ${t.source.ref} ↗`}</Badge> : null}
          <Badge kind="tag">
            <Icon name={t.type} />
            {TYPE_WORD[t.type]}
          </Badge>
          {t.priority === "high" ? (
            <Badge kind="tag" tone="blocked">
              <Icon name="high" />
              High
            </Badge>
          ) : null}
          {t.repo ? (
            <Badge kind="tag" tone="quiet">
              {repoShort(t.repo)}
            </Badge>
          ) : null}
        </Stack>
        <Stack dir="row" gap={4} align="center">
          {headerActions(t.actions).map((a) => (
            <ActionButton key={a.id} action={a} size="md" header />
          ))}
        </Stack>
      </Stack>
      <Text variant="display" as="h1">
        {t.title}
      </Text>
      <Text variant="body" as="p">
        {lead}
      </Text>
      <Facts
        items={[
          {
            label: "Owner",
            value: (
              <Select
                label="Owner"
                value={owner}
                options={[
                  { id: "", label: "Unassigned" },
                  ...people.map((p) => ({ id: String(p.id), label: p.name, face: true })),
                ]}
                onChange={setOwner}
              />
            ),
          },
          { label: "Repo", value: t.repo ? repoShort(t.repo) : "No repo" },
          ...(t.base_branch
            ? [
                {
                  label: "Base branch",
                  value: `${t.base_branch.name} · ${FROM[t.base_branch.from]}`,
                },
              ]
            : []),
          { label: "Opened", value: `${age(t.created_at, now)} ago` },
          {
            label: "Workflow",
            value: `${t.workflow.name} v${String(t.workflow.version)} · ${stagesText(t)}`,
          },
        ]}
      />
      <Stepper model={stageModel(t, me)} look="steps" />
    </Stack>
  );
}

/** What happens now: the live run with its steps, or the ticket's state. */
function Band({
  t,
  me,
  now,
  plan,
}: {
  t: Ticket;
  me: Person | null;
  now: number;
  plan: readonly PlanItem[];
}) {
  const a = t.attention;
  if (a.kind === "running") {
    return (
      <Surface level="sheet" pad={7}>
        <Stack gap={6}>
          <Stack dir="row" gap={5} align="center">
            <Mark kind="run" name={`${a.agent} · run #${String(a.run_id)}`} />
            <Text tone="2">{a.step}</Text>
            {a.progress ? (
              <Text variant="meta" tabular>
                {stepText(a.progress)}
              </Text>
            ) : null}
            <Text variant="meta" tabular>
              {elapsed(t.since, now)}
            </Text>
            <Stack grow />
            <Button variant="link">Log →</Button>
          </Stack>
          {a.progress ? (
            <Meter
              size="strip"
              done={a.progress.done}
              total={a.progress.total}
              {...(plan.length === a.progress.total ? { names: plan.map((i) => i.text) } : {})}
            />
          ) : null}
        </Stack>
      </Surface>
    );
  }
  return (
    <Surface level="sheet" pad={7}>
      <Stack dir="row" gap={5} align="center">
        <Mark {...markOf(a, me)} />
        <Text tone="2">{a.kind === "blocked" ? a.reason : t.now}</Text>
      </Stack>
    </Surface>
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
    <Stack gap={9}>
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
        {plan.length > 0 ? <Checklist items={plan} /> : <Text tone="3">No plan yet.</Text>}
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

function Talk({ t, me }: { t: Ticket; me: Person | null }) {
  const messages = useMessages(t.key).data?.items ?? [];
  const people = [...new Map(messages.map((m) => [m.author.id, m.author])).values()];
  return (
    <Surface level="sheet" fill pad={7}>
      <Stack gap={7} grow>
        <Stack dir="row" gap={4} align="center">
          <Text variant="heading" as="h2">
            Talk
          </Text>
          <Avatar people={people.map((p) => ({ name: p.name, seed: String(p.id) }))} />
          <Stack grow />
          <Text variant="meta">Just people here. Agents don&apos;t read this.</Text>
        </Stack>
        <Thread
          messages={messages.map((m) => threadMessage(m, me))}
          compose={`Say something to ${people
            .filter((p) => p.id !== me?.id)
            .map((p) => firstName(p.name))
            .join(" and ")}`}
        />
      </Stack>
    </Surface>
  );
}

function Body({ t, me, now }: { t: Ticket; me: Person | null; now: number }) {
  const plan = parsePlan(usePlan(t.key).data ?? "");
  const runs = useRuns(t.key).data?.items ?? [];
  const items = useItems(t.key).data?.items ?? [];
  const [tab, setTab] = useState("overview");
  return (
    <Stack gap={8}>
      <Header t={t} me={me} now={now} />
      <Band t={t} me={me} now={now} plan={plan} />
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
  const space = useSpace();
  const { search } = useSearch();
  const t = ticket.data;
  return (
    <Page
      title="Ticket"
      context={space}
      middle={<Text variant="code">{key}</Text>}
      search={search}
      action={<Button icon="close" title="Back to My queue" href="/" />}
      {...(t ? { side: <Talk t={t} me={me} /> } : {})}
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

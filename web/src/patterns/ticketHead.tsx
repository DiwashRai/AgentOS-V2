// A ticket's head, as the ticket page and the peek draw it (Linear's project page): the title and
// its lead, the labelled property rows under them (what it is, where its code lives, how it runs),
// then the run card, the workflow's stepper with what happens now at its foot; and its Plan and Talk
// sections. The page's title is its h1, the peek's an h2 under the panel's bar. What reads the
// session or edits comes in drawn: the owner's picker (the page's; the peek says the owner), the
// run's Cancel.
import type { ReactNode } from "react";

import type { Person, Ticket } from "../api/types";
import { markOf, stageModel, stagesText, stepText } from "../domain/board";
import { ago, elapsed, fromPerson, paragraphs } from "../domain/format";
import type { PlanItem } from "../domain/plan";
import {
  Avatar,
  Button,
  Checklist,
  type ChecklistProps,
  type Fact,
  Facts,
  Mark,
  Meter,
  Section,
  Stack,
  Stepper,
  Text,
} from "../kit";
import { Who } from "./who";

/** Where the head stands: the ticket page, or the peek over a list. */
type Place = "page" | "peek";

const TYPE_WORD = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
} as const;
const FROM = { hand: "set by hand", jira: "from Jira", repo: "from the repo" } as const;

interface Row {
  label: string;
  items: Fact[];
}

/** The property rows, as Linear lists a project's: chips of a muted icon and the value at body
 *  size. The owner is a picker where one is given, else the owner's name. */
function rows(t: Ticket, now: number, owner: ReactNode | undefined): Row[] {
  const what: Fact[] = [
    { label: "Type", icon: t.type, value: TYPE_WORD[t.type] },
    ...(t.priority === "high" ? [{ label: "Priority", icon: "high" as const, value: "High" }] : []),
    owner === undefined
      ? { label: "Owner", value: <Who who={fromPerson(t.owner)} place="fact" /> }
      : { label: "Owner", picker: owner },
    { label: "Opened", icon: "clock", value: "Opened", note: ago(t.created_at, now) },
  ];
  const code: Fact[] = [
    { label: "Repo", icon: "repo", value: t.repo ?? "No repo" },
    ...(t.base_branch
      ? [
          {
            label: "Base branch",
            icon: "branch" as const,
            value: t.base_branch.name,
            note: FROM[t.base_branch.from],
          },
        ]
      : []),
    ...(t.source ? [{ label: "Jira", value: `Jira ${t.source.ref} ↗` }] : []),
  ];
  return [
    { label: "Properties", items: what },
    { label: "Code", items: code },
    {
      label: "Workflow",
      items: [
        {
          label: "Workflow",
          icon: "workflow",
          value: `${t.workflow.name} v${String(t.workflow.version)}`,
          note: stagesText(t),
        },
      ],
    },
  ];
}

interface NowProps {
  t: Ticket;
  me: Person | null;
  now: number;
  plan: readonly PlanItem[];
  stop: ReactNode;
}

/** What happens now, as the run card's foot: the live run on one line (who, its run, its step, how
 *  long; its log and its Cancel on the right) with the plan step it is on under it, or the ticket's
 *  state (a gate's ask, a blocked reason) when nothing runs. One type size and regular weight
 *  throughout, so the run reads as one object; its glyph is its colour. */
function Now({ t, me, now, plan, stop }: NowProps) {
  const a = t.attention;
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
        <Mark kind="run" glyph name="Running" progress={p ?? null} />
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

interface TicketHeadProps extends NowProps {
  place: Place;
  /** The owner's picker (the page's); without one the head says who owns it. */
  owner?: ReactNode;
}

export function TicketHead({ t, me, now, plan, stop, place, owner }: TicketHeadProps) {
  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <Text variant="display" as={place === "page" ? "h1" : "h2"}>
          {t.title}
        </Text>
        <Text variant="body" as="p">
          {paragraphs(t.description).lead}
        </Text>
      </Stack>
      <Stack>
        {rows(t, now, owner).map((r) => (
          <Facts key={r.label} label={r.label} items={r.items} />
        ))}
      </Stack>
      <Stepper
        model={stageModel(t, me)}
        now={<Now t={t} me={me} now={now} plan={plan} stop={stop} />}
      />
    </Stack>
  );
}

/** Where the ticket is seen chooses the plan's rows: the page's at body size, the peek's shorter so
 *  its conversation fits beside it. */
const PLAN_LOOK = { page: "page", peek: "peek" } as const satisfies Record<
  Place,
  ChecklistProps["look"]
>;

/** The ticket's plan (TASKS.md): how much of it is done after its name (Linear's sub-issues: a pie
 *  as far as it is, then the count), then its items, or a quiet line while there is none. */
export function PlanSection({ plan, place }: { plan: readonly PlanItem[]; place: Place }) {
  const done = plan.filter((i) => i.done).length;
  const aside = (
    <>
      <Mark
        kind={done === plan.length ? "done" : "run"}
        glyph
        small
        name={false}
        progress={{ done, total: plan.length }}
      />
      {`${String(done)}/${String(plan.length)}`}
    </>
  );
  return (
    <Section title="Plan" {...(plan.length > 0 ? { aside } : {})}>
      {plan.length > 0 ? (
        <Checklist items={plan} look={PLAN_LOOK[place]} />
      ) : (
        <Text tone="3">No plan yet.</Text>
      )}
    </Section>
  );
}

/** Talk: its name and who is in it on one line, what it is for under them, then the conversation. */
export function TalkSection({
  people,
  children,
}: {
  people: readonly Person[];
  children: ReactNode;
}) {
  return (
    <Section
      title="Talk"
      note="Just people here. Agents don't read this."
      end={
        <Avatar size="talk" people={people.map((p) => ({ name: p.name, seed: String(p.id) }))} />
      }
    >
      {children}
    </Section>
  );
}

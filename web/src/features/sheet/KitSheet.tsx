// The kit sheet (/kit): every component in every variant, in the current theme. It is built from
// the kit like any screen, and screenshotted in both themes. Not a screen: the reuse count skips it.
import { type ReactNode, useState } from "react";

import {
  Age,
  Avatar,
  Badge,
  Button,
  Checklist,
  type Column,
  Facts,
  Head,
  Icon,
  type IconName,
  Mark,
  type MarkKind,
  Meter,
  Notice,
  Page,
  Row,
  Segmented,
  Select,
  Stack,
  Stepper,
  type StepperModel,
  Surface,
  Table,
  Tabs,
  Text,
  type TextVariant,
  Thread,
} from "../../kit";

const ICONS: readonly IconName[] = [
  "teams",
  "queue",
  "compact",
  "intake",
  "settings",
  "theme",
  "search",
  "arrow",
  "check",
  "plus",
  "close",
  "chevron",
  "out",
  "high",
  "low",
  "normal",
  "tick",
  "tick-sm",
  "feature",
  "bug",
  "improvement",
  "task",
];
const MARKS: readonly MarkKind[] = [
  "run",
  "wait",
  "you",
  "blk",
  "done",
  "abandoned",
  "queued",
  "idle",
];
const TEXTS: readonly TextVariant[] = [
  "display",
  "title",
  "heading",
  "body",
  "label",
  "ui",
  "meta",
  "code",
];

const stages = (
  at: number,
  gate: "pending" | "passed" | "waiting" | "you",
): StepperModel["stages"] =>
  ["Inbox", "Plan", "Implement", "Lint", "Review", "Open a PR", "Done"].map((name, i) => ({
    name,
    state: name === "Lint" ? "skipped" : i < at ? "done" : i === at ? "current" : "upcoming",
    ...(name === "Plan"
      ? { gate: { label: "Plan sign-off", short: "Sign-off", state: gate, person: "Bea" } }
      : {}),
  }));

const MODELS: readonly { label: string; model: StepperModel }[] = [
  {
    label: "Parked on you",
    model: {
      stages: stages(1, "you").map((s, i) => (i === 1 ? { ...s, state: "done" } : s)),
      label: "Sign-off",
      live: false,
      closed: false,
    },
  },
  {
    label: "Running",
    model: { stages: stages(2, "passed"), label: "Implement", live: true, closed: false },
  },
  {
    label: "Review loop",
    model: {
      stages: stages(4, "passed").map((s) =>
        s.name === "Review" ? { ...s, round: { n: 2, of: 3 } } : s,
      ),
      label: "Review",
      round: { n: 2, of: 3 },
      live: true,
      closed: false,
    },
  },
  {
    label: "Blocked",
    model: {
      stages: stages(2, "passed").map((s) =>
        s.name === "Implement" ? { ...s, state: "failed" } : s,
      ),
      label: "Implement",
      live: false,
      closed: false,
    },
  },
  {
    label: "Done",
    model: { stages: stages(6, "passed"), label: "Done", live: false, closed: false },
  },
];

const COLUMNS: readonly Column[] = [
  { label: "Ref", width: "sm" },
  { label: "Ticket", width: "fill" },
  { label: "Upd", width: "xs", end: true },
];

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Stack gap={5}>
      <Head level="zone" name={name} />
      {children}
    </Stack>
  );
}

export function KitSheet() {
  const [pill, setPill] = useState("all");
  const [owner, setOwner] = useState("1");
  const [tab, setTab] = useState("one");
  return (
    <Page title="Kit" context="Every component, every variant">
      <Surface pad={9}>
        <Stack gap={9}>
          <Section name="Text">
            {TEXTS.map((v) => (
              <Text key={v} variant={v}>{`${v} · The quick brown fox`}</Text>
            ))}
            <Stack dir="row" gap={6} wrap>
              {(["1", "2", "3", "you", "done", "blocked", "live"] as const).map((tone) => (
                <Text key={tone} tone={tone} weight={600}>
                  {tone}
                </Text>
              ))}
            </Stack>
          </Section>
          <Section name="Icon">
            <Stack dir="row" gap={6} wrap align="center">
              {ICONS.map((name) => (
                <Icon key={name} name={name} label={name} />
              ))}
            </Stack>
          </Section>
          <Section name="Badge">
            <Stack dir="row" gap={4} wrap align="center">
              <Badge kind="key" size="sm">
                NW
              </Badge>
              <Badge kind="key">{"NW-14"}</Badge>
              <Badge kind="key" size="lg">
                SUP-231
              </Badge>
              <Badge kind="key" href="https://northwind.atlassian.example/browse/SUP-252">
                SUP-252
              </Badge>
              <Badge kind="count">{3}</Badge>
              <Badge kind="count" tone="you">
                {2}
              </Badge>
              <Badge kind="count" tone="done">
                {5}
              </Badge>
              <Badge kind="kbd">Esc</Badge>
              <Badge kind="tag">Bug</Badge>
              <Badge kind="tag" tone="blocked">
                High
              </Badge>
              <Badge kind="tag" tone="quiet">
                web
              </Badge>
              <Badge kind="status">In Progress</Badge>
              <Badge kind="you" />
            </Stack>
          </Section>
          <Section name="Mark">
            <Stack dir="row" gap={8} wrap>
              {MARKS.map((kind) => (
                <Mark key={kind} kind={kind} name={kind} ask="ask" />
              ))}
            </Stack>
            <Stack dir="row" gap={6}>
              {MARKS.map((kind) => (
                <Mark key={kind} kind={kind} glyph small />
              ))}
            </Stack>
          </Section>
          <Section name="Button">
            <Stack dir="row" gap={4} wrap align="center">
              {(["default", "ink", "you", "accent", "quiet", "lit", "link"] as const).map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
              <Button blocked="Why it can't">blocked</Button>
              <Button icon="close" title="Close" />
            </Stack>
            <Stack dir="row" gap={4} align="center">
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </Stack>
          </Section>
          <Section name="Avatar and Age">
            <Stack dir="row" gap={6} align="center">
              <Avatar name="Ada Park" seed="1" />
              <Avatar name="Bea Quinn" seed="2" size="talk" />
              <Avatar name="Cy Rowe" seed="3" size="lg" />
              <Avatar dashed />
              <Avatar
                people={[
                  { name: "Ada Park", seed: "1" },
                  { name: "Bea Quinn", seed: "2" },
                  { name: "Dee Sato", seed: "4" },
                ]}
              />
              <Age text="3h 10m" />
              <Age text="38m" strong />
              <Age text="now" />
            </Stack>
          </Section>
          <Section name="Stepper and Meter">
            {MODELS.map(({ label, model }) => (
              <Stack key={label} dir="row" gap={9} align="center">
                <Text variant="meta">{label}</Text>
                <Stepper model={model} />
              </Stack>
            ))}
            <Stepper
              model={MODELS[1]?.model ?? { stages: [], label: "", live: false, closed: false }}
              look="steps"
            />
            <Stepper
              model={MODELS[0]?.model ?? { stages: [], label: "", live: false, closed: false }}
              look="steps"
              compact
            />
            <Meter done={2} total={5} />
            <Stack dir="row" gap={6} align="center">
              <Meter size="row" done={1} total={4} />
            </Stack>
            <Meter
              size="strip"
              done={2}
              total={4}
              names={["Read the ticket", "Write the test", "Make it pass", "Open the PR"]}
            />
          </Section>
          <Section name="Table, Head, Row, Notice">
            <Table columns={COLUMNS} scroll={false}>
              <Head
                name="Group"
                count={3}
                icon={<Mark kind="run" glyph small />}
                summary="summary"
                fold={{ open: true, toggle: () => undefined }}
              />
              <Row edge="live">
                <Badge kind="key">{"NW-17"}</Badge>
                <Text variant="label">A raised line</Text>
                <Age text="now" />
              </Row>
              <Row look="you" edge="you">
                <Badge kind="key">{"NW-14"}</Badge>
                <Text variant="label" weight={600}>
                  Needs you
                </Text>
                <Age text="3h 10m" />
              </Row>
              <Row look="flat" edge="done" alert="An alert under the row">
                <Badge kind="key">{"NW-5"}</Badge>
                <Text variant="label" tone="2">
                  A settled line
                </Text>
                <Age text="1d" />
              </Row>
              <Notice kind="more" lead="+3 more" />
              <Notice kind="empty" lead="All quiet">
                nothing here
              </Notice>
              <Notice kind="problem" lead="Jira didn't answer">
                The query failed.
              </Notice>
              <Notice kind="status">Loading</Notice>
              <Notice kind="status" error>
                Can&apos;t reach the server
              </Notice>
            </Table>
          </Section>
          <Section name="Controls">
            <Stack dir="row" gap={8} align="center" wrap>
              <Segmented
                label="Filter"
                value={pill}
                onChange={setPill}
                items={[
                  { id: "all", label: "Everything", count: 18 },
                  { id: "you", label: "Needs you", count: 2, mark: "you" },
                  { id: "run", label: "Running", count: 0, mark: "run" },
                ]}
              />
              <Select
                label="Owner"
                value={owner}
                onChange={setOwner}
                options={[
                  { id: "1", label: "Ada Park", face: true },
                  { id: "2", label: "Bea Quinn", face: true },
                ]}
              />
              <Select
                label="Owner"
                value={owner}
                onChange={setOwner}
                options={[
                  { id: "1", label: "Ada Park" },
                  { id: "2", label: "Bea Quinn" },
                ]}
              />
            </Stack>
            <Tabs
              label="Sections"
              value={tab}
              onChange={setTab}
              items={[
                { id: "one", label: "Overview" },
                { id: "two", label: "Runs", count: 2 },
              ]}
            >
              <Text tone="2">{`The ${tab} panel`}</Text>
            </Tabs>
          </Section>
          <Section name="Checklist, Facts, Thread">
            <Checklist
              items={[
                { text: "Write it", done: true, section: "Server" },
                { text: "Test it", done: false },
              ]}
              more={2}
            />
            <Facts
              items={[
                { label: "Owner", value: "Ada" },
                { label: "Workflow", value: "Standard v3" },
              ]}
            />
            <Surface level="sheet" pad={7}>
              <Thread
                compose="Say something"
                messages={[
                  {
                    id: 1,
                    name: "Bea Quinn",
                    seed: "2",
                    at: "10:02",
                    full: "",
                    body: "A message from someone else.",
                    mine: false,
                  },
                  {
                    id: 2,
                    name: "Ada Park",
                    seed: "1",
                    at: "10:48",
                    full: "",
                    body: "One of mine.",
                    mine: true,
                  },
                ]}
              />
            </Surface>
          </Section>
        </Stack>
      </Surface>
    </Page>
  );
}

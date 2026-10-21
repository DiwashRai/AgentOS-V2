// The kit sheet (/kit): every component in every variant, in the current theme. It is built from
// the kit like any screen, and screenshotted in both themes. Not a screen: the reuse count skips it.
import { type ReactNode, useState } from "react";

import {
  Age,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Checklist,
  Chip,
  Composer,
  type Column,
  Dialog,
  Drag,
  Drop,
  Facts,
  Field,
  FormRow,
  Head,
  Icon,
  type IconName,
  Lane,
  Mark,
  type MarkKind,
  Menu,
  Meter,
  Notice,
  NumberField,
  Override,
  Page,
  Radio,
  Row,
  Section,
  Segmented,
  Select,
  Sortable,
  Stack,
  Stepper,
  type StepperModel,
  Surface,
  Table,
  Tabs,
  Text,
  TextArea,
  type TextVariant,
  Thread,
  Toggle,
  useToast,
} from "../../kit";
import { STATE_WORD } from "../../domain/board";

const ICONS: readonly IconName[] = [
  "teams",
  "queue",
  "compact",
  "intake",
  "settings",
  "workflows",
  "agents",
  "skills",
  "files",
  "theme",
  "search",
  "arrow",
  "check",
  "plus",
  "minus",
  "grip",
  "undo",
  "redo",
  "loop",
  "shell",
  "gate",
  "close",
  "more",
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
const TEXTS: readonly TextVariant[] = ["display", "heading", "body", "label", "ui", "meta", "code"];

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
      live: false,
      closed: false,
    },
  },
  {
    label: "Running",
    model: { stages: stages(2, "passed"), live: true, closed: false },
  },
  {
    label: "Review loop",
    model: {
      stages: stages(4, "passed").map((s) =>
        s.name === "Review" ? { ...s, round: { n: 2, of: 3 } } : s,
      ),
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
      live: false,
      closed: false,
    },
  },
  {
    label: "Done",
    model: { stages: stages(6, "passed"), live: false, closed: false },
  },
];

const COLUMNS: readonly Column[] = [
  { label: "Ref", width: "sm" },
  { label: "Ticket", width: "fill" },
  { label: "Upd", width: "xs", end: true },
];

/** The form pieces in a card's settings: a field, a picker, a number, a switch, markdown. */
function FormSheet() {
  const [name, setName] = useState("Implement");
  const [command, setCommand] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [resume, setResume] = useState(true);
  const [prompt, setPrompt] = useState(
    "Work through TASKS.md for {{ ticket.key }}, one step per commit.\n\nFix what {{ verdict.note }} says first.",
  );
  return (
    <Stack gap={4}>
      <FormRow label="Name">
        <Field label="Name" value={name} onChange={setName} />
      </FormRow>
      <FormRow label="Command">
        <Field
          label="Command"
          value={command}
          onChange={setCommand}
          placeholder="npm run lint"
          mono
        />
      </FormRow>
      <FormRow label="Timeout" note="the agent's is 30">
        <NumberField
          label="Timeout"
          value={minutes}
          onChange={setMinutes}
          min={1}
          max={240}
          unit="min"
        />
      </FormRow>
      <FormRow label="Resume session">
        <Toggle label="Resume session" on={resume} onChange={setResume} />
      </FormRow>
      <FormRow label="Prompt" problem="No field verdict.note: did you mean verdict.notes?">
        <TextArea label="Prompt" value={prompt} onChange={setPrompt} lines={4} />
      </FormRow>
    </Stack>
  );
}

/** Choices said in words (the admin's intake settings, W8): how intake takes issues in, and a
 *  query's own say. */
function ChoiceSheet() {
  const [how, setHow] = useState("ask");
  const [auto, setAuto] = useState(false);
  return (
    <Stack gap={8}>
      <FormRow label="Intake">
        <Radio
          label="Intake"
          value={how}
          onChange={setHow}
          options={[
            {
              id: "ask",
              label: "Ask first",
              note: "Issues wait on Intake until someone takes them in.",
            },
            {
              id: "all",
              label: "Take everything in",
              note: "New issues go straight to the Inbox.",
            },
          ]}
        />
      </FormRow>
      <Checkbox
        label="Take in Platform backlog by itself"
        note="Its new issues skip Intake and go to the Inbox."
        checked={auto}
        onChange={setAuto}
      />
    </Stack>
  );
}

/** A "…" menu, and a toast said by an action. */
function MenuSheet() {
  const say = useToast();
  return (
    <Stack dir="row" gap={4} align="center">
      <Button
        onClick={() => {
          say("Copied the link to NW-17");
        }}
      >
        Say something happened
      </Button>
      <Menu
        label="More on NW-17"
        groups={[
          [
            { label: "Copy link", run: () => undefined },
            { label: "Copy key", run: () => undefined },
          ],
          [{ label: "Open NW-17 in Jira", href: "https://jira.example.com/browse/NW-17" }],
        ]}
      />
      <Menu label="More, small" size="sm" groups={[[{ label: "Open ticket", href: "/t/NW-17" }]]} />
    </Stack>
  );
}

const STAGE_NAMES = ["Plan", "Implement", "Lint", "Review", "Open a PR"];

/** Drag and drop: a palette of cards, a target that takes skills, and a list to reorder. */
function DragSheet() {
  const [order, setOrder] = useState(STAGE_NAMES);
  const [got, setGot] = useState<readonly string[]>([]);
  const add = (id: string) => {
    setGot((g) => [...g, id]);
  };
  return (
    <Stack dir="row" gap={9} align="start">
      <Stack gap={4}>
        {["tests", "review"].map((id) => (
          <Drag
            key={id}
            payload={{ kind: "skill", id }}
            label={`Skill ${id}: drag onto a target, or click to add it`}
            onClick={() => {
              add(id);
            }}
          >
            <Text weight={500}>{id}</Text>
          </Drag>
        ))}
      </Stack>
      <Stack gap={6} grow>
        <Drop
          accept={["skill"]}
          onDrop={(p) => {
            add(p.id);
          }}
          label="Add to Implement"
        >
          <Surface level="sheet" pad={6}>
            <Text tone="2">{got.length ? got.join(", ") : "Drop a skill here"}</Text>
          </Surface>
        </Drop>
        <Drop accept={["skill"]} onDrop={() => undefined} label="Add to every stage" over>
          <Surface level="sheet" pad={6}>
            <Text tone="2">A target drawn as under a drag</Text>
          </Surface>
        </Drop>
      </Stack>
      <Stack grow>
        <Sortable
          label="Stages"
          gap={3}
          preview={2}
          onMove={(from, to) => {
            setOrder((o) => {
              const next = [...o];
              next.splice(to, 0, ...next.splice(from, 1));
              return next;
            });
          }}
          items={order.map((n) => ({
            id: n,
            label: n,
            content: (
              <Surface level="sheet" pad={5}>
                <Text weight={500}>{n}</Text>
              </Surface>
            ),
          }))}
        />
      </Stack>
    </Stack>
  );
}

/** A lane while editing (a gate, a loop, a selected card, a problem, a still of the drop line)
 *  beside the same lane read only. */
function LaneSheet() {
  const [open, setOpen] = useState<string | null>("build");
  const [gates, setGates] = useState<readonly boolean[]>([true, false, false]);
  const names = ["Plan", "Build", "Check"];
  const card = (name: string, edit: boolean) => (
    <Card
      label={name}
      face={<Avatar name={name} seed={name} />}
      off={name === "Check" && !edit}
      {...(edit && name === "Check" ? { problem: "A gate inside a loop" } : {})}
      {...(edit
        ? {
            onOpen: () => {
              setOpen(open === name.toLowerCase() ? null : name.toLowerCase());
            },
          }
        : {})}
      open={edit && open === name.toLowerCase() ? <Text tone="2">Its settings</Text> : undefined}
    >
      <Stack gap={3}>
        <Text variant="label">{name}</Text>
        {name === "Build" ? <Override value="xhigh" own="high" /> : null}
        <Stack dir="row" gap={3}>
          <Chip label="tests" lead="skills" />
          {edit ? <Chip label="AGENTS.md" lead="files" onRemove={() => undefined} /> : null}
        </Stack>
      </Stack>
    </Card>
  );
  const lane = (edit: boolean) => (
    <Lane
      label="Stages"
      stages={names.map((n, i) => ({
        id: n.toLowerCase(),
        label: n,
        content: card(n, edit),
        gate: gates[i] ? `${n} sign-off` : null,
        // Build is inside the loop: the sheet says the workflow's rule, as the editor's model does
        ...(n === "Build" ? { noGate: "Gates go after a loop's last stage" } : {}),
      }))}
      loops={[{ first: "build", last: "check", foot: <Text variant="meta">Up to 3 rounds</Text> }]}
      {...(edit
        ? {
            edit: {
              onMove: () => undefined,
              onGate: (i: number) => {
                setGates((g) => g.map((x, k) => (k === i ? !x : x)));
              },
              onInsert: () => undefined,
              accept: ["agent"],
              onDrop: () => undefined,
              preview: 1,
            },
          }
        : {})}
    />
  );
  return (
    <Stack dir="row" gap={9} align="start">
      <Stack grow>{lane(true)}</Stack>
      <Stack grow>{lane(false)}</Stack>
    </Stack>
  );
}

/** The full-window overlay, with its close question. */
function OverlaySheet() {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Open the full-window overlay
      </Button>
      <Dialog
        look="full"
        label="A full-window editor"
        open={open}
        onClose={() => {
          setAsking(!asking);
        }}
        ask={
          asking
            ? {
                question: "Discard your changes?",
                note: "Closing now loses them.",
                actions: (
                  <>
                    <Button
                      onClick={() => {
                        setAsking(false);
                      }}
                    >
                      Keep editing
                    </Button>
                    <Button
                      onClick={() => {
                        setAsking(false);
                        setOpen(false);
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      variant="you"
                      onClick={() => {
                        setAsking(false);
                        setOpen(false);
                      }}
                    >
                      Save
                    </Button>
                  </>
                ),
              }
            : undefined
        }
      >
        <Page title="A full-window editor" action={<Button variant="you">Save</Button>}>
          <Text tone="2">Esc or the close asks first.</Text>
        </Page>
      </Dialog>
    </>
  );
}

function Block({ name, children }: { name: string; children: ReactNode }) {
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
  const [draft, setDraft] = useState("");
  return (
    <Page title="Kit" context="Every component, every variant">
      <Surface pad={9}>
        <Stack gap={9}>
          <Block name="Text">
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
          </Block>
          <Block name="Icon">
            <Stack dir="row" gap={6} wrap align="center">
              {ICONS.map((name) => (
                <Icon key={name} name={name} label={name} />
              ))}
            </Stack>
          </Block>
          <Block name="Badge">
            <Stack dir="row" gap={4} wrap align="center">
              <Badge kind="key" size="sm">
                NW
              </Badge>
              <Badge kind="key">{"NW-14"}</Badge>
              <Badge kind="count">{3}</Badge>
              <Badge kind="count" tone="you">
                {2}
              </Badge>
              <Badge kind="count" tone="done">
                {5}
              </Badge>
              <Badge kind="kbd">Esc</Badge>
              <Chip label={"Bug"} />
              <Chip tone="blocked" label={"High"} />
              <Chip label={"web"} />
              <Badge kind="you" />
            </Stack>
          </Block>
          <Block name="Mark">
            <Stack dir="row" gap={8} wrap>
              {MARKS.map((kind) =>
                kind === "you" ? (
                  <Mark key={kind} kind={kind} ask="ask" />
                ) : (
                  <Mark key={kind} kind={kind} name={kind} ask="ask" />
                ),
              )}
            </Stack>
            <Stack dir="row" gap={6}>
              {MARKS.map((kind) => (
                <Mark key={kind} kind={kind} glyph small name={STATE_WORD[kind]} />
              ))}
            </Stack>
          </Block>
          <Block name="Button">
            <Stack dir="row" gap={4} wrap align="center">
              {(["default", "ink", "you", "accent", "quiet", "link"] as const).map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
              <Button blocked="Why it can't">blocked</Button>
              <Button icon="close" title="Close" />
            </Stack>
            <Stack dir="row" gap={4} align="center">
              {(["xs", "sm", "md"] as const).map((size) => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </Stack>
          </Block>
          <Block name="Avatar and Age">
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
              <Age text="now" />
            </Stack>
          </Block>
          <Block name="Stepper and Meter">
            <Stepper model={MODELS[1]?.model ?? { stages: [], live: false, closed: false }} />
            <Stepper
              model={MODELS[0]?.model ?? { stages: [], live: false, closed: false }}
              compact
            />
            <Meter done={2} total={5} />
            <Stack dir="row" gap={6} align="center">
              <Meter size="row" done={1} total={4} />
            </Stack>
          </Block>
          <Block name="Table, Head, Row, Notice">
            <Table columns={COLUMNS} scroll={false}>
              <Head
                name="Group"
                count={3}
                icon={<Mark kind="run" glyph small name={false} />}
                summary="summary"
                fold={{ open: true, toggle: () => undefined }}
              />
              <Row>
                <Badge kind="key">{"NW-17"}</Badge>
                <Text variant="label">A raised line</Text>
                <Age text="now" />
              </Row>
              <Row>
                <Badge kind="key">{"NW-14"}</Badge>
                <Text variant="label" weight={600}>
                  Needs you
                </Text>
                <Age text="3h 10m" />
              </Row>
              <Row alert="An alert under the row">
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
          </Block>
          <Block name="Controls">
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
          </Block>
          <Block name="Section">
            <Stack gap={8}>
              <Section
                title="Talk"
                note="Just people here. Agents don't read this."
                end={
                  <Avatar
                    size="talk"
                    people={[
                      { name: "Ada Park", seed: "1" },
                      { name: "Bea Quinn", seed: "2" },
                    ]}
                  />
                }
              >
                <Text tone="2">A part with a line under its heading and faces at its end</Text>
              </Section>
              <Section title="Plan" aside="2 of 5 done">
                <Text tone="2">A part with quiet words after its heading</Text>
              </Section>
              <Section label="NW-17">
                <Text tone="2">A part with no head of its own, named for assistive tech</Text>
              </Section>
            </Stack>
          </Block>
          <Block name="Menu, toast">
            <MenuSheet />
          </Block>
          <Block name="Form: FormRow, Field, NumberField, Toggle, TextArea">
            <FormSheet />
          </Block>
          <Block name="Checkbox, Radio">
            <ChoiceSheet />
          </Block>
          <Block name="Drag, Drop, Sortable">
            <DragSheet />
          </Block>
          <Block name="Lane, Card, Chip">
            <LaneSheet />
          </Block>
          <Block name="Dialog, full">
            <Stack dir="row">
              <OverlaySheet />
            </Stack>
          </Block>
          <Block name="Checklist, Facts, Thread">
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
                { label: "Workflow", icon: "workflow", value: "Standard v3" },
              ]}
            />
            <Surface level="sheet" pad={7}>
              <Thread
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
              <Composer
                label="Say something"
                value={draft}
                onChange={setDraft}
                onSend={() => undefined}
              />
            </Surface>
          </Block>
        </Stack>
      </Surface>
    </Page>
  );
}

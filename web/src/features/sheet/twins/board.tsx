// Twin of Linear's agent board (linear-bar/20-ai-f4.png): the view tabs and the bar's icon buttons,
// then three columns, each a head (glyph, name, count, more, add) over its task cards (key and the
// agent's pill with its faces; the status glyph and title; priority, labels and pull requests).
import { useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  type ChipDot,
  Icon,
  type IconName,
  Mark,
  Segmented,
  Stack,
  Text,
} from "../../../kit";

type Status = "progress" | "review" | "done";
type Priority = "high" | "medium" | "low" | "none";

interface Task {
  key: string;
  title: string;
  status: Status;
  /** The agent's pill (Working..., Waiting, Finished, Error); none: the faces alone. */
  pill?: string;
  /** The agent's logo and who started it, or the person alone. */
  faces: readonly string[];
  priority: Priority;
  labels: readonly (readonly [string, ChipDot])[];
  prs: readonly string[];
}

interface Lane {
  name: string;
  icon: IconName;
  count: number;
  tasks: readonly Task[];
}

// Linear's label colours on the kit's state dots: Design's cyan and Android's indigo on your
// move's indigo, iOS's yellow and System2026's orange on running's orange, Performance on done.
const DESIGN = ["Design", "you"] as const;
const IOS = ["iOS", "live"] as const;
const SYSTEM = ["System2026", "live"] as const;
const PERFORMANCE = ["Performance", "done"] as const;
const ANDROID = ["Android", "you"] as const;

const LANES: readonly Lane[] = [
  {
    name: "Offline Mode",
    icon: "high",
    count: 5,
    tasks: [
      {
        key: "ENG-2749",
        title: "Show last known vehicle location",
        status: "progress",
        pill: "Working...",
        faces: ["Codex", "Rafael Ortiz"],
        priority: "high",
        labels: [],
        prs: [],
      },
      {
        key: "ENG-2755",
        title: "Graceful error state when network drops",
        status: "progress",
        pill: "Working...",
        faces: ["Codex", "Nia Banks"],
        priority: "medium",
        labels: [DESIGN],
        prs: [],
      },
      {
        key: "ENG-2755",
        title: "Sync on reconnect",
        status: "progress",
        pill: "Waiting",
        faces: ["Tom Hale"],
        priority: "medium",
        labels: [IOS, SYSTEM],
        prs: [],
      },
    ],
  },
  {
    name: "Core Performance",
    icon: "feature",
    count: 4,
    tasks: [
      {
        key: "ENG-2703",
        title: "Faster app launch",
        status: "progress",
        pill: "Working...",
        faces: ["Codex", "Sam Reyes"],
        priority: "high",
        labels: [PERFORMANCE, IOS],
        prs: [],
      },
      {
        key: "ENG-2699",
        title: "Optimize state hydration",
        status: "progress",
        pill: "Waiting",
        faces: ["Cursor", "Ana Silva"],
        priority: "medium",
        labels: [PERFORMANCE],
        prs: ["#56995"],
      },
      {
        key: "ENG-1882",
        title: "Optimize load times",
        status: "done",
        faces: ["Codex", "Ken Ito"],
        priority: "low",
        labels: [ANDROID, PERFORMANCE],
        prs: ["#57291"],
      },
    ],
  },
  {
    name: "UI Refresh",
    icon: "compose",
    count: 6,
    tasks: [
      {
        key: "ENG-2753",
        title: "Refresh ride status screen visuals",
        status: "progress",
        pill: "Error",
        faces: ["Copilot", "Dev Shah"],
        priority: "none",
        labels: [DESIGN],
        prs: [],
      },
      {
        key: "ENG-2691",
        title: "Improve empty states",
        status: "review",
        pill: "Finished",
        faces: ["Cursor", "Leo Grant"],
        priority: "medium",
        labels: [ANDROID],
        prs: ["#55559"],
      },
      {
        key: "ENG-1337",
        title: "Align typography with updated system",
        status: "done",
        faces: ["Max Weber"],
        priority: "medium",
        labels: [IOS, SYSTEM],
        prs: ["#56998"],
      },
    ],
  },
];

/** Linear's status circles on the kit's marks: in progress is running's pie, in review waits on
 *  someone (the ring three quarters filled), done is the tick. */
const MARK = {
  progress: { kind: "run", word: "In Progress" },
  review: { kind: "wait", word: "In Review" },
  done: { kind: "done", word: "Done" },
} as const;

/** Linear's priority bars on the kit's: medium (two of three lit) on low, none on the dashes. */
const PRIORITY: Record<Priority, { icon: IconName; word: string }> = {
  high: { icon: "high", word: "High" },
  medium: { icon: "low", word: "Medium" },
  low: { icon: "low", word: "Low" },
  none: { icon: "normal", word: "No priority" },
};

const TABS = [
  { id: "all", label: "All tasks" },
  { id: "active", label: "Active" },
  { id: "backlog", label: "Backlog" },
];

/** The agent's logo and who started it, or the person alone. */
function Faces({ names }: { names: readonly string[] }) {
  const [only] = names;
  if (names.length === 1 && only !== undefined) return <Avatar size="sm" name={only} />;
  return <Avatar size="sm" people={names.map((n) => ({ name: n, seed: n }))} />;
}

function Item({ t, onOpen }: { t: Task; onOpen: (key: string) => void }) {
  const mark = MARK[t.status];
  const priority = PRIORITY[t.priority];
  return (
    <Card
      look="ticket"
      label={`Peek at ${t.key}: ${t.title}`}
      onOpen={() => {
        onOpen(t.key);
      }}
    >
      {/* one Stack of the card's lines, not the Card's own 6px between them: Linear's title sits
          2px under the key's line (20px with its pill; 18px without one, so 4px under it there, to
          keep every card's title and height), its foot 18px under the title (2 and the spacer's 16) */}
      <Stack gap={t.pill ? 1 : 2}>
        <Stack dir="row" gap={4} align="center" justify="between">
          <Badge kind="key" size="sm">
            {t.key}
          </Badge>
          <Stack dir="row" gap={2} align="center">
            {t.pill ? <Chip tone="pill" label={t.pill} /> : null}
            <Faces names={t.faces} />
          </Stack>
        </Stack>
        <Stack gap={1}>
          <Stack dir="row" gap={4} align="baseline">
            <Mark kind={mark.kind} glyph still name={mark.word} />
            <Text variant="label" weight={400} tone="1" truncate={2} title={t.title}>
              {t.title}
            </Text>
          </Stack>
          <Stack gap={8}>
            <Stack />
            <Stack dir="row" gap={2} align="center">
              <Button size="xs" icon={priority.icon} title={`Priority: ${priority.word}`} />
              {t.labels.map(([label, dot]) => (
                <Chip key={label} tone="pill" dot={dot} label={label} />
              ))}
              {t.prs.map((pr) => (
                <Chip key={pr} tone="pill" lead="branch" label={pr} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

/** A column's head: its glyph, name and count 14px apart and 14px in from the column's edge, then
 *  more and add at its end, 10px in from the other edge (the spacers at either end). */
function LaneHead({ lane }: { lane: Lane }) {
  return (
    <Stack dir="row" gap={5} align="center">
      <Stack dir="row" gap={7} align="center">
        <Stack />
        <Icon name={lane.icon} quiet />
        <Text weight={500} tone="1">
          {lane.name}
        </Text>
        <Text tone="3" tabular>
          {String(lane.count)}
        </Text>
      </Stack>
      <Stack grow />
      <Stack dir="row" gap={2} align="center">
        <Button variant="quiet" size="xs" icon="more" title={`More on ${lane.name}`} />
        <Button variant="quiet" size="xs" icon="plus" title={`New task in ${lane.name}`} />
      </Stack>
      <Stack />
    </Stack>
  );
}

export function Twin() {
  const [tab, setTab] = useState("all");
  const [, setPeek] = useState<string | null>(null);
  return (
    <Stack gap={10}>
      <Stack gap={5}>
        <Stack />
        <Stack dir="row" gap={5} align="center">
          <Stack />
          <Segmented label="Views" items={TABS} value={tab} onChange={setTab} />
          <Stack dir="row" gap={4} align="center">
            <Button size="sm" icon="filter" title="Filter" />
            <Button size="sm" icon="display" title="Display options" />
            <Button size="sm" icon="high" title="Insights" />
            <Button size="sm" icon="intake" title="Details" />
          </Stack>
          <Stack />
        </Stack>
      </Stack>
      <Stack dir="row" gap={7}>
        <Stack />
        <Stack grow>
          <Stack cols={3} gap={7}>
            {LANES.map((lane) => (
              // the cards 18px under the head (2 and the spacer's 16), 10px apart
              <Stack key={lane.name} gap={1}>
                <LaneHead lane={lane} />
                <Stack gap={8}>
                  <Stack />
                  <Stack gap={5}>
                    {lane.tasks.map((t, i) => (
                      <Item key={`${t.key}-${String(i)}`} t={t} onOpen={setPeek} />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack />
      </Stack>
    </Stack>
  );
}

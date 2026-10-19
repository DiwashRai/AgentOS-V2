// My queue (home): only what is mine. Click, Enter or Space on an item opens the peek (`?peek=`).
import { useSearchParams } from "react-router";

import type { Person, TicketRow } from "../../api/types";
import { edgeOf, groupOf, markOf, stageModel, stepText } from "../../domain/board";
import { age, elapsed, matches } from "../../domain/format";
import {
  Age,
  Avatar,
  Badge,
  Button,
  type Column,
  Head,
  Icon,
  Mark,
  Meter,
  Notice,
  Page,
  Row,
  Stack,
  Stepper,
  Surface,
  Table,
  Text,
} from "../../kit";
import { ActionButton, rowActions } from "../shared/Actions";
import { contextOf, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import { atWorkNote, CAP, shipped, subLine, type Zones, zones } from "./model";

const ITEM: readonly Column[] = [
  { label: "Stage", width: "xl" },
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill" },
  { label: "", width: "line", rule: true },
  { label: "Now", width: "3xl" },
  { label: "Age", width: "xs", end: true },
  { label: "", width: "fit", end: true },
];

const RACK: readonly Column[] = [
  { label: "", width: "dot" },
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill" },
  { label: "", width: "xs" },
  { label: "", width: "xs", end: true },
  { label: "", width: "face" },
];

type Open = (key: string) => void;

function Title({ t, me }: { t: TicketRow; me: Person | null }) {
  const sub = t.attention.kind === "done" ? "" : subLine(t, me);
  const g = groupOf(t, me);
  return (
    <Stack gap={1}>
      <Stack dir="row" gap={3} align="center">
        <Icon name={t.type} />
        <Icon name={t.priority} />
        <Text
          variant="label"
          weight={g === "needs_you" ? 600 : 500}
          tone={g === "done" ? "2" : "1"}
          truncate
          title={t.title}
        >
          {t.title}
        </Text>
      </Stack>
      {sub ? (
        <Text variant="meta" truncate title={sub}>
          {sub}
        </Text>
      ) : null}
    </Stack>
  );
}

interface ItemProps {
  t: TicketRow;
  me: Person | null;
  now: number;
  onOpen: Open;
}

/** A done item's owner and where it came from. */
function Who({ t }: { t: TicketRow }) {
  const where = [t.source ? "Jira" : null, t.repo].filter(Boolean);
  return (
    <Stack dir="row" gap={5} align="center">
      {t.owner ? <Avatar name={t.owner.name} seed={String(t.owner.id)} /> : <Avatar />}
      <Text variant="meta" truncate>
        {where.join(" · ")}
      </Text>
    </Stack>
  );
}

/** What the item waits on, and its line under the mark. */
function Ask({ t, me }: { t: TicketRow; me: Person | null }) {
  const a = t.attention;
  const line = a.kind === "blocked" ? a.reason : t.now;
  return (
    <Stack gap={1}>
      <Mark {...markOf(a, me)} />
      <Text tone="2" truncate title={line}>
        {line}
      </Text>
    </Stack>
  );
}

/** A done item's outcome: "Complete · PR #187 merged", "Abandoned" in crimson. */
function Outcome({ outcome, note }: { outcome: "completed" | "abandoned"; note: string | null }) {
  return (
    <Text tone="2" truncate>
      {outcome === "abandoned" ? (
        <Text tone="blocked" weight={600}>
          Abandoned
        </Text>
      ) : (
        "Complete"
      )}
      {note ? ` · ${note}` : null}
    </Text>
  );
}

/** The item's buttons: a gate's on a Needs-you item, Retry alone on a blocked one. */
function Buttons({ t, me }: { t: TicketRow; me: Person | null }) {
  const blocked = t.attention.kind === "blocked";
  const shown = blocked || groupOf(t, me) === "needs_you" ? rowActions(t.actions) : [];
  return (
    <Stack dir="row" gap={4} justify="end">
      {shown
        .filter((x) => !blocked || x.id === "retry")
        .map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
    </Stack>
  );
}

const LOOK = { needs_you: "you", done: "flat" } as const;

function Item({ t, me, now, onOpen }: ItemProps) {
  const a = t.attention;
  const g = groupOf(t, me);
  return (
    <Row
      kind="item"
      look={g === "needs_you" || g === "done" ? LOOK[g] : "raised"}
      edge={edgeOf(t, me)}
      action={{
        label: `Peek at ${t.key}: ${t.title}`,
        run: () => {
          onOpen(t.key);
        },
      }}
    >
      <Stepper model={stageModel(t, me)} />
      <Badge kind="key">{t.key}</Badge>
      <Title t={t} me={me} />
      {a.kind === "done" ? <Who t={t} /> : <Ask t={t} me={me} />}
      <Text tone="3">
        <Age text={age(t.since, now)} strong={g === "needs_you" || g === "blocked"} />
      </Text>
      {a.kind === "done" ? (
        <Outcome outcome={a.outcome} note={a.note} />
      ) : (
        <Buttons t={t} me={me} />
      )}
    </Row>
  );
}
function Tile({
  t,
  me,
  now,
  onOpen,
}: {
  t: TicketRow;
  me: Person | null;
  now: number;
  onOpen: Open;
}) {
  const a = t.attention;
  if (a.kind !== "running") return null;
  const p = a.progress;
  return (
    <Row
      kind="tile"
      action={{
        label: `Peek at ${t.key}: ${t.title}`,
        run: () => {
          onOpen(t.key);
        },
      }}
    >
      <Stack dir="row" gap={3} align="center">
        <Mark kind="run" name={`${a.agent} · run #${String(a.run_id)}`} />
        <Stack grow />
        <Text variant="meta" tabular>
          {elapsed(t.since, now)}
        </Text>
      </Stack>
      <Text variant="label" truncate={2} title={t.title}>
        {t.title}
      </Text>
      <Stack dir="row" gap={4} align="center" justify="between">
        <Badge kind="key">{t.key}</Badge>
        <Stepper model={stageModel(t, me)} />
      </Stack>
      <Stack dir="row" gap={4} align="baseline">
        <Stack grow>
          <Text tone="2" truncate title={a.step}>
            {a.step}
          </Text>
        </Stack>
        {p ? (
          <Text variant="meta" tabular>
            {stepText(p)}
          </Text>
        ) : null}
      </Stack>
      {p ? <Meter done={p.done} total={p.total} /> : null}
    </Row>
  );
}

function RackLine({ t, onOpen }: { t: TicketRow; onOpen: Open }) {
  const a = t.attention;
  const p = a.kind === "running" ? a.progress : null;
  return (
    <Row
      kind="rack"
      action={{
        label: `Peek at ${t.key}: ${t.title}`,
        run: () => {
          onOpen(t.key);
        },
      }}
    >
      <Mark kind={a.kind === "queued" ? "queued" : "run"} glyph />
      <Badge kind="key" size="sm">
        {t.key}
      </Badge>
      <Text tone={a.kind === "queued" ? "3" : "2"} truncate title={t.title}>
        {t.title}
      </Text>
      {p ? <Meter size="row" done={p.done} total={p.total} /> : <Stack />}
      <Text variant="meta" tabular>
        {p ? stepText(p) : ""}
      </Text>
      {t.owner ? <Avatar name={t.owner.name} seed={String(t.owner.id)} /> : <Avatar />}
    </Row>
  );
}

interface ZoneListProps {
  z: Zones;
  me: Person | null;
  now: number;
  open: Open;
}

function ZoneList({ z, me, now, open }: ZoneListProps) {
  const n = shipped(z.done);
  return (
    <Stack gap={8}>
      {z.yourMove.length === 0 ? (
        <Notice kind="empty" lead="All clear">
          nothing is your move
        </Notice>
      ) : (
        <Stack gap={4}>
          <Head
            level="zone"
            name="Your move"
            count={z.yourMove.length}
            note="Longest wait first"
            tone="you"
          />
          <Table columns={ITEM} head={false} scroll={false}>
            {z.yourMove.map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
          </Table>
        </Stack>
      )}
      {z.tiles.length + z.rack.length === 0 ? (
        <Notice kind="empty" lead="All quiet">
          nothing running, nothing queued
        </Notice>
      ) : (
        <Stack gap={4}>
          <Head
            level="zone"
            icon={<Mark kind="run" glyph />}
            name="Agents at work"
            count={z.running}
            note={atWorkNote(z)}
          />
          <Stack cols={5} gap={5}>
            {z.tiles.map((t) => (
              <Tile key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
          </Stack>
          <Stack cols={3} gap={9}>
            {z.rack.map((g) => (
              <Stack key={g.name}>
                <Head level="rack" name={g.name} count={g.items.length} />
                <Table columns={RACK} head={false} scroll={false}>
                  {g.items.map((t) => (
                    <RackLine key={t.key} t={t} onOpen={open} />
                  ))}
                </Table>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
      {z.ready.length > 0 ? (
        <Stack gap={4}>
          <Head level="zone" name="Ready to start" count={z.ready.length} note="Oldest first" />
          <Table columns={ITEM} head={false} scroll={false}>
            {z.ready.map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
          </Table>
        </Stack>
      ) : null}
      {z.done.length > 0 ? (
        <Stack gap={4}>
          <Head
            level="zone"
            name="Done recently"
            count={z.done.length}
            note="Yours, last 7 days"
            tone="done"
            summary={
              <Stack dir="row" gap={7} align="center">
                {n > 0 ? (
                  <Stack dir="row" gap={3} align="center">
                    <Icon name="tick-sm" />
                    <Text variant="meta" tone="2">
                      <Text weight={600} tone="done">{`${String(n)} shipped`}</Text> this week
                    </Text>
                  </Stack>
                ) : null}
                <Button variant="link" href="/compact?f=done">
                  All done tickets
                </Button>
              </Stack>
            }
          />
          <Table columns={ITEM} head={false} scroll={false}>
            {z.done.slice(0, CAP.done).map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
            {z.done.length > CAP.done ? (
              <Notice kind="more" lead={`+${String(z.done.length - CAP.done)} more`} />
            ) : null}
          </Table>
        </Stack>
      ) : null}
    </Stack>
  );
}

export function QueueView() {
  const board = useBoard();
  const { rows, me, now } = board;
  const [, setParams] = useSearchParams();
  const space = useSpace();
  const { query, search } = useSearch();
  const z = zones(
    rows.filter((t) => matches([t.key, t.title], query)),
    me,
    now,
  );
  const open: Open = (key) => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      out.set("peek", key);
      return out;
    });
  };
  return (
    <Page
      title="My queue"
      context={contextOf(space, me?.name)}
      search={search}
      action={<NewTicket />}
      counters={[
        { n: z.yourMove.length, label: "your move", mark: "you" },
        { n: z.mine, label: "runs yours", mark: "run" },
        "|",
        { n: z.running, label: "running", mark: "run" },
        { n: z.queued, label: "queued", mark: "queued" },
      ]}
    >
      <Surface pad={8}>
        {board.error ? (
          <Notice kind="status" error>{`Can't reach the server · ${board.error.message}`}</Notice>
        ) : board.pending ? (
          <Notice kind="status">Loading</Notice>
        ) : (
          <ZoneList z={z} me={me} now={now} open={open} />
        )}
      </Surface>
    </Page>
  );
}

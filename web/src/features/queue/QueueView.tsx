// My queue (home): only what is mine. Click, Enter or Space on an item opens the peek (`?peek=`).
import { useSearchParams } from "react-router";

import type { Person, TicketRow } from "../../api/types";
import { groupOf, stageModel, stepText } from "../../domain/board";
import { age, elapsed, matches } from "../../domain/format";
import {
  Avatar,
  Badge,
  Button,
  Card,
  type Column,
  Head,
  Icon,
  Mark,
  Meter,
  Notice,
  Page,
  Row,
  Stack,
  Surface,
  Table,
  Text,
} from "../../kit";
import { nowLine } from "../compact/model";
import { KeyCell, LINE_END, lineEnd, TitleCell } from "../compact/TicketLine";
import { ActionButton, rowActions } from "../shared/Actions";
import { contextOf, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import { atWorkNote, CAP, shipped, type Zones, zones } from "./model";

// Linear's list, as Compact's: the key and the title on the left, what it waits on receding after
// the title; a row's buttons where Compact has its Now tag, hugging the plain properties at the
// far end, so the title line takes every width they leave and every zone's ends line up. My
// queue's rows have no Now tag: they are your move, your inbox or done, which the group, the
// glyph and the stage already say.
const ITEM: readonly Column[] = [
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill", min: "2xl" },
  { label: "", width: "2xl", hug: true, end: true, keep: true },
  ...LINE_END,
];

type Open = (key: string) => void;

interface ItemProps {
  t: TicketRow;
  me: Person | null;
  now: number;
  onOpen: Open;
}

/** The item's buttons: a gate's on a Needs-you item, Retry alone on a blocked one. */
function Buttons({ t, me }: { t: TicketRow; me: Person | null }) {
  const blocked = t.attention.kind === "blocked";
  const shown = blocked || groupOf(t, me) === "needs_you" ? rowActions(t.actions) : [];
  return (
    <Stack dir="row" gap={3} justify="end">
      {shown
        .filter((x) => !blocked || x.id === "retry")
        .map((action) => (
          <ActionButton key={action.id} action={action} size="xs" />
        ))}
    </Stack>
  );
}

function Item({ t, me, now, onOpen }: ItemProps) {
  return (
    <Row
      action={{
        label: `Peek at ${t.key}: ${t.title}`,
        run: () => {
          onOpen(t.key);
        },
      }}
    >
      <KeyCell t={t} />
      <TitleCell t={t} me={me} after={nowLine(t, me).after} />
      <Buttons t={t} me={me} />
      {lineEnd({ t, me, now })}
    </Row>
  );
}
/** "Implement", or "Implement · round 2 of 3" in a later round (in words, so it never reads as the
 *  step count). */
function stageText(t: TicketRow, me: Person | null): string {
  const m = stageModel(t, me);
  return m.round ? `${m.label} · round ${String(m.round.n)} of ${String(m.round.of)}` : m.label;
}

/** A tile's top line, quiet: the key, its run and how long it has run or waited; at the end who
 *  works it (the agent in ink, or that it waits in the queue, muted), then the face of whose
 *  ticket it is. No pill: the tile's one colour is its glyph and its meter. */
function Top({
  t,
  now,
  run,
}: {
  t: TicketRow;
  now: number;
  run: { id: number; agent: string | null };
}) {
  const how = run.agent ? "running" : "queued";
  return (
    <Stack dir="row" gap={4} align="center">
      <Badge kind="key" size="sm">
        {t.key}
      </Badge>
      <Stack grow>
        <Text
          variant="meta"
          tone="3"
          tabular
          truncate
          title={`Run #${String(run.id)}, ${how} for ${elapsed(t.since, now)}`}
        >
          {`run #${String(run.id)} · ${age(t.since, now)}`}
        </Text>
      </Stack>
      <Text variant="meta" weight={500} tone={run.agent ? "1" : "3"}>
        {run.agent ?? "Queued"}
      </Text>
      {t.owner ? <Avatar name={t.owner.name} seed={String(t.owner.id)} /> : <Avatar dashed />}
    </Stack>
  );
}

/** A tile's body: its state glyph (Linear's in-progress ring, a dashed one queued) hanging before
 *  the title, and under the title where it is (the stage and the repo, plain words). A queued
 *  tile's title is muted, so the state reads down the left edge. */
function Body({ t, me }: { t: TicketRow; me: Person | null }) {
  const running = t.attention.kind === "running";
  const where = [stageText(t, me), t.repo ?? ""].filter(Boolean).join(" · ");
  return (
    <Stack dir="row" gap={4} align="baseline">
      <Mark kind={running ? "run" : "queued"} glyph still name={false} />
      <Stack gap={2}>
        <Text variant="label" tone={running ? "1" : "2"} truncate={2} title={t.title}>
          {t.title}
        </Text>
        <Text variant="meta" tone="3" truncate title={where}>
          {where}
        </Text>
      </Stack>
    </Stack>
  );
}

/** A tile's foot: what it is doing (or that it waits for a runner) and a running one's step count;
 *  under them its steps, the tile's whole width. */
function Progress({ t }: { t: TicketRow }) {
  const a = t.attention;
  const step = a.kind === "running" ? a.step : "Waiting for a runner";
  const p = a.kind === "running" ? a.progress : null;
  return (
    <Stack gap={3}>
      <Stack dir="row" gap={4} align="center">
        <Stack grow>
          <Text variant="meta" tone="2" truncate title={step}>
            {step}
          </Text>
        </Stack>
        {p ? (
          <Text variant="meta" tone="3" tabular>
            {stepText(p)}
          </Text>
        ) : null}
      </Stack>
      {p ? <Meter size="tile" done={p.done} total={p.total} /> : null}
    </Stack>
  );
}

/** An agent's tile, Linear's lines each in its own space: the key, its run and who works it; the
 *  state glyph, the title and where it is; then its progress at the foot. */
function AgentCard({ t, me, now, onOpen }: ItemProps) {
  const a = t.attention;
  if (a.kind !== "running" && a.kind !== "queued") return null;
  return (
    <Card
      look="agent"
      label={`Peek at ${t.key}: ${t.title}`}
      off={a.kind === "queued"}
      onOpen={() => {
        onOpen(t.key);
      }}
    >
      {/* the top line and the body take the free height, so the progress sinks to the foot and
          lines up across a row of tiles */}
      <Stack grow gap={5}>
        <Top t={t} now={now} run={{ id: a.run_id, agent: a.kind === "running" ? a.agent : null }} />
        <Body t={t} me={me} />
      </Stack>
      <Progress t={t} />
    </Card>
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
  // each zone a section: no band and no card; one after another parts by room and a hairline, the
  // cards on the column edge the heads hang on
  return (
    <Stack>
      <Surface level="list" label="Your move">
        {z.yourMove.length === 0 ? (
          <Notice kind="empty" lead="All clear">
            nothing is your move
          </Notice>
        ) : (
          <Table columns={ITEM} head={false} scroll={false}>
            <Head
              icon={<Mark kind="you" glyph name={false} />}
              name="Your move"
              count={z.yourMove.length}
              note="Longest wait first"
              tone="you"
            />
            {z.yourMove.map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
          </Table>
        )}
      </Surface>
      <Surface level="list" label="Agents at work">
        {z.agents.length === 0 ? (
          <Notice kind="empty" lead="All quiet">
            nothing running, nothing queued
          </Notice>
        ) : (
          <Stack gap={4}>
            <Head
              level="zone"
              icon={<Mark kind="run" glyph name={false} />}
              name="Agents at work"
              tone="live"
              count={z.agents.length}
              note={atWorkNote(z)}
            />
            <Stack cols={3} gap={5}>
              {z.agents.slice(0, CAP.agents).map((t) => (
                <AgentCard key={t.key} t={t} me={me} now={now} onOpen={open} />
              ))}
            </Stack>
            {z.agents.length > CAP.agents ? (
              <Button variant="link" href="/compact">
                {`+${String(z.agents.length - CAP.agents)} more running or queued`}
              </Button>
            ) : null}
          </Stack>
        )}
      </Surface>
      {z.ready.length > 0 ? (
        <Surface level="list" label="Ready to start">
          <Table columns={ITEM} head={false} scroll={false}>
            <Head
              icon={<Mark kind="idle" glyph name={false} />}
              name="Ready to start"
              count={z.ready.length}
              note="Oldest first"
            />
            {z.ready.map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
          </Table>
        </Surface>
      ) : null}
      {z.done.length > 0 ? (
        <Surface level="list" label="Done recently">
          <Table columns={ITEM} head={false} scroll={false}>
            <Head
              icon={<Mark kind="done" glyph name={false} />}
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
            {z.done.slice(0, CAP.done).map((t) => (
              <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
            ))}
            {z.done.length > CAP.done ? (
              <Notice kind="more" lead={`+${String(z.done.length - CAP.done)} more`} />
            ) : null}
          </Table>
        </Surface>
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
        { n: z.mine, label: "runs yours" },
        "|",
        { n: z.running, label: "running", mark: "run" },
        { n: z.queued, label: "queued", mark: "queued" },
      ]}
    >
      <Surface>
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

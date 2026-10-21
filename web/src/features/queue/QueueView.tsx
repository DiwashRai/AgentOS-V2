// My queue (home): only what is mine. Click, Enter or Space on an item opens the peek (`?peek=`).
import { useSearchParams } from "react-router";

import type { Person, TicketRow } from "../../api/types";
import { groupOf, stageModel, stepText } from "../../domain/board";
import { age, elapsed, matches } from "../../domain/format";
import {
  Badge,
  Button,
  Card,
  Chip,
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
// the title; a row's buttons hug Compact's end cluster (the chips against the age, then the face),
// so the title line takes every width they leave and every zone's ends line up. My queue's rows
// have no Now chip: they are your move, your inbox or done, which the group, the glyph and the
// stage already say.
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
          <ActionButton key={action.id} action={action} />
        ))}
    </Stack>
  );
}

const LOOK = { needs_you: "you", done: "flat" } as const;

function Item({ t, me, now, onOpen }: ItemProps) {
  const g = groupOf(t, me);
  return (
    <Row
      look={g === "needs_you" || g === "done" ? LOOK[g] : "raised"}
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
/** A card's state, top right, as Linear's agent pill: the words (the agent and that it runs, or
 *  that it is queued), then inside the pill the agent's own glyph on its live disc (a running card's;
 *  a queued one has no agent yet) and the face of whose ticket it is. */
function AgentChip({ t }: { t: TicketRow }) {
  const a = t.attention;
  const what = a.kind === "running" ? `${a.agent} running` : "Queued";
  const whose = t.owner ? `, for ${t.owner.name}` : "";
  return (
    <Chip
      label={what}
      title={`${what}${whose}`}
      after={{
        agent: a.kind === "running" ? a.agent : null,
        face: t.owner ? { name: t.owner.name, seed: String(t.owner.id) } : null,
      }}
    />
  );
}

/** "Implement", or "Implement · round 2 of 3" in a later round (in words, so it never reads as the
 *  step count). */
function stageText(t: TicketRow, me: Person | null): string {
  const m = stageModel(t, me);
  return m.round ? `${m.label} · round ${String(m.round.n)} of ${String(m.round.of)}` : m.label;
}

/** A card's second line: its state glyph (Linear's in-progress ring, a dashed one queued) hanging
 *  before the title, in Geist's regular (its 500 reads bold beside Linear's medium). A queued
 *  card's title is muted, so the state reads down the left edge. */
function Body({ t }: { t: TicketRow }) {
  const running = t.attention.kind === "running";
  return (
    <Stack dir="row" gap={4} align="baseline">
      <Mark kind={running ? "run" : "queued"} glyph still />
      <Text variant="label" weight={400} tone={running ? "1" : "2"} truncate={2} title={t.title}>
        {t.title}
      </Text>
    </Stack>
  );
}

/** A card's progress, its last line: what it is doing (or that it waits for a runner), the step
 *  count at the far end, and a running one's track along the card's bottom edge. */
function Progress({ t }: { t: TicketRow }) {
  const a = t.attention;
  const step = a.kind === "running" ? a.step : "Waiting for a runner";
  const p = a.kind === "running" ? a.progress : null;
  return (
    <Stack dir="row" gap={4} align="center">
      <Stack grow>
        <Text variant="meta" tone="3" truncate title={step}>
          {step}
        </Text>
      </Stack>
      {p ? (
        <Text variant="meta" tone="2" tabular>
          {stepText(p)}
        </Text>
      ) : null}
      {p ? <Meter size="edge" done={p.done} total={p.total} /> : null}
    </Stack>
  );
}

/** A card's top line: the key, its run and how long it has run or waited; the state pill at the
 *  end. */
function Top({
  t,
  now,
  run,
}: {
  t: TicketRow;
  now: number;
  run: { id: number; running: boolean };
}) {
  const how = run.running ? "running" : "queued";
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
      <AgentChip t={t} />
    </Stack>
  );
}

/** A card's chips: its stage as a label chip led by a dot in the card's state, then its repo. */
function Chips({ t, me }: { t: TicketRow; me: Person | null }) {
  const stage = stageText(t, me);
  const running = t.attention.kind === "running";
  return (
    <Stack dir="row" gap={3} align="center" wrap>
      {stage ? (
        <Chip tone="fill" dot={running ? "live" : "neutral"} label={stage} title={stage} />
      ) : null}
      {t.repo ? <Chip tone="fill" lead="repo" label={t.repo} title={t.repo} /> : null}
    </Stack>
  );
}

/** An agent's card, Linear's lines each in its own space: the key, its run and the agent pill; the
 *  state glyph and the title; the stage and repo chips; then its progress. */
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
      {/* the key line and the title take the free height, so the chips and the progress sink to the
          foot and line up across a row of cards */}
      <Stack grow gap={4}>
        <Top t={t} now={now} run={{ id: a.run_id, running: a.kind === "running" }} />
        <Body t={t} />
      </Stack>
      <Chips t={t} me={me} />
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
  return (
    <Stack>
      {z.yourMove.length === 0 ? (
        <Notice kind="empty" lead="All clear">
          nothing is your move
        </Notice>
      ) : (
        <Table columns={ITEM} head={false} scroll={false} bleed>
          <Head
            icon={<Mark kind="you" glyph />}
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
      {/* the cards' zone keeps room under it before the next band */}
      <Stack gap={8}>
        {z.agents.length === 0 ? (
          <Notice kind="empty" lead="All quiet">
            nothing running, nothing queued
          </Notice>
        ) : (
          <Stack gap={4}>
            <Head
              level="zone"
              icon={<Mark kind="run" glyph />}
              name="Agents at work"
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
        <Stack />
      </Stack>
      {z.ready.length > 0 ? (
        <Table columns={ITEM} head={false} scroll={false} bleed>
          <Head
            icon={<Mark kind="idle" glyph />}
            name="Ready to start"
            count={z.ready.length}
            note="Oldest first"
          />
          {z.ready.map((t) => (
            <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
          ))}
        </Table>
      ) : null}
      {z.done.length > 0 ? (
        <Table columns={ITEM} head={false} scroll={false} bleed>
          <Head
            icon={<Mark kind="done" glyph />}
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

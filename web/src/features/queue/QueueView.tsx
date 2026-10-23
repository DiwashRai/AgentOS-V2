// My queue (home): only what is mine. Click, Enter or Space on an item opens the peek (`?peek=`).
import type { Person, TicketRow } from "../../api/types";
import { atWork, groupOf } from "../../domain/board";
import { matches } from "../../domain/format";
import {
  Button,
  type Column,
  Head,
  Mark,
  Notice,
  Page,
  Row,
  type Segment,
  Segmented,
  Stack,
  Surface,
  Table,
} from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { RunNow } from "../../patterns/runNow";
import { KeyCell, LINE_END, lineEnd, TicketTitle } from "../../patterns/ticketLine";
import { ActionButton, actionsAt } from "../shared/Actions";
import { contextOf, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useParam, usePeek } from "../shared/useParam";
import { useSearch } from "../shared/useSearch";
import { atWorkNote, CAP, type Zones, zones } from "./model";

// Linear's list, as Compact's: the key and the title on the left, what it waits on receding after
// the title; then where Compact has its Now tag, a gate's buttons or a run's agent and steps,
// hugging the plain properties at the far end, so the title line takes every width they leave
// and every zone's ends line up, runs and all: one ledger down the page.
const ITEM: readonly Column[] = [
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill", min: "2xl" },
  { label: "", width: "2xl", hug: true, end: true, keep: true },
  ...LINE_END,
];

/** The bar's chips, as Compact's: Everything, then each zone with its count; one pressed shows that
 *  zone alone (`?z=`). */
type Zone = "all" | "you" | "work" | "ready" | "done";
const ZONE_IDS: readonly Zone[] = ["all", "you", "work", "ready", "done"];
const zoneOf = (v: string | null): Zone => ZONE_IDS.find((z) => z === v) ?? "all";

function zoneChips(z: Zones): Segment[] {
  const all = z.yourMove.length + z.agents.length + z.ready.length + z.done.length;
  return [
    { id: "all", label: "Everything", count: all },
    { id: "you", label: "Your move", count: z.yourMove.length, mark: "you" },
    { id: "work", label: "Agents at work", count: z.agents.length, mark: "run" },
    { id: "ready", label: "Ready to start", count: z.ready.length, mark: "idle" },
    { id: "done", label: "Done recently", count: z.done.length, mark: "done" },
  ];
}

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
  const shown = blocked || groupOf(t, me) === "needs_you" ? actionsAt(t.actions, "line") : [];
  return (
    <Stack dir="row" gap={3} justify="end">
      {shown
        .filter((x) => !blocked || x.id === "retry")
        .map((action) => (
          <ActionButton key={action.id} action={action} place="line" />
        ))}
    </Stack>
  );
}

/** One line of the queue: the key, the glyph and title with what it waits on after it; then a
 *  gate's buttons, or a run's Now (its agent, steps and meter, ending on the stage's edge so the
 *  meters line up down the zone); then the plain end every zone shares. */
function Item({ t, me, now, onOpen }: ItemProps) {
  const a = t.attention;
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
      <TicketTitle t={t} me={me} />
      {atWork(a) ? <RunNow run={a} since={t.since} now={now} /> : <Buttons t={t} me={me} />}
      {lineEnd({ t, me, now })}
    </Row>
  );
}

interface ZoneProps {
  z: Zones;
  me: Person | null;
  now: number;
  open: Open;
}

function YourMove({ z, me, now, open }: ZoneProps) {
  return (
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
          />
          {z.yourMove.map((t) => (
            <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
          ))}
        </Table>
      )}
    </Surface>
  );
}

function AtWork({ z, me, now, open }: ZoneProps) {
  return (
    <Surface level="list" label="Agents at work">
      {z.agents.length === 0 ? (
        <Notice kind="empty" lead="All quiet">
          nothing running, nothing queued
        </Notice>
      ) : (
        <Table columns={ITEM} head={false} scroll={false}>
          <Head
            icon={<Mark kind="run" glyph name={false} />}
            name="Agents at work"
            count={z.agents.length}
            note={atWorkNote(z)}
          />
          {z.agents.slice(0, CAP.agents).map((t) => (
            <Item key={t.key} t={t} me={me} now={now} onOpen={open} />
          ))}
          {z.agents.length > CAP.agents ? (
            <Button variant="link" href="/compact">
              {`+${String(z.agents.length - CAP.agents)} more running or queued`}
            </Button>
          ) : null}
        </Table>
      )}
    </Surface>
  );
}

function Ready({ z, me, now, open }: ZoneProps) {
  return (
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
  );
}

function Done({ z, me, now, open }: ZoneProps) {
  return (
    <Surface level="list" label="Done recently">
      <Table columns={ITEM} head={false} scroll={false}>
        <Head
          icon={<Mark kind="done" glyph name={false} />}
          name="Done recently"
          count={z.done.length}
          note="Yours, last 7 days"
          summary={
            <Button variant="link" href="/compact?f=done">
              All done tickets
            </Button>
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
  );
}

/** Each zone a section of lines on one grid, one after another parted by room; the bar's filter
 *  shows one alone. Ready and Done only when they hold something. */
function ZoneList({ only, ...props }: ZoneProps & { only: Zone }) {
  const { z } = props;
  const show = (id: Zone) => only === "all" || only === id;
  return (
    <Stack>
      {show("you") ? <YourMove {...props} /> : null}
      {show("work") ? <AtWork {...props} /> : null}
      {show("ready") && z.ready.length > 0 ? <Ready {...props} /> : null}
      {show("done") && z.done.length > 0 ? <Done {...props} /> : null}
    </Stack>
  );
}

export function QueueView() {
  const board = useBoard();
  const { rows, me, now } = board;
  const [asked, setZone] = useParam("z");
  const zone = zoneOf(asked);
  const peek = usePeek();
  const space = useSpace();
  const { query, search } = useSearch();
  const z = zones(
    rows.filter((t) => matches([t.key, t.title], query)),
    me,
    now,
  );
  return (
    <Page
      title="My queue"
      context={contextOf(space, me?.name)}
      search={search}
      action={<NewTicket />}
      middle={
        <Segmented
          label="Filter"
          items={zoneChips(z)}
          value={zone}
          onChange={(id) => {
            setZone(id === "all" ? null : id);
          }}
        />
      }
    >
      <Surface>
        {board.load ? (
          <LoadNotice load={board.load} noun="tickets" />
        ) : (
          <ZoneList z={z} me={me} now={now} open={peek.open} only={zone} />
        )}
      </Surface>
    </Page>
  );
}

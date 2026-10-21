// All teams (new in V2): every repo by stage. One band per repo (who works there, a link to its
// list) and a lane per stage, Plan · Build · Verify · Review, each holding its tickets' cards (a
// lane with none is bare page; a stage empty across the board folds narrow). Inbox and done work
// live in each repo's list. Click an item to peek.
import { useState } from "react";
import { useSearchParams } from "react-router";

import { useSettings } from "../../api/queries";
import type { Person, Phase, TicketRow } from "../../api/types";
import { groupOf, isMyMove, markOf, stepText } from "../../domain/board";
import { firstName, plural, repoShort } from "../../domain/format";
import {
  Avatar,
  Badge,
  Card,
  Button,
  Chip,
  type Column,
  Mark,
  type MarkKind,
  Notice,
  Page,
  Row,
  Stack,
  Table,
  Text,
} from "../../kit";
import { contextOf, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";

const STAGES: readonly { phase: Phase; name: string }[] = [
  { phase: "plan", name: "Plan" },
  { phase: "build", name: "Build" },
  { phase: "verify", name: "Verify" },
  { phase: "review", name: "Review" },
];

/** How many in-flight cards each stage holds, across the board. */
function countsOf(work: readonly TicketRow[]): Record<Phase, number> {
  const n: Record<Phase, number> = { inbox: 0, plan: 0, build: 0, verify: 0, review: 0, done: 0 };
  for (const t of work) n[t.phase] += 1;
  return n;
}

/** The team column, then a lane per stage in order: a stage holding cards takes an equal share of
 *  the board's width (Linear's board columns); an empty one folds to a narrow lane, as Linear
 *  folds an empty column, so it leaves no dead band and its cards' neighbours get the room. */
function columnsOf(counts: Record<Phase, number>): readonly Column[] {
  return [
    { label: "Team", width: "lg" },
    ...STAGES.map((st): Column => ({
      label: st.name,
      width: counts[st.phase] > 0 ? "fill" : "md",
    })),
  ];
}

/** The board's column head, on the lanes' own grid: each stage's name and how many cards it holds
 *  (Linear's board heads); an empty stage's name muted over its folded lane. */
function Head({ counts }: { counts: Record<Phase, number> }) {
  return (
    <Row kind="columns">
      <Text variant="meta" weight={500}>
        Team
      </Text>
      {STAGES.map((st) => (
        <Stack key={st.phase} dir="row" gap={3} align="center">
          <Text weight={500} tone={counts[st.phase] > 0 ? "1" : "3"}>
            {st.name}
          </Text>
          <Text tone="3" tabular>
            {String(counts[st.phase])}
          </Text>
        </Stack>
      ))}
    </Row>
  );
}

const LEGEND = [
  ["run", "Running"],
  ["wait", "Waiting on someone"],
  ["you", "Your move"],
  ["blk", "Blocked"],
  ["queued", "Queued"],
] as const;

/** Work in flight: inbox and merged work live in each repo's list. */
function inFlight(t: TicketRow): boolean {
  return t.attention.kind !== "inbox" && t.attention.kind !== "done";
}

const CAP = 3;

/** What a waiting ticket is parked at: its gate's short name, else the ask. */
function parkedAt(t: TicketRow, ask: string): string {
  return t.rail.find((s) => s.gate?.state === "waiting")?.gate?.short ?? ask;
}

/** An item's badge: the live agent and its progress, or what it waits on. Its text stays neutral;
 *  the state's glyph alone carries the hue. */
interface ItemBadge {
  kind: MarkKind;
  text: string;
  /** A running agent's steps, for its glyph's pie. */
  progress?: { done: number; total: number } | null;
}

type Waiting = Extract<TicketRow["attention"], { kind: "waiting" }>;

/** A waiting item's badge: on you, its gate and You (else the ask); on someone else, where it is
 *  parked and who. */
function waitingBadge(t: TicketRow, a: Waiting, me: Person | null): ItemBadge {
  if (isMyMove(a.on, me)) {
    const gate = t.rail.find((s) => s.gate?.state === "waiting")?.gate?.short;
    return { kind: "you", text: gate ? `${gate} · You` : a.ask };
  }
  const who = firstName(a.on?.name ?? "someone");
  return { kind: "wait", text: `${parkedAt(t, a.ask)} · ${who}` };
}

function itemBadge(t: TicketRow, me: Person | null): ItemBadge {
  const a = t.attention;
  if (a.kind === "running") {
    const p = a.progress;
    return { kind: "run", text: p ? `${a.agent} ${stepText(p)}` : a.agent, progress: p };
  }
  if (a.kind === "waiting") return waitingBadge(t, a, me);
  const m = markOf(a, me);
  return { kind: m.kind, text: m.kind === "you" ? "" : (m.name ?? "") };
}

/** One item, three levels: its key (12px, muted) leads; then the state's glyph (Linear's status
 *  circle, a running agent's pie showing its progress) and the title (14px, regular, up to two
 *  lines); then a smaller badge under it (Linear's label chip, a pill on a hairline) with the
 *  secondary words for who works on it or what it waits on. */
function Item({
  t,
  me,
  onOpen,
}: {
  t: TicketRow;
  me: Person | null;
  onOpen: (key: string) => void;
}) {
  const badge = itemBadge(t, me);
  return (
    <Card
      look="ticket"
      label={`Peek at ${t.key}: ${t.title}`}
      onOpen={() => {
        onOpen(t.key);
      }}
    >
      <Badge kind="key" size="sm">
        {t.key}
      </Badge>
      <Stack dir="row" gap={4} align="baseline">
        <Mark kind={badge.kind} glyph still progress={badge.progress} />
        <Text variant="label" weight={400} tone="1" truncate={2} title={t.title}>
          {t.title}
        </Text>
      </Stack>
      <Chip tone="fill" label={badge.text} title={badge.text} />
    </Card>
  );
}

function Cell({
  items,
  me,
  onOpen,
}: {
  items: readonly TicketRow[];
  me: Person | null;
  onOpen: (key: string) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, CAP);
  return (
    <>
      {shown.map((t) => (
        <Item key={t.key} t={t} me={me} onOpen={onOpen} />
      ))}
      {items.length > CAP ? (
        <Stack dir="row">
          <Button
            variant="quiet"
            size="xs"
            onClick={() => {
              setAll((v) => !v);
            }}
          >
            {all ? "Show less" : `+${String(items.length - CAP)}`}
          </Button>
        </Stack>
      ) : null}
    </>
  );
}

export function TeamsView() {
  const board = useBoard();
  const { rows, me } = board;
  const repos = useSettings().data?.repos.value ?? [];
  const space = useSpace();
  const { query, search } = useSearch("Jump to a repo or ticket");
  const [, setParams] = useSearchParams();
  const open = (key: string) => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      out.set("peek", key);
      return out;
    });
  };
  const live = rows.filter((t) => t.attention.kind === "running").length;
  const queued = rows.filter((t) => t.attention.kind === "queued").length;
  const needYou = rows.filter((t) => groupOf(t, me) === "needs_you").length;
  const shown = rows.filter((t) =>
    query.every((q) => `${t.key} ${t.title}`.toLowerCase().includes(q)),
  );
  const counts = countsOf(shown.filter(inFlight));
  return (
    <Page
      title="All teams"
      context={contextOf(space, plural(repos.length, "repo"))}
      action={<NewTicket />}
      counters={[
        { n: live, label: "running", mark: "run" },
        { n: queued, label: "queued", mark: "queued" },
        "|",
        { n: needYou, label: "need you", mark: "you" },
      ]}
      search={search}
    >
      <Stack gap={6}>
        {board.pending ? <Notice kind="status">Loading</Notice> : null}
        {board.error ? (
          <Notice kind="status" error>{`Can't reach the server · ${board.error.message}`}</Notice>
        ) : null}
        <Table columns={columnsOf(counts)} head={false} scroll={false}>
          <Head counts={counts} />
          {repos.map((repo) => {
            const work = shown.filter((t) => t.repo === repo.name && inFlight(t));
            const owners = rows.flatMap((t) => (t.repo === repo.name && t.owner ? [t.owner] : []));
            const people = [...new Map(owners.map((p) => [p.id, p])).values()];
            return (
              <Row key={repo.name} kind="band">
                <Stack gap={5}>
                  <Stack gap={3}>
                    <Text variant="heading" as="h2" truncate>
                      {repoShort(repo.name)}
                    </Text>
                    <Text variant="meta">{repo.name}</Text>
                    <Stack dir="row">
                      <Avatar
                        size="mid"
                        people={people.map((p) => ({ name: p.name, seed: String(p.id) }))}
                      />
                    </Stack>
                  </Stack>
                  <Stack dir="row">
                    <Button variant="link" href={`/compact?repo=${encodeURIComponent(repo.name)}`}>
                      Open list →
                    </Button>
                  </Stack>
                </Stack>
                {STAGES.map((st, i) =>
                  work.length === 0 && i === 0 ? (
                    <Notice key={st.phase} kind="empty" lead="Nothing in flight" />
                  ) : (
                    <Cell
                      key={st.phase}
                      items={work.filter((t) => t.phase === st.phase)}
                      me={me}
                      onOpen={open}
                    />
                  ),
                )}
              </Row>
            );
          })}
        </Table>
        <Stack dir="row" gap={8} align="center">
          <Text variant="meta">Inbox and merged work live in each repo&apos;s list.</Text>
          <Stack grow />
          {LEGEND.map(([kind, word]) => (
            <Stack key={kind} dir="row" gap={3} align="center">
              <Mark kind={kind} glyph />
              <Text variant="meta" tone="2">
                {word}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Page>
  );
}

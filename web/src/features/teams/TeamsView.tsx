// All teams (new in V2): every repo by stage. One band per repo (who works there, a link to its
// list) and four stage cells, Plan · Build · Verify · Review, each holding its tickets' marks.
// Inbox and done work live in each repo's list. Click an item to peek.
import { useState } from "react";
import { useSearchParams } from "react-router";

import { useSettings } from "../../api/queries";
import type { Person, Phase, TicketRow } from "../../api/types";
import { groupOf, isMyMove, markOf, type MarkModel, stepText } from "../../domain/board";
import { firstName, plural, repoShort } from "../../domain/format";
import {
  Avatar,
  Button,
  type Column,
  Mark,
  Notice,
  Page,
  Row,
  Stack,
  Surface,
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

const COLUMNS: readonly Column[] = [
  { label: "Team", width: "xl" },
  ...STAGES.map((st): Column => ({ label: st.name, width: "fill" })),
];

const CAP = 3;

/** What a waiting ticket is parked at: its gate's short name, else the ask. */
function parkedAt(t: TicketRow, ask: string): string {
  return t.rail.find((s) => s.gate?.state === "waiting")?.gate?.short ?? ask;
}

/** An item's first line: the live agent and its progress, or what it waits on. */
function itemMark(t: TicketRow, me: Person | null): MarkModel {
  const a = t.attention;
  if (a.kind === "running") {
    const p = a.progress;
    return { kind: "run", name: p ? `${a.agent} ${stepText(p)}` : a.agent };
  }
  if (a.kind !== "waiting") return markOf(a, me);
  if (isMyMove(a.on, me)) return { kind: "you", ask: parkedAt(t, a.ask) };
  return { kind: "wait", name: `${parkedAt(t, a.ask)} · ${firstName(a.on?.name ?? "someone")}` };
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
        <Row
          key={t.key}
          kind="rack"
          action={{
            label: `Peek at ${t.key}: ${t.title}`,
            run: () => {
              onOpen(t.key);
            },
          }}
        >
          <Mark {...itemMark(t, me)} />
          <Text tone={t.attention.kind === "running" ? "1" : "2"} truncate title={t.title}>
            {t.title}
          </Text>
        </Row>
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
        <Stack dir="row" gap={8} align="center">
          <Text variant="meta" weight={500}>
            Now
          </Text>
          <Text variant="meta">{`${String(live)} agents at work across ${plural(repos.length, "repo")} · ${String(queued)} waiting for a runner`}</Text>
          <Stack grow />
          {(
            [
              ["run", "Running"],
              ["wait", "Waiting on someone"],
              ["you", "Needs you"],
              ["blk", "Blocked"],
              ["queued", "Queued"],
            ] as const
          ).map(([kind, word]) => (
            <Stack key={kind} dir="row" gap={3} align="center">
              <Mark kind={kind} glyph />
              <Text variant="meta">{word}</Text>
            </Stack>
          ))}
        </Stack>
        {board.pending ? <Notice kind="status">Loading</Notice> : null}
        {board.error ? (
          <Notice kind="status" error>{`Can't reach the server · ${board.error.message}`}</Notice>
        ) : null}
        <Surface pad={6}>
          <Table columns={COLUMNS} scroll={false}>
            {repos.map((repo) => {
              const work = shown.filter(
                (t) =>
                  t.repo === repo.name &&
                  t.attention.kind !== "inbox" &&
                  t.attention.kind !== "done",
              );
              const owners = rows.flatMap((t) =>
                t.repo === repo.name && t.owner ? [t.owner] : [],
              );
              const people = [...new Map(owners.map((p) => [p.id, p])).values()];
              return (
                <Row key={repo.name} kind="band">
                  <Stack gap={5} align="start">
                    <Stack gap={1}>
                      <Text variant="heading" as="h2">
                        {repoShort(repo.name)}
                      </Text>
                      <Text variant="code">{repo.name}</Text>
                    </Stack>
                    <Avatar people={people.map((p) => ({ name: p.name, seed: String(p.id) }))} />
                    <Button variant="link" href={`/compact?repo=${encodeURIComponent(repo.name)}`}>
                      Open list →
                    </Button>
                  </Stack>
                  {STAGES.map((st) => (
                    <Cell
                      key={st.phase}
                      items={work.filter((t) => t.phase === st.phase)}
                      me={me}
                      onOpen={open}
                    />
                  ))}
                </Row>
              );
            })}
          </Table>
        </Surface>
        <Text variant="meta">Inbox and merged work live in each repo&apos;s list.</Text>
      </Stack>
    </Page>
  );
}

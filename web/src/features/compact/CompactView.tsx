// Compact: every ticket, one line each, grouped by what it waits on. `?f=` keeps one group, `?q=`
// searches, and `?open=KEY` expands one row in place: the move, the plan and the last message.
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useMessages, usePlan } from "../../api/queries";
import type { Person, TicketRow } from "../../api/types";
import {
  edgeOf,
  groupOf,
  type Group,
  runLine,
  stageModel,
  stagesText,
  stepText,
} from "../../domain/board";
import { age, plural, repoShort } from "../../domain/format";
import { parsePlan, unsectioned } from "../../domain/plan";
import {
  Age,
  Avatar,
  Badge,
  Button,
  Checklist,
  type Column,
  Head,
  Icon,
  Mark,
  Meter,
  Notice,
  Page,
  Row,
  Segmented,
  Stack,
  Stepper,
  Surface,
  Table,
  Text,
  Thread,
} from "../../kit";
import { ActionButton, expandedActions } from "../shared/Actions";
import { contextOf, threadMessage, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import {
  footOf,
  moveText,
  nowCell,
  parseFilter,
  pills,
  searched,
  sections,
  sourceText,
  type Summary,
} from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Ref", width: "sm" },
  { label: "Stage", width: "xl" },
  { label: "Ticket", width: "fill" },
  { label: "Now", width: "fill" },
  { label: "Source", width: "lg" },
  { label: "People", width: "xs" },
  { label: "Upd", width: "xs", end: true },
];

const PLAN_MAX = 6;

function NowText({ t, me }: { t: TicketRow; me: Person | null }) {
  const cell = nowCell(t, me);
  switch (cell.kind) {
    case "run":
      return (
        <Stack dir="row" gap={4} align="center">
          <Text tone="live" weight={500}>
            {cell.agent}
          </Text>
          <Text tone="2" truncate title={cell.step}>
            {cell.step}
          </Text>
          {cell.progress ? (
            <>
              <Meter size="row" done={cell.progress.done} total={cell.progress.total} />
              <Text variant="meta" tabular>
                {stepText(cell.progress)}
              </Text>
            </>
          ) : null}
        </Stack>
      );
    case "outcome":
      return (
        <Text tone="2" truncate>
          <Text {...(cell.abandoned ? { tone: "blocked" as const, weight: 600 as const } : {})}>
            {cell.word}
          </Text>
          {cell.note ? ` · ${cell.note}` : null}
        </Text>
      );
    case "empty":
      return null;
    case "mark":
      return (
        <Stack dir="row" gap={3} align="center">
          <Mark {...cell.mark} />
          <Text tone="2" truncate title={cell.text}>
            {cell.text}
          </Text>
        </Stack>
      );
  }
}

function Expanded({ t, me, now }: { t: TicketRow; me: Person | null; now: number }) {
  const plan = parsePlan(usePlan(t.key).data ?? "");
  const last = useMessages(t.key).data?.items.at(-1);
  const move = moveText(t, me);
  const a = t.attention;
  const [, setParams] = useSearchParams();
  return (
    <Stack dir="row" gap={10}>
      <Stack grow gap={2}>
        <Text variant="meta" weight={500}>
          {move.label}
        </Text>
        <Text variant="label">{move.lead}</Text>
        <Text tone="3">{`Owner ${t.owner?.name ?? "nobody"} · ${stagesText(t)}`}</Text>
        <Stack dir="row" gap={3} wrap>
          {expandedActions(t.actions).map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
          <Button
            size="sm"
            onClick={() => {
              setParams((p) => {
                const out = new URLSearchParams(p);
                out.set("peek", t.key);
                return out;
              });
            }}
          >
            Peek
          </Button>
          <Button size="sm" href={`/t/${t.key}`}>
            Open ticket
          </Button>
        </Stack>
      </Stack>
      <Stack grow gap={4}>
        {a.kind === "running" ? (
          <Stack dir="row" gap={3} align="center">
            <Mark kind="run" glyph />
            <Text variant="meta" tone="live" weight={500}>
              {runLine(t, now)}
            </Text>
          </Stack>
        ) : (
          <Text variant="meta" weight={500}>
            {t.plan ? `Plan · ${String(t.plan.done)} of ${String(t.plan.total)} done` : "Plan"}
          </Text>
        )}
        {plan.length > 0 ? (
          <Checklist
            items={unsectioned(plan).slice(0, PLAN_MAX)}
            more={Math.max(0, plan.length - PLAN_MAX)}
          />
        ) : (
          <Text tone="3">No plan yet.</Text>
        )}
        <Stepper model={stageModel(t, me)} look="steps" compact />
      </Stack>
      <Stack grow gap={4}>
        <Text variant="meta" weight={500}>{`Talk · ${plural(t.messages, "message")}`}</Text>
        {last ? (
          <Thread look="last" messages={[threadMessage(last, me)]} />
        ) : (
          <Text tone="3">Nobody has said anything yet.</Text>
        )}
      </Stack>
    </Stack>
  );
}

function CompactRow({
  t,
  me,
  now,
  open,
  onToggle,
}: {
  t: TicketRow;
  me: Person | null;
  now: number;
  open: boolean;
  onToggle: () => void;
}) {
  const g = groupOf(t, me);
  return (
    <Row
      look={g === "done" ? "flat" : g === "needs_you" ? "you" : "raised"}
      edge={edgeOf(t, me)}
      action={{ label: `${t.key}: ${t.title}`, run: onToggle }}
      open={open}
      more={<Expanded t={t} me={me} now={now} />}
    >
      <Badge kind="key">{t.key}</Badge>
      <Stepper model={stageModel(t, me)} />
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
      <NowText t={t} me={me} />
      <Text variant="meta" truncate>
        {sourceText(t)}
      </Text>
      {t.owner ? <Avatar name={t.owner.name} seed={String(t.owner.id)} /> : <Avatar />}
      <Text
        tone={g === "needs_you" ? "1" : g === "done" ? "3" : "2"}
        weight={g === "needs_you" ? 600 : undefined}
      >
        <Age text={g === "running" ? "now" : age(t.since, now)} />
      </Text>
    </Row>
  );
}

function SummaryText({ summary }: { summary: Summary }) {
  if (summary === null) return null;
  switch (summary.kind) {
    case "text":
      return summary.strong ? (
        <Text variant="meta" tone="2">
          {summary.text === "yours" ? (
            <Text weight={600} tone="1">
              {summary.strong}
            </Text>
          ) : (
            `${summary.text} `
          )}
          {summary.text === "yours" ? (
            " yours"
          ) : (
            <Text weight={600} tone="1">
              {summary.strong}
            </Text>
          )}
        </Text>
      ) : (
        <Text variant="meta" tone="2">
          {summary.text}
        </Text>
      );
    case "note":
      return (
        <Stack dir="row" gap={3} align="center">
          <Icon name="arrow" />
          <Text variant="meta" tone="1" weight={500}>
            {summary.text}
          </Text>
        </Stack>
      );
    case "shipped":
      return (
        <Stack dir="row" gap={3} align="center">
          <Icon name="tick-sm" />
          <Text variant="meta" tone="2">
            <Text weight={600} tone="done">{`${String(summary.n)} shipped`}</Text> this week
          </Text>
        </Stack>
      );
  }
}

/** Esc collapses the open row (while no peek has it); Esc in a field is the field's own (the search
 *  clears). */
function useCollapseOnEsc(active: boolean, collapse: () => void) {
  const latest = useRef(collapse);
  useEffect(() => {
    latest.current = collapse;
  });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target instanceof HTMLInputElement)) latest.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);
}

export function CompactView() {
  const board = useBoard();
  const space = useSpace();
  const { me, now } = board;
  const [params, setParams] = useSearchParams();
  const { query, search } = useSearch();
  const filter = parseFilter(params.get("f"));
  const open = params.get("open");
  const [flipped, setFlipped] = useState<ReadonlySet<Group>>(new Set());
  const repo = params.get("repo");
  useCollapseOnEsc(open !== null && params.get("peek") === null, () => {
    setParam("open", null);
  });
  const listed = searched(board.rows, query).filter(
    (t) => (filter === "all" || groupOf(t, me) === filter) && (repo === null || t.repo === repo),
  );
  const foot = footOf(listed);
  const setParam = (key: string, value: string | null) => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      if (value === null) out.delete(key);
      else out.set(key, value);
      return out;
    });
  };
  return (
    <Page
      title="Compact"
      context={contextOf(space, repo ? `Every ticket · ${repoShort(repo)}` : "Every ticket")}
      action={<NewTicket />}
      middle={
        <Segmented
          label="Filter"
          items={pills(board.rows, me, filter)}
          value={filter}
          onChange={(id) => {
            setParam("f", id === "all" ? null : id);
          }}
        />
      }
      search={search}
    >
      <Surface fill>
        <Table
          columns={COLUMNS}
          foot={
            <>
              {[
                ["↵", "Expand"],
                ["Esc", "Collapse"],
                ["/", "Search"],
              ].map(([key, word]) => (
                <Stack key={key} dir="row" gap={3} align="center">
                  <Badge kind="kbd">{key ?? ""}</Badge>
                  <Text variant="meta">{word}</Text>
                </Stack>
              ))}
              <Stack grow />
              <Stack dir="row" gap={3} align="center">
                <Text variant="meta" tone="2">
                  <Text weight={600} tone="1">
                    {String(foot.tickets)}
                  </Text>
                  {foot.tickets === 1 ? " ticket" : " tickets"}
                </Text>
                <Text variant="meta">·</Text>
                {foot.projects.map((p) => (
                  <Badge key={p} kind="key" size="sm">
                    {p}
                  </Badge>
                ))}
                <Text variant="meta">·</Text>
                <Text variant="meta" tone="2">
                  <Text weight={600} tone="1">
                    {String(foot.repos)}
                  </Text>
                  {foot.repos === 1 ? " repo" : " repos"}
                </Text>
              </Stack>
            </>
          }
        >
          {board.pending ? <Notice kind="status">Loading</Notice> : null}
          {board.error ? (
            <Notice kind="status" error>{`Can't reach the server · ${board.error.message}`}</Notice>
          ) : null}
          {sections(listed, me, now, filter === "all" && query.length === 0).map((sec) => {
            if (sec.kind === "empty")
              return (
                <Notice key={`empty-${sec.id}`} kind="empty" lead={sec.lead}>
                  {sec.note}
                </Notice>
              );
            const g = sec.group;
            const collapsed = (g.id === "done" && filter !== "done") !== flipped.has(g.id);
            return [
              <Head
                key={`head-${g.id}`}
                name={g.title}
                count={g.items.length}
                icon={<Mark kind={g.mark} glyph small />}
                tone={g.id === "needs_you" ? "you" : g.id === "done" ? "done" : "neutral"}
                summary={<SummaryText summary={g.summary} />}
                fold={{
                  open: !collapsed,
                  toggle: () => {
                    setFlipped((prev) => {
                      const next = new Set(prev);
                      if (!next.delete(g.id)) next.add(g.id);
                      return next;
                    });
                  },
                }}
              />,
              ...(collapsed
                ? []
                : g.items.map((t) => (
                    <CompactRow
                      key={t.key}
                      t={t}
                      me={me}
                      now={now}
                      open={open === t.key}
                      onToggle={() => {
                        setParam("open", open === t.key ? null : t.key);
                      }}
                    />
                  ))),
            ];
          })}
        </Table>
      </Surface>
    </Page>
  );
}

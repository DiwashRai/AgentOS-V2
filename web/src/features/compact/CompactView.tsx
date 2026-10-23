// Compact: every ticket, one line each, grouped by what it waits on. `?f=` keeps one group, `?q=`
// searches, and `?open=KEY` expands one row in place: the move, the plan and the last message.
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useMessages, usePlan } from "../../api/queries";
import type { Person, TicketRow } from "../../api/types";
import {
  groupOf,
  type Group,
  type MarkModel,
  runLine,
  stageModel,
  stagesText,
} from "../../domain/board";
import { plural, repoShort } from "../../domain/format";
import { parsePlan, unsectioned } from "../../domain/plan";
import {
  Badge,
  Button,
  Checklist,
  type Column,
  Head,
  Mark,
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
  chipWords,
  footOf,
  moveText,
  nowLine,
  parseFilter,
  pills,
  searched,
  sections,
} from "./model";
import { KeyCell, LINE_END, lineEnd, TitleCell } from "./TicketLine";

// Linear's list: the key and the title on the left, what it waits on receding after the title;
// then the row's one tag (its Now: the agent and its step, who it waits on), hugging the plain
// properties at the far end, so the title line takes every width they leave. One row of quiet
// column labels over the board names the plain columns, so they read down it as a ledger (the
// tag and the face say what they are).
const COLUMNS: readonly Column[] = [
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill", min: "2xl" },
  { label: "Now", width: "xl", hug: true, end: true },
  ...LINE_END,
];

/** The Now: what a line waits on beyond its glyph, group and stage, in plain words (no box), its step
 *  count quieter after them. */
function NowTag({ mark, count }: { mark: MarkModel | null; count: string | null }) {
  if (!mark) return <Stack />;
  const words = chipWords(mark);
  return (
    <Text variant="meta" tone="2" truncate title={[words, count].filter(Boolean).join(" · ")}>
      {words}
      {count ? <Text tone="3" tabular>{`\u2002${count}`}</Text> : null}
    </Text>
  );
}

const PLAN_MAX = 6;

function Expanded({ t, me, now }: { t: TicketRow; me: Person | null; now: number }) {
  const plan = parsePlan(usePlan(t.key).data ?? "");
  const last = useMessages(t.key).data?.items.at(-1);
  const move = moveText(t, me);
  const a = t.attention;
  const [, setParams] = useSearchParams();
  return (
    <Stack gap={6}>
      <Stepper model={stageModel(t, me)} compact />
      <Stack dir="row" gap={10}>
        <Stack grow gap={6}>
          <Stack gap={2}>
            <Text variant="meta" weight={500}>
              {move.label}
            </Text>
            <Text variant="label">{move.lead}</Text>
            <Text tone="3">{`Owner ${t.owner?.name ?? "nobody"} · ${stagesText(t)}`}</Text>
          </Stack>
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
          <Stack gap={4}>
            <Text variant="meta" weight={500}>{`Talk · ${plural(t.messages, "message")}`}</Text>
            {last ? (
              <Thread look="last" messages={[threadMessage(last, me)]} />
            ) : (
              <Text tone="3">Nobody has said anything yet.</Text>
            )}
          </Stack>
        </Stack>
        <Stack grow gap={4}>
          {a.kind === "running" ? (
            <Stack dir="row" gap={3} align="center">
              <Mark kind="run" glyph name="Running" />
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
        </Stack>
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
  const line = nowLine(t, me);
  return (
    <Row
      action={{ label: `${t.key}: ${t.title}`, run: onToggle }}
      open={open}
      more={<Expanded t={t} me={me} now={now} />}
    >
      <KeyCell t={t} />
      <TitleCell t={t} me={me} after={line.after} />
      <NowTag mark={line.chip} count={line.count} />
      {lineEnd({ t, me, now, ...(g === "running" ? { age: "now" } : {}) })}
    </Row>
  );
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
          {sections(listed, me, filter === "all" && query.length === 0).map((sec) => {
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
                icon={<Mark kind={g.mark} glyph name={false} />}
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

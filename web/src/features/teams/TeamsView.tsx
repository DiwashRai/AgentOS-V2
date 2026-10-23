// All teams (new in V2): every ticket in flight across the org's repos, as one table (Linear's list
// grouped by team). Each ticket is a line on the page's column grid, its facts reading down the
// list as a ledger: the key; its state's glyph and the title; the stage it is at; its state in
// words (a running agent's steps on a still meter); its owner; how long it has been so. The repos
// are its groups, in the Space's order, each under a head that carries the repo, its path, who
// works there and how many of its tickets are in flight, with its list at the head's end; inside a
// group the rows run down the stages.
// A repo with nothing in flight is one quiet line at the foot. Click a row to peek.
import { useSearchParams } from "react-router";

import { useSettings } from "../../api/queries";
import type { Person, TicketRow } from "../../api/types";
import { groupOf, markOf, stageModel, STATE_WORD } from "../../domain/board";
import { age, firstName, plural, repoShort } from "../../domain/format";
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
  Segmented,
  Stack,
  Surface,
  Table,
  Text,
} from "../../kit";
import { parseFilter, pills, stageWord } from "../compact/model";
import { contextOf, useBoard, useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import { groupsOf, type RepoGroup, STAGE, stageCounts, stateOf } from "./model";

// The page's one grid, labelled once over the groups: the key, the title taking what the plain
// columns leave, then the stage, the state (wide enough for a run's agent, steps and meter), the
// owner's face and name, the age.
const COLUMNS: readonly Column[] = [
  { label: "Key", width: "sm" },
  { label: "Ticket", width: "fill", min: "2xl" },
  { label: "Stage", width: "sm" },
  { label: "State", width: "2xl" },
  { label: "Owner", width: "md" },
  { label: "Age", width: "xs", end: true },
];

/** The table's foot: how much is at each stage across the repos (where work piles up), and where the
 *  rest of the work lives. */
function Legend({ stages }: { stages: readonly { name: string; n: number }[] }) {
  return (
    <>
      <Text variant="meta" tone="2" tabular>
        <Text weight={600} tone="1">
          {String(stages.reduce((n, st) => n + st.n, 0))}
        </Text>
        {" in flight"}
        {stages.map((st) => (
          <Text key={st.name} tone={st.n > 0 ? "2" : "3"}>
            {` · ${st.name} `}
            <Text weight={600} tone={st.n > 0 ? "1" : "3"}>
              {String(st.n)}
            </Text>
          </Text>
        ))}
      </Text>
      <Text variant="meta">Inbox and merged work live in each repo&apos;s list.</Text>
    </>
  );
}

/** The state's glyph and the title, firm; a queued run's title recedes a step, as My queue's: nothing
 *  is at work on it yet. */
function TitleCell({ t, me }: { t: TicketRow; me: Person | null }) {
  const a = t.attention;
  const kind = markOf(a, me).kind;
  return (
    <Stack dir="row" gap={4} align="center">
      <Mark
        kind={kind}
        glyph
        name={STATE_WORD[kind]}
        progress={a.kind === "running" ? a.progress : null}
      />
      <Text weight={500} tone={a.kind === "queued" ? "2" : "1"} truncate title={t.title}>
        {t.title}
      </Text>
    </Stack>
  );
}

const INK = { you: "you", firm: "1", live: "2", plain: "2", quiet: "3" } as const;

/** The state in words: your move in the accent; a running agent firm, its step count quieter and
 *  its still meter at the column's end (a queued run's dashed), so the meters line up. */
function StateCell({ t, me }: { t: TicketRow; me: Person | null }) {
  const st = stateOf(t, me);
  const run = st.run;
  return (
    <Stack dir="row" gap={5} align="center" justify="between" grow>
      <Text
        tone={INK[st.tone]}
        {...(st.tone === "plain" || st.tone === "quiet" ? {} : { weight: 500 as const })}
        truncate
        title={st.say}
      >
        {st.text}
        {run !== null && run !== "queued" && run.step ? (
          <Text tone="3" weight={400} tabular>{`\u2002${run.step}`}</Text>
        ) : null}
      </Text>
      {run === "queued" ? <Meter size="list" queued /> : null}
      {run !== null && run !== "queued" && run.progress ? (
        <Meter size="list" done={run.progress.done} total={run.progress.total} />
      ) : null}
    </Stack>
  );
}

/** Who owns it: their face and first name; nobody, a dashed ring. */
function OwnerCell({ owner }: { owner: Person | null }) {
  return (
    <Stack dir="row" gap={4} align="center">
      {owner ? <Avatar name={owner.name} seed={String(owner.id)} beside /> : <Avatar dashed />}
      <Text tone={owner ? "2" : "3"} truncate>
        {owner ? firstName(owner.name) : "Nobody"}
      </Text>
    </Stack>
  );
}

function TicketLine({
  t,
  me,
  now,
  onOpen,
}: {
  t: TicketRow;
  me: Person | null;
  now: number;
  onOpen: (key: string) => void;
}) {
  const stage = stageWord(stageModel(t, me));
  return (
    <Row
      action={{
        label: `Peek at ${t.key}: ${t.title}`,
        run: () => {
          onOpen(t.key);
        },
      }}
    >
      <Badge kind="key">{t.key}</Badge>
      <TitleCell t={t} me={me} />
      <Text tone="2" truncate title={stage.path}>
        {STAGE[t.phase] ?? stage.word}
      </Text>
      <StateCell t={t} me={me} />
      <OwnerCell owner={t.owner} />
      <Text variant="meta" tone="3">
        <Age text={age(t.since, now)} />
      </Text>
    </Row>
  );
}

function OpenList({ repo }: { repo: string }) {
  return (
    <Button
      variant="link"
      icon="compact"
      href={`/compact?repo=${encodeURIComponent(repo)}`}
      title={`Every ticket in ${repoShort(repo)}`}
    >
      Open list
    </Button>
  );
}

/** Who works there, by first name (read at a glance where a row of tiny faces isn't). */
const teamOf = (people: readonly Person[]) => people.map((p) => firstName(p.name)).join(", ");

/** A repo's group: its head (the repo, how many in flight, its path and people, its list), then a
 *  line per ticket. */
function RepoSection({
  g,
  me,
  now,
  onOpen,
}: {
  g: RepoGroup;
  me: Person | null;
  now: number;
  onOpen: (key: string) => void;
}) {
  return (
    <Surface level="list" label={repoShort(g.repo)}>
      <Head
        icon={<Icon name="repo" />}
        name={repoShort(g.repo)}
        count={g.rows.length}
        note={[g.repo, teamOf(g.people)].filter(Boolean).join(" · ")}
        summary={<OpenList repo={g.repo} />}
      />
      {g.rows.map((t) => (
        <TicketLine key={t.key} t={t} me={me} now={now} onOpen={onOpen} />
      ))}
    </Surface>
  );
}

/** The repos with nothing in flight, one quiet line each: the repo, its path and people, its list. */
function QuietSection({ quiet }: { quiet: readonly RepoGroup[] }) {
  return (
    <Surface level="list" label="Quiet repos">
      <Head name="Quiet repos" count={quiet.length} note="Nothing in flight" />
      {quiet.map((g) => (
        <Row key={g.repo}>
          <Stack dir="row" gap={4} align="center">
            <Text variant="meta">
              <Icon name="repo" />
            </Text>
            <Text weight={500} tone="2" truncate>
              {repoShort(g.repo)}
            </Text>
          </Stack>
          <Text tone="3" truncate>
            {[g.repo, teamOf(g.people)].filter(Boolean).join(" · ")}
          </Text>
          <OpenList repo={g.repo} />
        </Row>
      ))}
    </Surface>
  );
}

export function TeamsView() {
  const board = useBoard();
  const { rows, me, now } = board;
  const repos = useSettings().data?.repos.value ?? [];
  const space = useSpace();
  const { query, search } = useSearch("Jump to a repo or ticket");
  const [params, setParams] = useSearchParams();
  // the bar's chips, as Compact's and with its `?f=`: one pressed lists that group's tickets alone
  const filter = parseFilter(params.get("f"));
  const open = (key: string) => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      out.set("peek", key);
      return out;
    });
  };
  const { active, quiet } = groupsOf(
    rows.filter((t) => filter === "all" || groupOf(t, me) === filter),
    repos.map((r) => r.name),
    me,
    query,
  );
  return (
    <Page
      title="All teams"
      context={contextOf(space, plural(repos.length, "repo"))}
      action={<NewTicket />}
      middle={
        <Segmented
          label="Filter"
          items={pills(rows, me, filter)}
          value={filter}
          onChange={(id) => {
            setParams((p) => {
              const out = new URLSearchParams(p);
              if (id === "all") out.delete("f");
              else out.set("f", id);
              return out;
            });
          }}
        />
      }
      search={search}
    >
      <Table columns={COLUMNS} edge foot={<Legend stages={stageCounts(active)} />}>
        {board.pending ? <Notice kind="status">Loading</Notice> : null}
        {board.error ? (
          <Notice kind="status" error>{`Can't reach the server · ${board.error.message}`}</Notice>
        ) : null}
        {active.map((g) => (
          <RepoSection key={g.repo} g={g} me={me} now={now} onOpen={open} />
        ))}
        {filter === "all" && quiet.length > 0 ? <QuietSection quiet={quiet} /> : null}
      </Table>
    </Page>
  );
}

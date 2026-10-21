// Intake: per saved query, the Jira issues not taken in yet, each a "Take in" away from the Inbox.
// Every row lights up on hover; the key opens Jira; the button takes it in. W0 is
// static, so Take in does nothing yet.
import { useState } from "react";

import { useIntake, useNow, useSession } from "../../api/queries";
import type { IntakeIssue, IntakeQuery } from "../../api/types";
import {
  Age,
  Avatar,
  Badge,
  Button,
  type Column,
  Head,
  Icon,
  Notice,
  Page,
  Row,
  Stack,
  Surface,
  Swap,
  Table,
  Text,
} from "../../kit";
import { useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import {
  ageLabel,
  ageTitle,
  emptyText,
  footNote,
  headSummary,
  issueFacts,
  issuesOf,
  jqlHref,
  metaFact,
  sharedPrefix,
  toTakeIn,
  visible,
} from "./model";

// One triage inbox, as Linear's Triage: no cards. The list runs out to the sheet's edges under the
// bar, each saved query a run of it under a quiet ruled head (no fill) that stays at the top while
// its run scrolls past, the runs parted by room alone. An issue is Linear's triage row, two lines
// on two ends: the title firm, the Jira key (a link to it) across from it; under them who has it,
// a small face leading the name (Unassigned a dashed ring), and one fact (a priority worth saying,
// led by its bars, else the Jira status; the rest in its tooltip), across from the age ("1h ago",
// in its largest unit; to the minute in its tooltip). Under the pointer or with focus, Take in
// takes the age's place. When the queries were checked sits in the list's foot, on the sheet's
// floor. No column head: the cells say what they are.
const COLUMNS: readonly Column[] = [
  { label: "Issue", width: "fill" },
  { label: "Key and age", width: "lg", end: true, hug: true },
];

/** Muted words a step under the title (13px regular), the row's second line. */
function Quiet({ children, title }: { children: string; title?: string }) {
  return (
    <Text variant="ui" tone="3" truncate {...(title ? { title } : {})}>
      {children}
    </Text>
  );
}

function Meta({ issue }: { issue: IntakeIssue }) {
  const fact = metaFact(issue);
  return (
    <Stack dir="row" gap={3} align="center">
      <Stack dir="row" gap={4} align="center">
        {issue.assignee ? <Avatar name={issue.assignee} beside /> : <Avatar dashed />}
        <Quiet>{issue.assignee ?? "Unassigned"}</Quiet>
      </Stack>
      <Quiet>·</Quiet>
      <Stack dir="row" gap={2} align="center">
        {fact.priority ? <Icon name={fact.priority} /> : null}
        <Quiet title={issueFacts(issue)}>{fact.text}</Quiet>
      </Stack>
    </Stack>
  );
}

function IssueRow({ issue, now }: { issue: IntakeIssue; now: number }) {
  return (
    <Row kind="item">
      <Stack gap={3} grow>
        <Text variant="label" truncate title={issue.title}>
          {issue.title}
        </Text>
        <Meta issue={issue} />
      </Stack>
      <Stack gap={1} align="end">
        <Button variant="link" href={issue.url} title={`Open ${issue.key} in Jira`}>
          <Badge kind="key">{issue.key}</Badge>
        </Button>
        <Swap
          hover={
            <Button size="xs" title={`Take in ${issue.key}`}>
              Take in
            </Button>
          }
        >
          <Text variant="ui" tone="3" tabular>
            <Age text={ageLabel(issue.updated_at, now)} title={ageTitle(issue.updated_at, now)} />
          </Text>
        </Swap>
      </Stack>
    </Row>
  );
}

/** The far end of a group's label: "50 of 73 match" at rest; under the pointer, the query itself,
 *  opened in Jira. With no Jira to open, the JQL stays in view. */
function LabelEnd({ q, jiraUrl }: { q: IntakeQuery; jiraUrl: string | null }) {
  const summary = headSummary(q);
  const said = summary ? <Quiet>{summary}</Quiet> : null;
  if (!jiraUrl) {
    return (
      <Stack dir="row" gap={6} align="center" justify="end">
        {said}
        <Text variant="code" tone="3" truncate title={q.jql}>
          {q.jql}
        </Text>
      </Stack>
    );
  }
  return (
    <Swap
      hover={
        <Button
          variant="link"
          icon="out"
          title={`Open in Jira: ${q.jql}`}
          href={jqlHref(jiraUrl, q.jql)}
        >
          Open in Jira
        </Button>
      }
    >
      {said}
    </Swap>
  );
}

interface LabelProps {
  q: IntakeQuery;
  count: number;
  jiraUrl: string | null;
  collapsed: boolean;
  toggle: () => void;
}

/** A query's head: a quiet ruled line, no fill, held at the list's top while its run scrolls. The
 *  chevron hung in the gutter, the muted project key, the name (bold), the count muted; a click
 *  anywhere on it but its end (or Enter on it) folds the run to its head. */
function GroupLabel({ q, count, jiraUrl, collapsed, toggle }: LabelProps) {
  const prefix = sharedPrefix(q);
  return (
    <Head
      level="line"
      name={q.name}
      icon={prefix ?? undefined}
      {...(count > 0 ? { count } : {})}
      note={q.result.kind === "error" ? "didn't answer" : undefined}
      summary={<LabelEnd q={q} jiraUrl={jiraUrl} />}
      fold={{ open: !collapsed, toggle }}
    />
  );
}

interface GroupProps {
  q: IntakeQuery;
  query: readonly string[];
  jiraUrl: string | null;
  now: number;
}

function Group({ q, query, jiraUrl, now }: GroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const issues = issuesOf(q, query);
  const { shown, rest } = visible(issues, expanded);
  const empty = emptyText(q, query.length > 0);
  return (
    <Surface level="list" label={q.name}>
      <GroupLabel
        q={q}
        count={issues.length}
        jiraUrl={jiraUrl}
        collapsed={collapsed}
        toggle={() => {
          setCollapsed((c) => !c);
        }}
      />
      {collapsed ? null : q.result.kind === "error" ? (
        <Notice
          kind="problem"
          align="item"
          fix={{
            before: "An admin can fix the query in",
            link: { label: "Settings › Intake", href: "/settings" },
            after: ".",
          }}
        >
          {q.result.message}
        </Notice>
      ) : issues.length === 0 ? (
        <Notice kind="empty" align="item" lead={empty.lead}>
          {empty.note}
        </Notice>
      ) : (
        <>
          {shown.map((issue) => (
            <IssueRow key={issue.key} issue={issue} now={now} />
          ))}
          {rest > 0 ? (
            <Notice
              kind="more"
              more={{
                label: `Show ${String(rest)} more`,
                title: `Show all ${String(issues.length)}`,
                run: () => {
                  setExpanded(true);
                },
              }}
            />
          ) : null}
        </>
      )}
    </Surface>
  );
}

export function IntakeView() {
  const intake = useIntake();
  const space = useSpace();
  const jiraUrl = useSession().data?.jira_url ?? null;
  const { query, search } = useSearch();
  const now = useNow(30_000);
  const data = intake.data;
  return (
    <Page
      title="Intake"
      context={space}
      action={<NewTicket />}
      {...(data
        ? {
            counters: [
              { n: toTakeIn(data), label: "to take in" },
              { n: data.queries.length, label: data.queries.length === 1 ? "query" : "queries" },
            ],
          }
        : {})}
      search={search}
    >
      <Table columns={COLUMNS} head={false} edge {...(data ? { foot: footNote(data, now) } : {})}>
        {data ? (
          data.queries.map((q) => (
            <Group key={q.name} q={q} query={query} jiraUrl={jiraUrl} now={now} />
          ))
        ) : intake.error ? (
          <Notice kind="status" error>
            {`Can't reach the server · ${intake.error.message}`}
          </Notice>
        ) : (
          <Notice kind="status">Loading</Notice>
        )}
      </Table>
    </Page>
  );
}

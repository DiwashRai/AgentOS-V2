// Intake: per saved query, the Jira issues not taken in yet, each a "Take in" away from the Inbox.
// Every row is raised and lights up on hover; the key opens Jira; the button takes it in. W0 is
// static, so Take in does nothing yet.
import { useState } from "react";

import { useIntake, useNow, useSession } from "../../api/queries";
import type { IntakeIssue, IntakeQuery } from "../../api/types";
import { age } from "../../domain/format";
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
  Table,
  Text,
} from "../../kit";
import { useSpace } from "../shared/board";
import { NewTicket } from "../shared/NewTicket";
import { useSearch } from "../shared/useSearch";
import {
  emptyText,
  footNote,
  headSummary,
  issuesOf,
  jqlHref,
  sharedPrefix,
  toTakeIn,
  TYPE_WORD,
  visible,
} from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Jira", width: "md" },
  { label: "Type", width: "md" },
  { label: "Issue", width: "fill" },
  { label: "Jira status", width: "lg" },
  { label: "Assignee", width: "xl" },
  { label: "Upd", width: "xs", end: true },
  { label: "", width: "sm", end: true },
];

function IssueRow({ issue, now }: { issue: IntakeIssue; now: number }) {
  return (
    <Row>
      <Badge kind="key" href={issue.url} title={`Open ${issue.key} in Jira`}>
        {issue.key}
      </Badge>
      <Stack dir="row" gap={4} align="center">
        <Icon name={issue.type} />
        <Text tone="2">{TYPE_WORD[issue.type]}</Text>
      </Stack>
      <Stack dir="row" gap={3} align="center">
        <Icon name={issue.priority} />
        <Text variant="label" truncate title={issue.title}>
          {issue.title}
        </Text>
      </Stack>
      <Badge kind="status" title={`Jira status: ${issue.status}`}>
        {issue.status}
      </Badge>
      {issue.assignee ? (
        <Stack dir="row" gap={4} align="center">
          <Avatar name={issue.assignee} />
          <Text tone="1" weight={500} truncate>
            {issue.assignee}
          </Text>
        </Stack>
      ) : (
        <Stack dir="row" gap={4} align="center">
          <Avatar dashed />
          <Text tone="3">Unassigned</Text>
        </Stack>
      )}
      <Text tone="2">
        <Age text={age(issue.updated_at, now)} />
      </Text>
      <Button variant="lit" size="sm" title={`Take in ${issue.key}`}>
        Take in
      </Button>
    </Row>
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
  const prefix = sharedPrefix(q);
  const summary = headSummary(q);
  const empty = emptyText(q, query.length > 0);
  return (
    <>
      <Head
        name={q.name}
        icon={
          prefix ? (
            <Badge kind="key" size="sm">
              {prefix}
            </Badge>
          ) : undefined
        }
        count={q.result.kind === "issues" ? issues.length : undefined}
        summary={
          <>
            {summary ? <Text variant="meta">{summary} ·</Text> : null}
            <Text variant="code" truncate title={q.jql}>
              {q.jql}
            </Text>
            {jiraUrl ? (
              <Button
                variant="quiet"
                size="xs"
                icon="out"
                title="Open in Jira"
                href={jqlHref(jiraUrl, q.jql)}
              />
            ) : null}
          </>
        }
        fold={{
          open: !collapsed,
          toggle: () => {
            setCollapsed((c) => !c);
          },
        }}
      />
      {collapsed ? null : q.result.kind === "error" ? (
        <Notice kind="problem" lead="Jira didn't answer">
          <Text>{q.result.message}</Text>
          <Text tone="3">An admin can fix the query in Settings › Intake</Text>
        </Notice>
      ) : issues.length === 0 ? (
        <Notice kind="empty" lead={empty.lead}>
          {empty.note}
        </Notice>
      ) : (
        <>
          {shown.map((issue) => (
            <IssueRow key={issue.key} issue={issue} now={now} />
          ))}
          {rest > 0 ? (
            <Notice kind="more" lead={`+${String(rest)} more`}>
              <Stack grow />
              <Button
                variant="link"
                onClick={() => {
                  setExpanded(true);
                }}
              >
                {`Show all ${String(issues.length)}`}
              </Button>
            </Notice>
          ) : null}
        </>
      )}
    </>
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
      <Surface fill>
        <Table
          columns={COLUMNS}
          foot={
            <>
              <Stack dir="row" gap={3} align="center">
                <Badge kind="kbd">/</Badge>
                <Text variant="meta">Search</Text>
              </Stack>
              <Stack dir="row" gap={3} align="center">
                <Badge kind="kbd">Esc</Badge>
                <Text variant="meta">Clear</Text>
              </Stack>
              <Stack grow />
              {data ? <Text variant="meta">{footNote(data, now)}</Text> : null}
            </>
          }
        >
          {data ? (
            data.queries.map((q) => (
              <Group key={q.name} q={q} query={query} jiraUrl={jiraUrl} now={now} />
            ))
          ) : intake.error ? (
            <Notice
              kind="status"
              error
            >{`Can't reach the server · ${intake.error.message}`}</Notice>
          ) : (
            <Notice kind="status">Loading</Notice>
          )}
        </Table>
      </Surface>
    </Page>
  );
}

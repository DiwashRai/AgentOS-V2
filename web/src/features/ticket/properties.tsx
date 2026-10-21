// A ticket's properties, as Linear's project page lists them: labelled rows of chips, each a muted
// icon and its value at body size (what it is, where its code lives, how it runs). The ticket page and the peek both draw them; the owner is
// the screen's own (a picker on the page, a face in the peek).
import type { ReactNode } from "react";

import type { Ticket } from "../../api/types";
import { stagesText } from "../../domain/board";
import { age } from "../../domain/format";
import { type Fact, Facts, Icon, Stack } from "../../kit";

const TYPE_WORD = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
} as const;
const FROM = { hand: "set by hand", jira: "from Jira", repo: "from the repo" } as const;

interface Row {
  label: string;
  items: Fact[];
}

function rows(t: Ticket, now: number, owner: ReactNode): Row[] {
  const what: Fact[] = [
    {
      label: "Type",
      value: (
        <>
          <Icon name={t.type} />
          {TYPE_WORD[t.type]}
        </>
      ),
    },
    ...(t.priority === "high"
      ? [
          {
            label: "Priority",
            value: (
              <>
                <Icon name="high" />
                High
              </>
            ),
          },
        ]
      : []),
    { label: "Owner", value: owner },
    {
      label: "Opened",
      value: (
        <>
          <Icon name="clock" />
          Opened
        </>
      ),
      note: `${age(t.created_at, now)} ago`,
    },
  ];
  const code: Fact[] = [
    {
      label: "Repo",
      value: (
        <>
          <Icon name="repo" />
          {t.repo ?? "No repo"}
        </>
      ),
    },
    ...(t.base_branch
      ? [
          {
            label: "Base branch",
            value: (
              <>
                <Icon name="branch" />
                {t.base_branch.name}
              </>
            ),
            note: FROM[t.base_branch.from],
          },
        ]
      : []),
    ...(t.source ? [{ label: "Jira", value: `Jira ${t.source.ref} ↗` }] : []),
  ];
  return [
    { label: "Properties", items: what },
    { label: "Code", items: code },
    {
      label: "Workflow",
      items: [
        {
          label: "Workflow",
          value: (
            <>
              <Icon name="workflow" />
              {`${t.workflow.name} v${String(t.workflow.version)}`}
            </>
          ),
          note: stagesText(t),
        },
      ],
    },
  ];
}

export function Properties({ t, now, owner }: { t: Ticket; now: number; owner: ReactNode }) {
  return (
    <Stack>
      {rows(t, now, owner).map((r) => (
        <Facts key={r.label} label={r.label} items={r.items} />
      ))}
    </Stack>
  );
}

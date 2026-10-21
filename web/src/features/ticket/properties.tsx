// A ticket's properties, as Linear lists them: labelled groups of chips, each a muted icon and its
// value at body size (what it is, where its code lives, how it runs); in rows across the peek, and
// stacked in the ticket page's rail as Linear's issue sidebar. The owner is the screen's own (a
// picker on the page, a face in the peek).
import type { ReactNode } from "react";

import type { Ticket } from "../../api/types";
import { stagesText } from "../../domain/board";
import { age } from "../../domain/format";
import { type Fact, Facts, Stack } from "../../kit";

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

/** The owner's fact: a picker on the ticket page, a face and a name in the peek. */
export type Owner = { picker: ReactNode } | { value: ReactNode };

function rows(t: Ticket, now: number, owner: Owner): Row[] {
  const what: Fact[] = [
    { label: "Type", icon: t.type, value: TYPE_WORD[t.type] },
    ...(t.priority === "high" ? [{ label: "Priority", icon: "high" as const, value: "High" }] : []),
    { label: "Owner", ...owner },
    { label: "Opened", icon: "clock", value: "Opened", note: `${age(t.created_at, now)} ago` },
  ];
  const code: Fact[] = [
    { label: "Repo", icon: "repo", value: t.repo ?? "No repo" },
    ...(t.base_branch
      ? [
          {
            label: "Base branch",
            icon: "branch" as const,
            value: t.base_branch.name,
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
          icon: "workflow",
          value: `${t.workflow.name} v${String(t.workflow.version)}`,
          note: stagesText(t),
        },
      ],
    },
  ];
}

interface PropertiesProps {
  t: Ticket;
  now: number;
  owner: Owner;
  /** Each row's head over its values, one a line: the ticket page's rail. */
  stack?: boolean;
}

export function Properties({ t, now, owner, stack = false }: PropertiesProps) {
  return (
    <Stack gap={stack ? 6 : 0}>
      {rows(t, now, owner).map((r) => (
        <Facts key={r.label} label={r.label} items={r.items} stack={stack} />
      ))}
    </Stack>
  );
}

// The library's agents (/library/agents): each agent's face and name, how it runs (runtime, model,
// effort) and what uses it (how many workflows, and tickets on them). A row opens the agent's editor.
import { useAgents, useRuntimes } from "../../api/queries";
import type { Agent } from "../../api/types";
import { matches } from "../../domain/format";
import { Avatar, type Column, Text } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { LibraryList, LibraryRow, NameCell, USED, usedCells } from "./list";
import { runtimeName } from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Agent", width: "fill", min: "xl" },
  { label: "Runtime", width: "lg" },
  { label: "Model", width: "md" },
  { label: "Effort", width: "md" },
  ...USED,
];

export function AgentsView() {
  const all = useAgents().data?.items ?? [];
  const runtimes = useRuntimes().data ?? [];
  const { query, search } = useSearch("Search agents");
  const shown = all.filter((a) =>
    matches([a.name, a.model, a.effort, runtimeName(runtimes, a.runtime)], query),
  );
  const href = (a: Agent) => `/library/agents/${a.id}`;
  return (
    <LibraryList
      title="Agents"
      noun="agent"
      columns={COLUMNS}
      search={search}
      total={all.length}
      hrefs={shown.map(href)}
    >
      {shown.map((a) => (
        <LibraryRow key={a.id} name={a.name} href={href(a)}>
          <NameCell lead={<Avatar name={a.name} seed={`agent:${a.id}`} beside />} name={a.name} />
          <Text tone="2">{runtimeName(runtimes, a.runtime)}</Text>
          <Text tone="2">{a.model}</Text>
          <Text tone="2">{a.effort}</Text>
          {usedCells(a.used_by)}
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

// An agent's editor (/library/agents/:id): its name and description, its instructions, and its
// runtime, model and effort as pickers beside them, in the shared item editor; the other agents a
// step or a pick away.
import { useParams } from "react-router";

import { loadOf, useAgent, useAgents } from "../../api/queries";
import { Page } from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { ItemEditor } from "../shared/itemEditor/ItemEditor";

const href = (id: string) => `/library/agents/${id}`;

export function AgentView() {
  const { id = "" } = useParams();
  const q = loadOf(useAgent(id));
  const all = useAgents().data?.items ?? [];
  if (q.kind !== "ready")
    return (
      <Page title={[{ label: "Agents", href: "/library/agents" }, id]}>
        <LoadNotice load={q} noun="agent" id={id} />
      </Page>
    );
  const a = q.data;
  return (
    <ItemEditor
      key={a.id}
      title={[{ label: "Agents", href: "/library/agents" }, a.name]}
      item={{
        ...a,
        body: {
          kind: "agent",
          agent: {
            instructions: a.instructions,
            runtime: a.runtime,
            model: a.model,
            effort: a.effort,
          },
        },
      }}
      contentTitle="Instructions"
      name={{ label: "Name", value: a.name }}
      description={a.description}
      usedBy={a.used_by}
      siblings={{
        noun: "agent",
        items: all.map((x) => ({ id: x.id, label: x.name })),
        current: a.id,
        href,
      }}
    />
  );
}

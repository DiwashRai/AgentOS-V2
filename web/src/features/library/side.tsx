// The item editor's properties, as Linear's project page lists them over its document: labelled
// rows of chips on one left edge with the content under them. Properties (an agent's runtime, model
// and effort as pickers in place; read-only facts as a muted glyph and their words), what uses the
// item (its workflows; its tickets as a count and the first few, the rest one click away), and its
// latest versions with who wrote each, a person or a ticket's run.
import { useState } from "react";

import { useNow, useRuntimes } from "../../api/queries";
import type { AgentSettings, Effort, RuntimeId, UsedBy, Version } from "../../api/types";
import { age, plural } from "../../domain/format";
import { Avatar, Button, type Fact, Facts, Icon, Select, Stack, Text } from "../../kit";
import { authorName } from "./model";

export type { Fact };

const EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

/** How many tickets "Used by" names before the rest fold into +N. */
const FEW = 2;

/** An agent's runtime, model and effort, each a picker in place; a new runtime starts on its first
 *  model. */
function useAgentPickers(agent: AgentSettings, onChange: (a: AgentSettings) => void): Fact[] {
  const runtimes = useRuntimes().data ?? [];
  const models = runtimes.find((r) => r.id === agent.runtime)?.models ?? [agent.model];
  return [
    {
      label: "Runtime",
      picker: (
        <Select
          label="Runtime"
          value={agent.runtime}
          options={runtimes.map((r) => ({ id: r.id, label: r.name }))}
          onChange={(id) => {
            const r = runtimes.find((x) => x.id === id);
            if (r) onChange({ ...agent, runtime: id as RuntimeId, model: r.models[0] ?? "" });
          }}
        />
      ),
    },
    {
      label: "Model",
      picker: (
        <Select
          label="Model"
          value={agent.model}
          options={models.map((m) => ({ id: m, label: m }))}
          onChange={(model) => {
            onChange({ ...agent, model });
          }}
        />
      ),
    },
    {
      label: "Effort",
      picker: (
        <Select
          label="Effort"
          value={agent.effort}
          options={EFFORTS.map((e) => ({ id: e, label: e }))}
          onChange={(effort) => {
            onChange({ ...agent, effort: effort as Effort });
          }}
        />
      ),
    },
  ];
}

/** The tickets: how many, the first few as links after it, and the rest behind +N, opened in
 *  place; one line, as its row's other values are. */
function Tickets({ keys }: { keys: readonly string[] }) {
  const [all, setAll] = useState(false);
  if (keys.length === 0) return <Text tone="3">No tickets</Text>;
  const shown = all ? keys : keys.slice(0, FEW);
  return (
    <Stack dir="row" gap={4} align="center" wrap>
      <Text>{plural(keys.length, "ticket")}</Text>
      <Keys shown={shown} />
      {keys.length > FEW ? (
        <Button
          variant="link"
          title={all ? "Show the first few" : `Show all ${String(keys.length)}`}
          onClick={() => {
            setAll(!all);
          }}
        >
          {all ? "Fewer" : `+${String(keys.length - FEW)}`}
        </Button>
      ) : null}
    </Stack>
  );
}

function Keys({ shown }: { shown: readonly string[] }) {
  return (
    <>
      {shown.map((key) => (
        <Button key={key} variant="link" href={`/t/${key}`}>
          {key}
        </Button>
      ))}
    </>
  );
}

/** The workflows that use it, each a link to its editor, and the tickets on them or holding a
 *  copy of their own. */
function usedByFacts(usedBy: UsedBy): Fact[] {
  const flows: Fact[] = usedBy.workflows.length
    ? usedBy.workflows.map((w) => ({
        label: `Workflow ${w.name}`,
        icon: "workflows",
        value: (
          <Button variant="link" href={`/library/workflows/${w.id}`}>
            {w.name}
          </Button>
        ),
      }))
    : [{ label: "Workflows", icon: "workflows", value: "No workflows" }];
  return [...flows, { label: "Tickets", value: <Tickets keys={usedBy.tickets} /> }];
}

/** The latest few versions, newest first: the number, who wrote it (a face, or the run's glyph),
 *  and how long ago. */
function historyFacts(versions: readonly Version[], now: number): Fact[] {
  return versions.map((v) => ({
    label: `Version ${String(v.version)}`,
    value: (
      <>
        <Text tone="3" tabular>{`v${String(v.version)}`}</Text>
        {v.by.kind === "person" ? (
          <Avatar name={v.by.person.name} seed={String(v.by.person.id)} beside />
        ) : (
          <Icon name="agents" />
        )}
        {authorName(v.by)}
      </>
    ),
    note: `· ${age(v.at, now)}`,
  }));
}

export interface PropertyRowsProps {
  agent: { value: AgentSettings; onChange: (a: AgentSettings) => void } | null;
  /** Read-only, or a ticket copy's own (where it came from). */
  facts: readonly Fact[];
  /** The library's: the workflows and tickets that use it. */
  usedBy?: UsedBy | undefined;
  /** A ticket copy's: where it is used on the ticket (its workflow, the stages that get it). */
  usedIn?: readonly Fact[] | undefined;
  versions: readonly Version[];
}

function AgentRow({
  agent,
  facts,
}: Pick<PropertyRowsProps, "facts"> & { agent: NonNullable<PropertyRowsProps["agent"]> }) {
  const pickers = useAgentPickers(agent.value, agent.onChange);
  return <Facts label="Properties" items={[...pickers, ...facts]} />;
}

export function PropertyRows({ agent, facts, usedBy, usedIn, versions }: PropertyRowsProps) {
  const now = useNow(60_000);
  return (
    <Stack>
      {agent ? (
        <AgentRow agent={agent} facts={facts} />
      ) : facts.length ? (
        <Facts label="Properties" items={facts} />
      ) : null}
      {usedBy ? <Facts label="Used by" items={usedByFacts(usedBy)} /> : null}
      {usedIn ? <Facts label="Used by" items={usedIn} /> : null}
      <Facts label="History" items={historyFacts(versions, now)} />
    </Stack>
  );
}

// The item editor's side column, a narrow rail ruled off beside the content: the properties (an
// agent's runtime, model and effort as pickers in the form's field box; read-only facts as plain
// text), what uses the item (its workflows; its tickets as a count and the first few, the rest one
// click away), and its latest versions with who wrote each, a person or a ticket's run.
import { type ReactNode, useState } from "react";

import { useNow, useRuntimes } from "../../api/queries";
import type { AgentSettings, Effort, RuntimeId, UsedBy, Version } from "../../api/types";
import { age, plural } from "../../domain/format";
import { Age, Avatar, Button, FormRow, Icon, Section, Select, Stack, Text } from "../../kit";
import { authorName } from "./model";

const EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

/** How many tickets "Used by" names before the rest fold into +N. */
const FEW = 3;

export interface Fact {
  label: string;
  value: ReactNode;
}

/** An agent's runtime, model and effort, each a picker in place; a new runtime starts on its first
 *  model. */
function AgentPickers({
  agent,
  onChange,
}: {
  agent: AgentSettings;
  onChange: (a: AgentSettings) => void;
}) {
  const runtimes = useRuntimes().data ?? [];
  const models = runtimes.find((r) => r.id === agent.runtime)?.models ?? [agent.model];
  return (
    <>
      <FormRow label="Runtime">
        <Select
          look="field"
          label="Runtime"
          value={agent.runtime}
          options={runtimes.map((r) => ({ id: r.id, label: r.name }))}
          onChange={(id) => {
            const r = runtimes.find((x) => x.id === id);
            if (r) onChange({ ...agent, runtime: id as RuntimeId, model: r.models[0] ?? "" });
          }}
        />
      </FormRow>
      <FormRow label="Model">
        <Select
          look="field"
          label="Model"
          value={agent.model}
          options={models.map((m) => ({ id: m, label: m }))}
          onChange={(model) => {
            onChange({ ...agent, model });
          }}
        />
      </FormRow>
      <FormRow label="Effort">
        <Select
          look="field"
          label="Effort"
          value={agent.effort}
          options={EFFORTS.map((e) => ({ id: e, label: e }))}
          onChange={(effort) => {
            onChange({ ...agent, effort: effort as Effort });
          }}
        />
      </FormRow>
    </>
  );
}

export interface PropertiesProps {
  agent: { value: AgentSettings; onChange: (a: AgentSettings) => void } | null;
  /** Read-only, as plain text (a path in monospace), or a ticket copy's own controls. */
  facts: readonly Fact[];
}

export function Properties({ agent, facts }: PropertiesProps) {
  if (!agent && facts.length === 0) return null;
  return (
    <Section title="Properties">
      <Stack gap={3}>
        {agent ? <AgentPickers agent={agent.value} onChange={agent.onChange} /> : null}
        {facts.map((f) => (
          <FormRow key={f.label} label={f.label}>
            {f.value}
          </FormRow>
        ))}
      </Stack>
    </Section>
  );
}

/** The tickets: how many, the first few as links, and the rest behind +N, opened in place. */
function Tickets({ keys }: { keys: readonly string[] }) {
  const [all, setAll] = useState(false);
  if (keys.length === 0) return <Text tone="3">None</Text>;
  const shown = all ? keys : keys.slice(0, FEW);
  return (
    <Stack dir="row" gap={3} align="center" wrap>
      <Text tone="2">{`${plural(keys.length, "ticket")}:`}</Text>
      {shown.map((key) => (
        <Button key={key} variant="link" href={`/t/${key}`}>
          {key}
        </Button>
      ))}
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

/** The workflows that use it, each a link to its editor, and the tickets on them or holding a
 *  copy of their own. */
export function UsedBySection({ usedBy }: { usedBy: UsedBy }) {
  return (
    <Section title="Used by">
      <Stack gap={3}>
        <FormRow label="Workflows">
          {usedBy.workflows.length ? (
            usedBy.workflows.map((w) => (
              <Button
                key={w.id}
                variant="link"
                icon="workflows"
                href={`/library/workflows/${w.id}`}
              >
                {w.name}
              </Button>
            ))
          ) : (
            <Text tone="3">None</Text>
          )}
        </FormRow>
        <FormRow label="Tickets">
          <Tickets keys={usedBy.tickets} />
        </FormRow>
      </Stack>
    </Section>
  );
}

/** A ticket copy's Used by: where it is used on the ticket (its workflow, the stages that get it). */
export function UsedInSection({ facts }: { facts: readonly Fact[] }) {
  return (
    <Section title="Used by">
      <Stack gap={3}>
        {facts.map((f) => (
          <FormRow key={f.label} label={f.label}>
            {f.value}
          </FormRow>
        ))}
      </Stack>
    </Section>
  );
}

/** The latest few versions, newest first: the number, who wrote it (a face, or the run's glyph),
 *  and how long ago. */
export function History({ versions }: { versions: readonly Version[] }) {
  const now = useNow(60_000);
  return (
    <Section title="History">
      <Stack gap={4}>
        {versions.map((v) => (
          <Stack key={v.version} dir="row" gap={4} align="center">
            <Text tone="3" tabular>{`v${String(v.version)}`}</Text>
            {v.by.kind === "person" ? (
              <Avatar name={v.by.person.name} seed={String(v.by.person.id)} beside />
            ) : (
              <Icon name="agents" />
            )}
            <Text tone="2" truncate>
              {authorName(v.by)}
            </Text>
            <Stack grow />
            <Text variant="meta" tone="3">
              <Age text={age(v.at, now)} />
            </Text>
          </Stack>
        ))}
      </Stack>
    </Section>
  );
}

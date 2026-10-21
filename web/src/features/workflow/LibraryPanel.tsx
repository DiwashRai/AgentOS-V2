// The editor's library panel, in the column beside the lane: Agents, Skills and Files as tabs, a
// search box, and the items as small cards to drag onto the lane. A click is the keyboard-friendly
// alternative, with the same rules as a drop: it adds the item to the selected stage (an agent to
// a shell stage can't go on it, so it becomes a new stage after it, as a drop on the lane there
// would). With no stage selected a click does nothing, and the hint says to select one. An item
// already on the selected stage, or given to every stage, is marked so; a click on it only shows
// where it is.
import { useState } from "react";

import { matches, terms } from "../../domain/format";
import { Avatar, Drag, Field, Icon, Stack, Tabs, Text } from "../../kit";
import { type Library, runtimeName } from "./library";
import type { RefKind } from "./model";

export type PanelKind = "agent" | "skill" | "file";
type TabId = "agents" | RefKind;

/** The selected stage, as the panel speaks of it. */
export interface Target {
  name: string;
  shell: boolean;
}

export interface PanelProps {
  lib: Library;
  /** The selected stage, if one is selected. */
  target: Target | null;
  /** Where an item already is ("On Review", "On every stage"), or null. */
  where: (kind: PanelKind, id: string) => string | null;
  /** A click on an item (the alternative to dragging it), while a stage is selected. */
  pick: (kind: PanelKind, id: string) => void;
}

interface Entry {
  kind: PanelKind;
  id: string;
  name: string;
  about: string;
  face: boolean;
}

function entries(lib: Library, tab: TabId): Entry[] {
  if (tab === "agents")
    return lib.agents.map((a) => ({
      kind: "agent",
      id: a.id,
      name: a.name,
      about: `${runtimeName(lib, a.runtime)} · ${a.model} · ${a.effort}`,
      face: true,
    }));
  if (tab === "skills")
    return lib.skills.map((s) => ({
      kind: "skill",
      id: s.id,
      name: s.name,
      about: s.description,
      face: false,
    }));
  return lib.files.map((f) => ({
    kind: "file",
    id: f.id,
    name: f.path,
    about: `${(f.size / 1024).toFixed(1)} KB · used by ${String(f.used_by.workflows.length)} workflows`,
    face: false,
  }));
}

/** What dragging and clicking an item of this tab do, said under the search box. */
function hint(tab: TabId, t: Target | null): string {
  const drag =
    tab === "agents" ? "Drag onto a stage or the lane" : "Drag onto a stage or the strip above";
  if (t === null) return `${drag}. Select a stage, then click to add.`;
  if (tab !== "agents") return `${drag}, or click to add to ${t.name}.`;
  if (t.shell)
    return `${t.name} is a shell stage: drag an agent onto the lane, or click one to add a stage after ${t.name}.`;
  return `${drag}, or click to give ${t.name} the agent.`;
}

/** What a click on one item does: its card's name and tooltip. */
function clickSays(kind: PanelKind, t: Target | null, at: string | null): string {
  if (t === null) return "drag it onto a stage, or select a stage to click it on";
  if (at !== null) return `already ${at.charAt(0).toLowerCase()}${at.slice(1)}`;
  if (kind !== "agent") return `click to add to ${t.name}`;
  return t.shell ? `click to add a stage after ${t.name}` : `click to give ${t.name} the agent`;
}

const WORDS: Record<TabId, string> = { agents: "agents", skills: "skills", files: "files" };

function Item({ e, at, says }: { e: Entry; at: string | null; says: string }) {
  return (
    <Stack dir="row" gap={5} align="center">
      {e.face ? <Avatar name={e.name} seed={`agent:${e.id}`} beside /> : null}
      <Stack gap={1} grow>
        <Text variant={e.kind === "file" ? "code" : "ui"} tone="1" weight={500} truncate>
          {e.name}
        </Text>
        <Text variant="meta" truncate title={says}>
          {e.about}
        </Text>
      </Stack>
      {at !== null ? (
        <Stack dir="row" gap={2} align="center">
          <Icon name="check" />
          <Text variant="meta" tone="2">
            {at}
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}

export function LibraryPanel({ lib, target, where, pick }: PanelProps) {
  const [tab, setTab] = useState<TabId>("agents");
  const [q, setQ] = useState("");
  const shown = entries(lib, tab).filter((e) => matches([e.name, e.about], terms(q)));
  return (
    <Stack gap={6}>
      <Text variant="heading" as="h2">
        Library
      </Text>
      <Tabs
        label="Library"
        value={tab}
        onChange={(id) => {
          setTab(id === "skills" || id === "files" ? id : "agents");
        }}
        items={[
          { id: "agents", label: "Agents", count: lib.agents.length },
          { id: "skills", label: "Skills", count: lib.skills.length },
          { id: "files", label: "Files", count: lib.files.length },
        ]}
      >
        <Stack gap={5}>
          <Field
            search
            label={`Search ${WORDS[tab]}`}
            placeholder={`Search ${WORDS[tab]}`}
            value={q}
            onChange={setQ}
          />
          <Text variant="meta">{hint(tab, target)}</Text>
          <Stack gap={3}>
            {shown.map((e) => {
              const at = target ? where(e.kind, e.id) : null;
              const says = clickSays(e.kind, target, at);
              return (
                <Drag
                  key={e.id}
                  payload={{ kind: e.kind, id: e.id }}
                  label={`${e.name}: ${says}`}
                  {...(target
                    ? {
                        onClick: () => {
                          pick(e.kind, e.id);
                        },
                      }
                    : {})}
                >
                  <Item e={e} at={at} says={says} />
                </Drag>
              );
            })}
          </Stack>
        </Stack>
      </Tabs>
    </Stack>
  );
}

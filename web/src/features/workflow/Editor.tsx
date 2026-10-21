// The workflow editor, one component in two framings (the library's workflow on its own screen,
// a ticket's copy full window over the ticket): the top bar (the framing's name and marks, then
// Undo, Redo, Discard and Save, which says how many problems there are); the framing's own row
// over the lane (a copy's drift and what resolves it); the workflow-context strip; the lane of
// stage cards, the selected one opened in place; and the library panel in the column beside it.
// Everything drags, and everything that drags also clicks, by the same rules.
import { type ReactNode, useState } from "react";

import type { Stage, WorkflowBody } from "../../api/types";
import { plural } from "../../domain/format";
import {
  Button,
  Card,
  Chip,
  type DragPayload,
  Drop,
  Icon,
  Lane,
  type LaneLoop,
  type LaneStage,
  NumberField,
  Page,
  type PageProps,
  Stack,
  Surface,
  Text,
} from "../../kit";
import type { Draft } from "./draft";
import { agentOf, type Library, refName, useLibrary } from "./library";
import { LibraryPanel, type PanelKind } from "./LibraryPanel";
import {
  addToStage,
  insertStage,
  moveStage,
  noGateAfter,
  type Problems,
  problemsOf,
  type RefKind,
  setAgent,
  setRounds,
  toggleGate,
  updateStage,
  withoutRef,
  withRef,
} from "./model";
import { StageFields } from "./StageFields";
import { type Fresh, StageFace, StageSummary } from "./StageCard";

export interface EditorProps {
  title: PageProps["title"];
  draft: Draft;
  /** Quiet after the title, the first thing to give way when the bar is narrow (who edited it). */
  context?: string;
  /** After the title: the version and the default mark. */
  middle?: ReactNode;
  /** A row of its own over the lane, so nothing in it is ever cut: the ticket copy's drift, with
   *  the actions that resolve it (Take library version, Promote) beside it. */
  banner?: ReactNode;
}

const REF: Record<string, RefKind | undefined> = { skill: "skills", file: "files" };

/** A chip that just landed: on a stage (by id), or on every stage ("*"). */
type Landed = Fresh & { stage: string };

const EVERY = "*";

/** Every stage gets these: the workflow's skills and files as chips, each with a remove; a skill
 *  or a file dropped here goes to every stage. */
function ContextStrip({ draft, lib, fresh, land }: Lands & { draft: Draft; lib: Library }) {
  const c = draft.body.context;
  const add = (p: DragPayload) => {
    const kind = REF[p.kind];
    if (!kind) return;
    draft.change((b) => ({ ...b, context: withRef(b.context, kind, p.id) }));
    land(EVERY, `${kind}:${p.id}`);
  };
  return (
    <Drop accept={["skill", "file"]} onDrop={add} label="Give every stage">
      <Surface level="sheet" pad={5} label="Every stage gets">
        <Stack dir="row" gap={4} align="center" wrap>
          <Text variant="meta" tone="2" weight={500}>
            Every stage gets
          </Text>
          {(["skills", "files"] as const).flatMap((kind) =>
            c[kind].map((id) => {
              const ref = `${kind}:${id}`;
              const flash = fresh?.stage === EVERY && fresh.ref === ref;
              return (
                <Chip
                  key={flash ? `${ref}:${String(fresh.n)}` : ref}
                  lead={kind}
                  label={refName(lib, kind, id)}
                  flash={flash}
                  onRemove={() => {
                    draft.change((b) => ({ ...b, context: withoutRef(b.context, kind, id) }));
                  }}
                />
              );
            }),
          )}
          <Text variant="meta">Drop a skill or a file here</Text>
        </Stack>
      </Surface>
    </Drop>
  );
}

/** A loop's foot: what it repeats, its rounds, and what's wrong with it. */
export function LoopFoot({
  body,
  i,
  problem,
  setTo,
}: {
  body: WorkflowBody;
  i: number;
  problem: string | undefined;
  setTo?: (n: number) => void;
}) {
  const l = body.loops[i];
  if (!l) return null;
  const name = (id: string) => body.stages.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <Icon name="loop" />
      <Text variant="meta" tone="2">{`Back to ${name(l.first)} until its checks pass, up to`}</Text>
      {setTo ? (
        <NumberField
          label="Rounds"
          value={l.rounds}
          min={1}
          max={5}
          unit="rounds"
          onChange={setTo}
        />
      ) : (
        <Text variant="meta" tone="2" weight={500}>{`${String(l.rounds)} rounds`}</Text>
      )}
      {problem ? (
        <Text variant="meta" tone="blocked" weight={500}>
          {problem}
        </Text>
      ) : null}
    </>
  );
}

/** The chip that just landed, and how a landing is reported. */
interface Lands {
  fresh: Landed | null;
  land: (stage: string, ref: string) => void;
}

interface LaneParts extends Lands {
  draft: Draft;
  lib: Library;
  problems: Problems;
  selected: string | null;
  select: (id: string | null) => void;
}

/** What a drop onto a stage's card does: an agent becomes its agent; a skill or file is added
 *  (and flashes where it landed). */
function dropOnto(draft: Draft, s: Stage, p: DragPayload, land: Lands["land"]) {
  const kind = REF[p.kind];
  if (!kind) {
    draft.change((b) => setAgent(b, s.id, p.id));
    return;
  }
  draft.change((b) => addToStage(b, s.id, kind, p.id));
  land(s.id, `${kind}:${p.id}`);
}

function stagesOf({ draft, lib, problems, selected, select, fresh, land }: LaneParts): LaneStage[] {
  return draft.body.stages.map((s) => {
    const here = fresh?.stage === s.id ? fresh : null;
    const barred = noGateAfter(draft.body, s.id);
    return {
      id: s.id,
      label: s.name,
      gate: s.gate?.label ?? null,
      ...(barred !== undefined ? { noGate: barred } : {}),
      content: (
        <Drop
          accept={s.kind === "agent" ? ["agent", "skill", "file"] : ["skill", "file"]}
          onDrop={(p) => {
            dropOnto(draft, s, p, land);
          }}
          label={`Add to ${s.name}`}
        >
          <Card
            label={s.name}
            face={<StageFace stage={s} lib={lib} />}
            off={!s.enabled}
            problem={problems.stages.get(s.id)?.text}
            onOpen={() => {
              select(selected === s.id ? null : s.id);
            }}
            open={
              selected === s.id ? (
                <StageFields
                  stage={s}
                  lib={lib}
                  problem={problems.stages.get(s.id)}
                  fresh={here}
                  set={(next) => {
                    draft.change((b) => updateStage(b, s.id, () => next));
                  }}
                  removeRef={(kind, id) => {
                    draft.change((b) =>
                      updateStage(b, s.id, (x) => ({
                        ...x,
                        context: withoutRef(x.context, kind, id),
                      })),
                    );
                  }}
                />
              ) : undefined
            }
          >
            <StageSummary
              stage={s}
              lib={lib}
              show={selected === s.id ? "head" : "all"}
              fresh={here}
            />
          </Card>
        </Drop>
      ),
    };
  });
}

function loopsOf(draft: Draft, problems: Problems): LaneLoop[] {
  return draft.body.loops.map((l, i) => ({
    first: l.first,
    last: l.last,
    foot: (
      <LoopFoot
        body={draft.body}
        i={i}
        problem={problems.loops.get(i)}
        setTo={(n) => {
          draft.change((b) => setRounds(b, i, n));
        }}
      />
    ),
  }));
}

/** Undo and Redo (one look in every state, a blocked one in the muted ink), Discard and Save,
 *  which says how many problems there are. */
function Actions({ draft, problems }: { draft: Draft; problems: number }) {
  const save = problems > 0 ? `Save · ${plural(problems, "problem")}` : "Save";
  return (
    <>
      <Button
        icon="undo"
        title="Undo"
        {...(draft.canUndo ? { onClick: draft.undo } : { blocked: "Nothing to undo" })}
      />
      <Button
        icon="redo"
        title="Redo"
        {...(draft.canRedo ? { onClick: draft.redo } : { blocked: "Nothing to redo" })}
      />
      <Button
        {...(draft.dirty ? { onClick: draft.discard } : { blocked: "No changes to discard" })}
      >
        Discard
      </Button>
      <Button
        variant={draft.dirty ? "you" : "default"}
        {...(draft.dirty
          ? {
              onClick: draft.save,
              title:
                problems > 0 ? "Saves as it is; it won't run until the problems are fixed" : "",
            }
          : { blocked: "No changes to save" })}
      >
        {save}
      </Button>
    </>
  );
}

/** Where a library item already is for the selected stage: given to every stage, or on it. */
function whereFor(body: WorkflowBody, s: Stage | null, kind: PanelKind, id: string) {
  if (!s) return null;
  const ref = REF[kind];
  if (!ref) return s.kind === "agent" && s.agent === id ? `On ${s.name}` : null;
  if (body.context[ref].includes(id)) return "On every stage";
  return s.context[ref].includes(id) ? `On ${s.name}` : null;
}

interface PickParts extends Pick<Lands, "land"> {
  draft: Draft;
  s: Stage;
  /** A new stage with this agent at this slot. */
  insert: (at: number, agent: string) => void;
}

/** A click on a library item, by the drop rules: an agent onto an agent stage, or as a new stage
 *  after a shell stage (as a drop on the lane there); a skill or a file onto the stage. One that
 *  is already there only flashes where it is. */
function pickFor({ draft, s, insert, land }: PickParts, kind: PanelKind, id: string) {
  const ref = REF[kind];
  if (!ref) {
    if (s.kind === "shell") insert(draft.body.stages.indexOf(s) + 1, id);
    else draft.change((b) => setAgent(b, s.id, id));
    return;
  }
  const every = draft.body.context[ref].includes(id);
  if (!every) draft.change((b) => addToStage(b, s.id, ref, id));
  land(every ? EVERY : s.id, `${ref}:${id}`);
}

/** The chip that just landed, flashed until the next one lands. */
function useLanded(): Lands {
  const [fresh, setFresh] = useState<Landed | null>(null);
  return {
    fresh,
    land: (stage, ref) => {
      setFresh((f) => ({ stage, ref, n: (f?.n ?? 0) + 1 }));
    },
  };
}

export function Editor({ title, draft, context, middle, banner }: EditorProps) {
  const lib = useLibrary();
  const [selected, select] = useState<string | null>(null);
  const { fresh, land } = useLanded();
  const problems = problemsOf(draft.body, lib.fields);
  const insert = (at: number, agentId: string) => {
    const a = agentOf(lib, agentId) ?? lib.agents[0];
    if (!a) return;
    const r = insertStage(draft.body, at, a);
    draft.change(() => r.body);
    select(r.id);
  };
  const s = draft.body.stages.find((x) => x.id === selected) ?? null;
  return (
    <Page
      title={title}
      context={context}
      middle={middle}
      action={<Actions draft={draft} problems={problems.count} />}
      side={{
        content: (
          <LibraryPanel
            lib={lib}
            target={s ? { name: s.name, shell: s.kind === "shell" } : null}
            where={(kind, id) => whereFor(draft.body, s, kind, id)}
            pick={(kind, id) => {
              if (s) pickFor({ draft, s, insert, land }, kind, id);
            }}
          />
        ),
      }}
    >
      <Stack gap={6}>
        {banner}
        <ContextStrip draft={draft} lib={lib} fresh={fresh} land={land} />
        <Lane
          label="Stages"
          stages={stagesOf({ draft, lib, problems, selected, select, fresh, land })}
          loops={loopsOf(draft, problems)}
          edit={{
            onMove: (from, to) => {
              draft.change((b) => moveStage(b, from, to));
            },
            onGate: (i) => {
              draft.change((b) => toggleGate(b, i));
            },
            onInsert: (at) => {
              const before = draft.body.stages[at - 1];
              insert(at, before?.kind === "agent" ? before.agent : "");
            },
            accept: ["agent"],
            onDrop: (p, at) => {
              insert(at, p.id);
            },
          }}
        />
      </Stack>
    </Page>
  );
}

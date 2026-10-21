// One of the ticket's context items in the full-window overlay over the ticket (?edit=<name>): the
// library's one item editor (features/library/ItemEditor), framed as the ticket's copy the way its
// workflow overlay is: "NW-17's copy of tests v2", its drift, and Take library version and Promote
// beside Discard and Save while it has drifted. The agents' switch is the Context tab's own and
// saves at once, so it sits in the bar, not among the properties Save governs. Used by says which
// of the ticket's stages get it. Esc or the close with unsaved changes asks the same question as the
// workflow overlay: Keep editing, Discard, or Save.
import { useCallback, useRef, useState } from "react";

import {
  useAgent,
  useFile,
  useItem,
  useSetWritable,
  useSkill,
  useTicketWorkflow,
} from "../../api/queries";
import type { Item, ItemBody, Origin, Ticket } from "../../api/types";
import { Button, Dialog, Icon, Notice, Page, Stack, Text, Toggle } from "../../kit";
import { type EditorActs, ItemEditor } from "../library/ItemEditor";
import type { Fact } from "../library/side";
import { copyTitle, DriftChips, SaveAsk } from "./copy";
import { contentTitle, KIND, labelOf, libraryHref, stagesOf } from "./items";
import { ticketHref } from "./tabs";

type Copy = Extract<Origin, { kind: "copy" }>;
type Take = (body: ItemBody) => void;

/** The editor's title: the copy and the version it came from, or the ticket's own item. */
function titleOf(key: string, i: Item): string {
  return i.origin.kind === "copy"
    ? copyTitle(key, labelOf(i), i.origin.version)
    : `${key}'s ${i.name}`;
}

/** What it is, and the library item it was copied from. */
function facts(i: Item): Fact[] {
  const k = KIND[i.kind];
  const href = libraryHref(i);
  return [
    {
      label: "Kind",
      value: (
        <Stack dir="row" gap={3} align="center">
          <Icon name={k.icon} />
          <Text tone="1">{k.word}</Text>
        </Stack>
      ),
    },
    {
      label: "Copied from",
      value:
        i.origin.kind === "copy" && href ? (
          <Button variant="link" href={href}>
            {`${i.origin.of.name} v${String(i.origin.version)}`}
          </Button>
        ) : (
          <Text tone="3">Ticket only</Text>
        ),
    },
  ];
}

/** Used by, on the ticket: its workflow copy and the stages of it that get the item. */
function useUsedIn(t: Ticket, i: Item): Fact[] | undefined {
  const w = useTicketWorkflow(t.key).data;
  if (!w) return undefined;
  return [
    {
      label: "Workflow",
      value: (
        <Button variant="link" icon="workflows" href={ticketHref(t.key, "workflow")}>
          {`${w.name} v${String(w.from.version)}`}
        </Button>
      ),
    },
    { label: "Stages", value: <Text tone="2">{stagesOf(i, w)}</Text> },
  ];
}

/** Agents may write it: the same switch as the Context tab's line, saved at once. */
function WriteSwitch({ t, i }: { t: Ticket; i: Item }) {
  const set = useSetWritable(t.key);
  const [saved, setSaved] = useState(false);
  return (
    <Stack dir="row" gap={3} align="center">
      <Toggle
        label={`Agents can write ${labelOf(i)}`}
        on={i.writable}
        onChange={(on) => {
          set(i.name, on);
          setSaved(true);
        }}
      />
      <Text variant="meta" tone="2">
        Agents write
      </Text>
      {saved ? (
        <Stack dir="row" gap={2} align="center">
          <Icon name="check" />
          <Text variant="meta" tone="3">
            Saved
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** Take library version and Promote, as the workflow overlay offers them: Take puts the library's
 *  content in the draft (Discard brings yours back); Promote is refused while the library has moved
 *  on since the copy. */
function TakePromote({ c, body, take }: { c: Copy; body: ItemBody | undefined; take: Take }) {
  const moved = c.drift.library;
  return (
    <>
      <Button
        title={`Replace this copy with ${c.of.name} v${String(moved ?? c.version)}; Discard brings yours back`}
        {...(body
          ? {
              onClick: () => {
                take(body);
              },
            }
          : { blocked: "Loading the library's version" })}
      >
        Take library version
      </Button>
      <Button
        {...(moved !== null
          ? {
              blocked: `The library has moved to v${String(moved)} since this copy: take its version first, then promote`,
            }
          : { title: `Save this copy as ${c.of.name}'s next version (admins)` })}
      >
        Promote
      </Button>
    </>
  );
}

function FromAgent({ c, take }: { c: Copy; take: Take }) {
  const a = useAgent(c.of.id).data;
  const body: ItemBody | undefined = a && {
    kind: "agent",
    agent: { instructions: a.instructions, runtime: a.runtime, model: a.model, effort: a.effort },
  };
  return <TakePromote c={c} body={body} take={take} />;
}

function FromSkill({ c, take }: { c: Copy; take: Take }) {
  const s = useSkill(c.of.id).data;
  return <TakePromote c={c} body={s && { kind: "text", text: s.content }} take={take} />;
}

function FromFile({ c, take }: { c: Copy; take: Take }) {
  const f = useFile(c.of.id).data;
  return <TakePromote c={c} body={f?.body} take={take} />;
}

/** The copy's own buttons while it has drifted; none when in step or the ticket's own. */
function CopyActions({ i, take }: { i: Item; take: Take }) {
  const c = i.origin.kind === "copy" ? i.origin : null;
  if (!c || (c.drift.library === null && !c.drift.changed)) return null;
  if (i.kind === "agent") return <FromAgent c={c} take={take} />;
  if (i.kind === "skill") return <FromSkill c={c} take={take} />;
  return <FromFile c={c} take={take} />;
}

/** Told of unsaved changes, with the editor's Save and Discard and what the question names. */
type OnDirty = (dirty: boolean, acts: EditorActs, what: string) => void;

function Editor({ t, i, onDirty }: { t: Ticket; i: Item; onDirty: OnDirty }) {
  const usedIn = useUsedIn(t, i);
  const title = titleOf(t.key, i);
  const what = i.origin.kind === "copy" ? `${t.key}'s copy of ${labelOf(i)}` : title;
  const told = useCallback(
    (d: boolean, a: EditorActs) => {
      onDirty(d, a, what);
    },
    [onDirty, what],
  );
  return (
    <ItemEditor
      title={title}
      item={i}
      contentTitle={contentTitle(i, i.body.kind === "blocks")}
      facts={facts(i)}
      {...(usedIn ? { usedIn } : {})}
      middle={
        <>
          {i.origin.kind === "copy" ? (
            <DriftChips drift={i.origin.drift} of={i.origin.of.name} />
          ) : null}
          <WriteSwitch t={t} i={i} />
        </>
      }
      actions={(take) => <CopyActions i={i} take={take} />}
      onDirty={told}
    />
  );
}

export function ItemOverlay({
  t,
  name,
  onClose,
}: {
  t: Ticket;
  name: string | null;
  onClose: () => void;
}) {
  const [dirty, setDirty] = useState(false);
  const [asking, setAsking] = useState(false);
  const [what, setWhat] = useState<string | null>(null);
  const acts = useRef<EditorActs | null>(null);
  const onDirty = useCallback<OnDirty>((d, a, w) => {
    setDirty(d);
    setWhat(w);
    acts.current = a;
  }, []);
  const close = () => {
    setAsking(false);
    setDirty(false);
    onClose();
  };
  return (
    <Dialog
      look="full"
      label={name === null ? "Item" : `${t.key}'s ${name}`}
      open={name !== null}
      onClose={() => {
        // Esc over the question takes it back; over the editor it asks first when there are edits
        if (asking) setAsking(false);
        else if (dirty) setAsking(true);
        else close();
      }}
      ask={
        asking ? (
          <SaveAsk
            what={what ?? name ?? "this item"}
            onKeep={() => {
              setAsking(false);
            }}
            onDiscard={() => {
              acts.current?.discard();
              close();
            }}
            onSave={() => {
              acts.current?.save();
              close();
            }}
          />
        ) : undefined
      }
    >
      {name !== null ? <Loaded t={t} name={name} onDirty={onDirty} /> : null}
    </Dialog>
  );
}

function Loaded({ t, name, onDirty }: { t: Ticket; name: string; onDirty: OnDirty }) {
  const item = useItem(t.key, name);
  if (item.data) return <Editor key={name} t={t} i={item.data} onDirty={onDirty} />;
  return (
    <Page title={`${t.key}'s ${name}`}>
      <Notice kind="status" error={item.isError}>
        {item.isError ? `No item ${name} on ${t.key}` : `Loading ${name}`}
      </Notice>
    </Page>
  );
}

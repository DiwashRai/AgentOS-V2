// The one item editor (spec screen 2), for a library agent, skill or file and for a ticket's copy of
// one in the ticket's full-window overlay: the bar names the item, its version and who last edited
// it when, with Discard and Save (lit once there is an edit), and in the library the way to the
// item's siblings; the main column holds its name and description together, then the content; the
// side rail holds the settings, what uses it and the latest versions. A save that someone else beat
// shows both versions, each side's own changes marked, to keep one. W0 is static: Save keeps the
// edit here as the next version.
import { type ReactNode, useEffect, useRef } from "react";

import { useNow, useSession } from "../../api/queries";
import type { ItemBody, UsedBy } from "../../api/types";
import { age } from "../../domain/format";
import { Button, Chip, Field, Page, type PageProps, Stack, Text } from "../../kit";
import { Conflict } from "./conflict";
import { Content } from "./content";
import type { Draft } from "./draft";
import { authorName } from "./model";
import { type Siblings, SiblingNav } from "./nav";
import { type Fact, PropertyRows } from "./side";
import { type Editor, useEditor, type Versioned } from "./useEditor";

export interface EditorItem extends Versioned {
  body: ItemBody;
}

export interface ItemEditorProps {
  /** The bar's title: the library list's crumb and the name; in the ticket's overlay, the item. */
  title: PageProps["title"];
  item: EditorItem;
  /** Over the content, saying what it is (Instructions, the path). */
  contentTitle: string;
  /** A library item's name to edit (a file's path too: a title, in the headings' sans), over its
   *  description. */
  name?: { label: string; value: string };
  /** A library item's description to edit, under its name. */
  description?: string;
  /** The document's title when it has no name to edit (a ticket's copy: AGENTS.md, Builder). */
  heading?: string;
  /** Read-only properties (a skill's path, a file's size, a ticket copy's origin). */
  facts?: readonly Fact[];
  /** The library's: the workflows and tickets that use it. */
  usedBy?: UsedBy;
  /** A ticket copy's: what uses it there (the stages that get it), in place of the library's. */
  usedIn?: readonly Fact[];
  /** The library's: its list's other items, one step or one pick away. */
  siblings?: Siblings;
  /** A ticket copy's: after the edit's state in the bar (its drift, the agents' switch). */
  middle?: ReactNode;
  /** A ticket copy's buttons before Discard and Save; `take` replaces the content in the draft
   *  (Take library version: Discard undoes it, Save keeps it). */
  actions?: (take: (body: ItemBody) => void) => ReactNode;
  /** Told whether there are unsaved changes, with the editor's own Save and Discard (the overlay
   *  asks before it closes, and saves or discards from its question). */
  onDirty?: (dirty: boolean, act: EditorActs) => void;
}

export interface EditorActs {
  save: () => void;
  discard: () => void;
}

const MINUTE = 60_000;
/** "3d ago", or "just now" for a save made here. */
const ago = (a: string) => (a === "now" ? "just now" : `${a} ago`);
const FIRST = "Keep yours or take theirs first";

/** Discard and Save as a pair: Save the bar's one filled button (grey while there is nothing to
 *  save). */
function Actions({ e }: { e: Editor }) {
  if (e.theirs)
    return (
      <>
        <Button blocked={FIRST}>Discard</Button>
        <Button variant="you" blocked={FIRST}>
          Save
        </Button>
      </>
    );
  return e.dirty ? (
    <>
      <Button onClick={e.discard}>Discard</Button>
      <Button variant="you" onClick={e.save}>
        Save
      </Button>
    </>
  ) : (
    <>
      <Button blocked="No changes to discard">Discard</Button>
      <Button variant="you" blocked="No changes to save">
        Save
      </Button>
    </>
  );
}

/** After the title: a conflict, or an edit not saved yet. */
function State({ e }: { e: Editor }) {
  if (e.theirs) return <Chip tone="blocked" label={"Conflict"} />;
  return e.dirty ? <Chip label={"Unsaved changes"} /> : null;
}

/** Its properties, what uses it and its versions: Linear's labelled rows, over the content. */
function Rows({ e, props }: { e: Editor; props: ItemEditorProps }) {
  const body = e.draft.body;
  return (
    <PropertyRows
      agent={
        body.kind === "agent"
          ? {
              value: body.agent,
              onChange: (agent) => {
                e.edit({ body: { kind: "agent", agent } });
              },
            }
          : null
      }
      facts={props.facts ?? []}
      usedBy={props.usedBy}
      usedIn={props.usedIn}
      versions={e.history}
    />
  );
}

/** A library item's name and description, the document's title and the lead under it, over its
 *  content. */
function Identity({ e, props }: { e: Editor; props: ItemEditorProps }) {
  const { name, description, heading } = props;
  if (!name && description === undefined)
    return heading ? (
      <Text variant="display" as="h2">
        {heading}
      </Text>
    ) : null;
  return (
    <Stack gap={2}>
      {name ? (
        <Field
          look="title"
          label={name.label}
          value={e.draft.name}
          placeholder={name.label}
          onChange={(v) => {
            e.edit({ name: v });
          }}
        />
      ) : null}
      {description !== undefined ? (
        <Field
          look="lead"
          label="Description"
          value={e.draft.description}
          placeholder="Add a short summary…"
          onChange={(v) => {
            e.edit({ description: v });
          }}
        />
      ) : null}
    </Stack>
  );
}
function Main({ e, props }: { e: Editor; props: ItemEditorProps }) {
  return (
    <Stack gap={10} grow>
      <Identity e={e} props={props} />
      <Rows e={e} props={props} />
      <Content
        body={e.draft.body}
        title={props.contentTitle}
        onChange={(body) => {
          e.edit({ body });
        }}
      />
    </Stack>
  );
}

/** Tells the screen whether there are edits, with the latest Save and Discard. */
function useDirty(e: Editor, onDirty: ItemEditorProps["onDirty"]) {
  const acts = useRef<EditorActs>({ save: e.save, discard: e.discard });
  useEffect(() => {
    acts.current = { save: e.save, discard: e.discard };
  });
  useEffect(() => {
    onDirty?.(e.dirty, {
      save: () => {
        acts.current.save();
      },
      discard: () => {
        acts.current.discard();
      },
    });
  }, [e.dirty, onDirty]);
}

export function ItemEditor(props: ItemEditorProps) {
  const { title, item } = props;
  const now = useNow(MINUTE);
  const me = useSession().data?.me ?? null;
  const start: Draft = {
    body: item.body,
    name: props.name?.value ?? "",
    description: props.description ?? "",
  };
  const e = useEditor(item, start, now, me);
  useDirty(e, props.onDirty);
  const s = e.stored;
  return (
    <Page
      title={title}
      context={`v${String(s.version)} · edited by ${authorName(s.by)} · ${ago(age(s.at, now))}`}
      middle={
        <>
          <State e={e} />
          {props.middle}
        </>
      }
      action={
        <>
          {props.siblings ? <SiblingNav s={props.siblings} /> : null}
          {props.actions?.((body) => {
            e.edit({ body });
          })}
          <Actions e={e} />
        </>
      }
      {...(e.theirs ? {} : { side: { look: "doc" as const } })}
    >
      {e.theirs ? (
        <Conflict
          base={s}
          mine={e.draft}
          theirs={e.theirs}
          onKeepMine={e.keepMine}
          onTakeTheirs={e.takeTheirs}
        />
      ) : (
        <Main e={e} props={props} />
      )}
    </Page>
  );
}

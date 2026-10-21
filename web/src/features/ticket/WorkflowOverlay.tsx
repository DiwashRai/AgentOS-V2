// The ticket's workflow editor (?edit=workflow): the library's workflow editor, full window over
// the ticket, framed as the ticket's copy (R27). The top bar names it as the Workflow tab does
// ("NW-17's copy of Standard v3", who edited it, which gives way first when the bar is narrow),
// with Undo, Redo, Discard and Save at its end; the row under it holds the copy's drift both ways
// with what resolves it beside it: Take library version (one undoable step) and Promote (refused
// while the library has moved on, and saying why on screen). Closing with unsaved changes asks
// inside the overlay: Save, Discard, or keep editing.
import { useState } from "react";

import { useNow, useTicketWorkflow, useWorkflow } from "../../api/queries";
import type { Ticket, TicketWorkflow, Workflow, WorkflowBody } from "../../api/types";
import { Badge, Button, Dialog, Notice, Page, Stack, Text } from "../../kit";
import { type Draft, useDraft } from "../workflow/draft";
import { Editor } from "../workflow/Editor";
import { authorText } from "../workflow/who";
import { copyTitle, DriftChips as SharedDrift, SaveAsk } from "./copy";

interface OverlayProps {
  t: Ticket;
  open: boolean;
  onClose: () => void;
}

/** The copy's drift both ways, in the words and colours every copy uses (copy.tsx): the library's
 *  newer version, and whether the ticket changed it. */
export function DriftChips({ w }: { w: TicketWorkflow }) {
  return <SharedDrift drift={w.drift} of={w.name} />;
}

const bodyOf = (w: WorkflowBody): WorkflowBody => ({
  stages: w.stages,
  loops: w.loops,
  context: w.context,
});

const same = (a: WorkflowBody, b: WorkflowBody) =>
  JSON.stringify(bodyOf(a)) === JSON.stringify(bodyOf(b));

/** Why Promote is refused now, if it is: the library moved on, or there is nothing to promote. */
function promoteBlock(w: TicketWorkflow, lib: Workflow | undefined, taken: boolean) {
  if (taken) return `This is ${w.name} v${String(lib?.version ?? "")}: nothing to promote`;
  if (w.drift.library !== null)
    return `Library moved to v${String(w.drift.library)}: take it first`;
  return null;
}

/** Take library version: the library's body as one undoable step. */
function Take({ w, lib, draft }: { w: TicketWorkflow; lib: Workflow | undefined; draft: Draft }) {
  if (!lib)
    return (
      <Button size="sm" blocked="Loading the library's version">
        Take library version
      </Button>
    );
  return (
    <Button
      size="sm"
      title={`Replace this copy with ${w.name} v${String(lib.version)}; Undo brings it back`}
      onClick={() => {
        draft.change(() => bodyOf(lib));
      }}
    >
      Take library version
    </Button>
  );
}

/** Promote, and why it is refused now, said on screen beside it. */
function Promote({ w, block }: { w: TicketWorkflow; block: string | null }) {
  if (block === null)
    return (
      <Button size="sm" title={`Save this copy as ${w.name}'s next version (admins)`}>
        Promote
      </Button>
    );
  return (
    <>
      <Button size="sm" blocked={block}>
        Promote
      </Button>
      <Text variant="meta">{block}</Text>
    </>
  );
}

/** The drift row: the chips, then what resolves them. It wraps rather than cut a chip when the
 *  window is narrow. */
function Drift({ w, draft }: { w: TicketWorkflow; draft: Draft }) {
  const lib = useWorkflow(w.from.id).data;
  const taken = lib !== undefined && draft.dirty && same(draft.body, lib);
  const drifted = w.drift.library !== null || w.drift.changed;
  return (
    <Stack dir="row" gap={4} align="center" wrap>
      {taken ? (
        <Badge kind="prop" dot="you">{`Taking library v${String(lib.version)} · unsaved`}</Badge>
      ) : (
        <DriftChips w={w} />
      )}
      {drifted && !taken ? <Take w={w} lib={lib} draft={draft} /> : null}
      <Promote w={w} block={promoteBlock(w, lib, taken)} />
    </Stack>
  );
}
function CopyEditor({ t, w, open, onClose }: OverlayProps & { w: TicketWorkflow }) {
  const draft = useDraft(w);
  const now = useNow(60_000);
  const [asking, setAsking] = useState(false);
  const close = () => {
    setAsking(false);
    onClose();
  };
  return (
    <Dialog
      look="full"
      label={`${t.key}'s workflow`}
      open={open}
      onClose={() => {
        if (draft.dirty) setAsking(!asking);
        else onClose();
      }}
      ask={
        asking ? (
          <SaveAsk
            what={`${t.key}'s workflow`}
            onKeep={() => {
              setAsking(false);
            }}
            onDiscard={() => {
              draft.discard();
              close();
            }}
            onSave={() => {
              draft.save();
              close();
            }}
          />
        ) : null
      }
    >
      <Editor
        title={copyTitle(t.key, w.name, w.from.version)}
        draft={draft}
        context={`Edited by ${authorText(w.updated_by, w.updated_at, now)}`}
        banner={<Drift w={w} draft={draft} />}
      />
    </Dialog>
  );
}

export function WorkflowOverlay({ t, open, onClose }: OverlayProps) {
  const w = useTicketWorkflow(t.key);
  if (w.data) return <CopyEditor t={t} w={w.data} open={open} onClose={onClose} />;
  return (
    <Dialog look="full" label={`${t.key}'s workflow`} open={open} onClose={onClose}>
      <Page title={`${t.key}'s workflow`}>
        <Notice kind="status" error={w.isError}>
          {w.isError ? `${t.key} has no workflow` : "Loading the workflow"}
        </Notice>
      </Page>
    </Dialog>
  );
}

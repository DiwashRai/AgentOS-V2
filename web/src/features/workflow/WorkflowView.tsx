// A library workflow's editor (/library/workflows/:id), full window under its list's crumb: the
// same editor a ticket's copy opens in its overlay, framed by its version, its default mark and
// who changed it last.
import { useParams } from "react-router";

import { loadOf, useNow, useWorkflow } from "../../api/queries";
import type { Workflow } from "../../api/types";
import { authorText } from "../../domain/format";
import { Chip, Page, Stack, Text } from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { useDraft } from "../shared/workflowEditor/draft";
import { Editor } from "../shared/workflowEditor/Editor";

const LIST = { label: "Workflows", href: "/library/workflows" };

function Loaded({ w }: { w: Workflow }) {
  const draft = useDraft(w);
  const now = useNow(60_000);
  return (
    <Editor
      title={[LIST, w.name]}
      draft={draft}
      middle={
        <Stack dir="row" gap={4} align="center">
          <Chip lead="workflow" label={`v${String(w.version)}`} />
          {w.is_default ? <Chip dot="done" label={"Default"} /> : null}
          <Text variant="meta">{`Edited by ${authorText(w.updated_by, w.updated_at, now)}`}</Text>
        </Stack>
      }
    />
  );
}

export function WorkflowView() {
  const { id = "" } = useParams();
  const w = loadOf(useWorkflow(id));
  if (w.kind === "ready") return <Loaded key={w.data.id} w={w.data} />;
  return (
    <Page title={[LIST, id]}>
      <LoadNotice load={w} noun="workflow" id={id} />
    </Page>
  );
}

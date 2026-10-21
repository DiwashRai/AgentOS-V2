// A library workflow's editor (/library/workflows/:id), full window under its list's crumb: the
// same editor a ticket's copy opens in its overlay, framed by its version, its default mark and
// who changed it last.
import { useParams } from "react-router";

import { useNow, useWorkflow } from "../../api/queries";
import type { Workflow } from "../../api/types";
import { Chip, Icon, Notice, Page, Stack, Text } from "../../kit";
import { useDraft } from "./draft";
import { Editor } from "./Editor";
import { authorText } from "./who";

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
          <Chip lead={<Icon name="workflow" />} label={`v${String(w.version)}`} />
          {w.is_default ? <Chip dot="done" label={"Default"} /> : null}
          <Text variant="meta">{`Edited by ${authorText(w.updated_by, w.updated_at, now)}`}</Text>
        </Stack>
      }
    />
  );
}

export function WorkflowView() {
  const { id = "" } = useParams();
  const w = useWorkflow(id);
  if (w.data) return <Loaded key={w.data.id} w={w.data} />;
  return (
    <Page title={[LIST, id]}>
      <Notice kind="status" error={w.isError}>
        {w.isError ? `No workflow ${id}` : "Loading the workflow"}
      </Notice>
    </Page>
  );
}

// The ticket's full-window editors (?edit=…), over the ticket page: its copy of its workflow
// (?edit=workflow), the same editor as the library's, framed as the ticket's copy
// (WorkflowOverlay.tsx); and one of its context items (?edit=<name>), the library's shared item
// editor (itemOverlay.tsx). Esc and the close leave the overlay (an editor with unsaved changes
// asks first, through the Dialog's `ask`).
import type { Ticket } from "../../api/types";
import { ItemOverlay } from "./itemOverlay";
import { useTicketUrl, WORKFLOW } from "./tabs";
import { WorkflowOverlay } from "./WorkflowOverlay";

export function TicketOverlays({ t }: { t: Ticket }) {
  const { edit, closeEdit } = useTicketUrl();
  const item = edit !== null && edit !== WORKFLOW ? edit : null;
  return (
    <>
      <WorkflowOverlay t={t} open={edit === WORKFLOW} onClose={closeEdit} />
      <ItemOverlay t={t} name={item} onClose={closeEdit} />
    </>
  );
}

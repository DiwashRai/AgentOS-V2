// The ticket page's tabs and overlays live in its URL: `?tab=runs|context|workflow` (Overview has
// none), and `?edit=workflow` (the ticket's workflow, full window) or `?edit=<item name>` (one of
// its context items) over it. Closing an overlay leaves its tab where it was.
import { useParam } from "../shared/useParam";

export const TABS = ["overview", "runs", "context", "workflow"] as const;
export type TabId = (typeof TABS)[number];

/** What `?edit=` opens: the workflow, or the item of that name. */
export const WORKFLOW = "workflow";

/** A link to the ticket at a tab, with an overlay open over it. */
export function ticketHref(key: string, tab: TabId, edit?: string): string {
  const q = new URLSearchParams();
  if (tab !== "overview") q.set("tab", tab);
  if (edit !== undefined) q.set("edit", edit);
  const s = q.toString();
  return s ? `/t/${key}?${s}` : `/t/${key}`;
}

/** The tab (switching one replaces the history entry) and the overlay over it. */
export function useTicketUrl() {
  const [raw, setTab] = useParam("tab", { replace: true });
  const [edit, setEdit] = useParam("edit");
  return {
    tab: TABS.find((t) => t === raw) ?? "overview",
    setTab: (t: string) => {
      setTab(t === "overview" ? null : t);
    },
    edit,
    closeEdit: () => {
      setEdit(null);
    },
  };
}

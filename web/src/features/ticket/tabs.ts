// The ticket page's tabs and overlays live in its URL: `?tab=runs|context|workflow` (Overview has
// none), and `?edit=workflow` (the ticket's workflow, full window) or `?edit=<item name>` (one of
// its context items) over it. Closing an overlay leaves its tab where it was.
import { useSearchParams } from "react-router";

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

export function useTicketUrl() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const set = (name: string, value: string | null) => {
    setParams(
      (p) => {
        const out = new URLSearchParams(p);
        if (value === null) out.delete(name);
        else out.set(name, value);
        return out;
      },
      { replace: name === "tab" },
    );
  };
  return {
    tab: TABS.find((t) => t === raw) ?? "overview",
    setTab: (t: string) => {
      set("tab", t === "overview" ? null : t);
    },
    edit: params.get("edit"),
    closeEdit: () => {
      set("edit", null);
    },
  };
}

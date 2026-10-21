// A ticket's "…" menu (the ticket page's bar, the peek's head): what you take from a ticket to
// elsewhere. Its link and its key go to the clipboard, a toast saying so; its Jira issue and its
// pull request open in a new tab, when it has them.
import type { Ticket } from "../../api/types";
import { Menu, type MenuItem, useToast } from "../../kit";

function useCopy() {
  const say = useToast();
  return (text: string, done: string) => {
    // the browser has a clipboard only on a secure origin (https, or this machine)
    if (!window.isSecureContext) {
      say("Couldn't copy", "The browser has no clipboard on this address.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        say(done);
      },
      () => {
        say("Couldn't copy", "The browser didn't allow it here.");
      },
    );
  };
}

export function TicketMenu({ t, size }: { t: Ticket; size: "sm" | "md" }) {
  const copy = useCopy();
  const take: [MenuItem, ...MenuItem[]] = [
    {
      label: "Copy link",
      icon: "link",
      run: () => {
        copy(`${window.location.origin}/t/${t.key}`, `Copied the link to ${t.key}`);
      },
    },
    {
      label: "Copy key",
      icon: "copy",
      run: () => {
        copy(t.key, `Copied ${t.key}`);
      },
    },
  ];
  const out: MenuItem[] = [
    ...(t.source ? [{ label: `Open ${t.source.ref} in Jira`, href: t.source.url }] : []),
    ...(t.pr_url
      ? [{ label: "Open the pull request", icon: "branch" as const, href: t.pr_url }]
      : []),
  ];
  const [first, ...rest] = out;
  return (
    <Menu
      label={`More on ${t.key}`}
      groups={first ? [take, [first, ...rest]] : [take]}
      size={size}
    />
  );
}

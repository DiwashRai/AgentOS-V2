// A ticket's buttons, from the actions the server says it offers (R11): one strong button at most
// (`you` for a gate's Approve, `ink` for Retry); the accent only for Dispatch run, only on the
// ticket's header. The web applies what the payload leaves to the viewer: the role an action needs.
// W0 is static: they do nothing yet.
import { useSession } from "../../api/queries";
import type { Action, ActionId, Role } from "../../api/types";
import { Button } from "../../kit";

const WORD: Record<ActionId, string> = {
  dispatch: "Dispatch run",
  continue: "Approve",
  retry: "Retry",
  run_from: "Run from…",
  request_changes: "Request changes",
  cancel: "Cancel",
  resolve: "Resolve",
  reopen: "Reopen",
};

/** The variants an action takes: the strong two, the accent (Dispatch on the header), the rest; in a
 *  list's line the gate's primary is outlined and the rest wait for the row's hover or focus. */
type ActionLook = "you" | "ink" | "outline" | "aside" | "accent" | "default";
const VARIANT: Partial<Record<ActionId, "you" | "ink">> = { continue: "you", retry: "ink" };
const RANK: Record<Role, number> = { pending: 0, viewer: 1, writer: 2, admin: 3 };

const strongLast = (shown: readonly Action[]) => [
  ...shown.filter((a) => !VARIANT[a.id]),
  ...shown.filter((a) => VARIANT[a.id]),
];

/** An expanded row's buttons: what the ticket offers, Cancel included, the strong one last. */
export function expandedActions(actions: readonly Action[]): Action[] {
  return strongLast(actions.filter((a) => a.id !== "reopen" && a.id !== "dispatch"));
}

/** A row's buttons: what the ticket offers, the strong one last. */
export function rowActions(actions: readonly Action[]): Action[] {
  return strongLast(
    actions.filter((a) => a.id !== "cancel" && a.id !== "reopen" && a.id !== "dispatch"),
  );
}

/** The header's buttons: everything the ticket offers, the strong one last. */
export function headerActions(actions: readonly Action[]): Action[] {
  const strong = (a: Action) => a.id === "dispatch" || VARIANT[a.id] !== undefined;
  return [...actions.filter((a) => !strong(a)), ...actions.filter(strong)];
}

interface ActionButtonProps {
  action: Action;
  /** xs in a list's dense line, sm elsewhere. */
  size?: "xs" | "sm" | "md";
  /** On the ticket's header, where Dispatch run takes the accent. */
  header?: boolean;
}

/** The server's reason, else the viewer's role falling short of the action's (once the session
 *  says who the viewer is; until then, only the server's state). */
function blockedFor(action: Action, role: Role | undefined): string | null {
  if (action.blocked !== null || role === undefined) return action.blocked;
  return RANK[role] < RANK[action.role] ? `Needs the ${action.role} role` : null;
}

function variantOf(action: Action, header: boolean, line: boolean): ActionLook {
  if (header && action.id === "dispatch") return "accent";
  const look = VARIANT[action.id] ?? "default";
  if (!line) return look;
  return look === "you" ? "outline" : look === "default" ? "aside" : look;
}

export function ActionButton({ action, size = "sm", header = false }: ActionButtonProps) {
  const blocked = blockedFor(action, useSession().data?.me?.role);
  // xs is a list's dense line
  const variant = variantOf(action, header, size === "xs");
  return blocked !== null ? (
    <Button size={size} variant={variant} blocked={blocked}>
      {WORD[action.id]}
    </Button>
  ) : (
    <Button size={size} variant={variant}>
      {WORD[action.id]}
    </Button>
  );
}

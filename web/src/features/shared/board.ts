// What every board screen reads: the tickets, who I am, and the clock.
import { useNow, useSession, useSettings, useTickets } from "../../api/queries";

export function useBoard() {
  const tickets = useTickets();
  const me = useSession().data?.me ?? null;
  const now = useNow(30_000);
  return {
    rows: tickets.data?.items ?? [],
    pending: tickets.isPending,
    error: tickets.error,
    me,
    now,
  };
}

/** A message as the kit's Thread draws it. */
export function threadMessage(
  m: { id: number; author: { id: number; name: string }; body: string; created_at: string },
  me: { id: number } | null,
) {
  const at = new Date(m.created_at);
  return {
    id: m.id,
    name: m.author.name,
    seed: String(m.author.id),
    at: at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    full: at.toLocaleString("en-GB"),
    body: m.body,
    mine: me !== null && m.author.id === me.id,
  };
}

/** The Space's name, which every view's top bar leads its context with. */
export function useSpace(): string {
  return useSettings().data?.space.value.name ?? "AgentOS";
}

/** "Northwind · Every ticket". */
export function contextOf(space: string, ...rest: (string | undefined)[]): string {
  return [space, ...rest].filter(Boolean).join(" · ");
}

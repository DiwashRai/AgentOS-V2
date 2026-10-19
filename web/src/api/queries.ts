// Every read the screens make, as TanStack Query hooks over the injected DataSource. Screens import
// only these hooks and the types (ESLint enforces it), so W11 changes nothing outside api/.
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

import type { DataSource } from "./source";

export const SourceContext = createContext<DataSource | null>(null);

function useSource(): DataSource {
  const source = useContext(SourceContext);
  if (source === null) throw new Error("no DataSource: wrap the app in SourceContext");
  return source;
}

const keys = {
  session: ["session"],
  settings: ["settings"],
  people: ["people"],
  tickets: ["tickets"],
  ticket: (key: string) => ["tickets", key],
  messages: (key: string) => ["tickets", key, "messages"],
  runs: (key: string) => ["tickets", key, "runs"],
  plan: (key: string) => ["tickets", key, "plan"],
  items: (key: string) => ["tickets", key, "items"],
  intake: ["intake"],
} as const;

export function useSession() {
  const source = useSource();
  return useQuery({ queryKey: keys.session, queryFn: () => source.session() });
}

export function useSettings() {
  const source = useSource();
  return useQuery({ queryKey: keys.settings, queryFn: () => source.settings() });
}

export function usePeople() {
  const source = useSource();
  return useQuery({ queryKey: keys.people, queryFn: () => source.people() });
}

export function useTickets() {
  const source = useSource();
  return useQuery({ queryKey: keys.tickets, queryFn: () => source.tickets() });
}

export function useTicket(key: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.ticket(key), queryFn: () => source.ticket(key) });
}

export function useMessages(key: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.messages(key), queryFn: () => source.messages(key) });
}

export function useRuns(key: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.runs(key), queryFn: () => source.runs(key) });
}

export function usePlan(key: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.plan(key), queryFn: () => source.plan(key) });
}

export function useItems(key: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.items(key), queryFn: () => source.items(key) });
}

export function useIntake() {
  const source = useSource();
  return useQuery({ queryKey: keys.intake, queryFn: () => source.intake() });
}

/** The source's clock, re-read every `everyMs` (ages tick by the minute, elapsed times by the second). */
export function useNow(everyMs: number): number {
  const source = useSource();
  const [now, setNow] = useState(() => source.now());
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(source.now());
    }, everyMs);
    return () => {
      window.clearInterval(id);
    };
  }, [source, everyMs]);
  return now;
}

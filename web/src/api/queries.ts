// Every read the screens make, as TanStack Query hooks over the injected DataSource. Screens import
// only these hooks and the types (ESLint enforces it), so W11 changes nothing outside api/.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

import type { DataSource } from "./source";
import type { Item, ItemSummary, Page } from "./types";

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
  item: (key: string, name: string) => ["tickets", key, "items", name],
  ticketWorkflow: (key: string) => ["tickets", key, "workflow"],
  intake: ["intake"],
  workflows: ["library", "workflows"],
  workflow: (id: string) => ["library", "workflows", id],
  agents: ["library", "agents"],
  agent: (id: string) => ["library", "agents", id],
  skills: ["library", "skills"],
  skill: (id: string) => ["library", "skills", id],
  files: ["library", "files"],
  file: (id: string) => ["library", "files", id],
  runtimes: ["runtimes"],
  templateFields: ["template-fields"],
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

/** One of the ticket's items with its content and history (`name` as the items list gives it). */
export function useItem(key: string, name: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.item(key, name), queryFn: () => source.item(key, name) });
}

/** Whether agents may write one of the ticket's items: one switch, the same on the Context tab's
 *  line and in the item's editor. W0 has no writes: the change is kept in the cache, so every
 *  screen that reads the item sees it. */
export function useSetWritable(key: string) {
  const client = useQueryClient();
  return (name: string, writable: boolean) => {
    client.setQueryData<Page<ItemSummary>>(keys.items(key), (old) =>
      old
        ? { ...old, items: old.items.map((i) => (i.name === name ? { ...i, writable } : i)) }
        : old,
    );
    client.setQueryData<Item>(keys.item(key, name), (old) => (old ? { ...old, writable } : old));
  };
}

/** The ticket's copy of its workflow, with where it came from and its drift. */
export function useTicketWorkflow(key: string) {
  const source = useSource();
  return useQuery({
    queryKey: keys.ticketWorkflow(key),
    queryFn: () => source.ticketWorkflow(key),
  });
}

export function useIntake() {
  const source = useSource();
  return useQuery({ queryKey: keys.intake, queryFn: () => source.intake() });
}

export function useWorkflows() {
  const source = useSource();
  return useQuery({ queryKey: keys.workflows, queryFn: () => source.workflows() });
}

export function useWorkflow(id: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.workflow(id), queryFn: () => source.workflow(id) });
}

export function useAgents() {
  const source = useSource();
  return useQuery({ queryKey: keys.agents, queryFn: () => source.agents() });
}

export function useAgent(id: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.agent(id), queryFn: () => source.agent(id) });
}

export function useSkills() {
  const source = useSource();
  return useQuery({ queryKey: keys.skills, queryFn: () => source.skills() });
}

export function useSkill(id: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.skill(id), queryFn: () => source.skill(id) });
}

export function useFiles() {
  const source = useSource();
  return useQuery({ queryKey: keys.files, queryFn: () => source.files() });
}

export function useFile(id: string) {
  const source = useSource();
  return useQuery({ queryKey: keys.file(id), queryFn: () => source.file(id) });
}

export function useRuntimes() {
  const source = useSource();
  return useQuery({ queryKey: keys.runtimes, queryFn: () => source.runtimes() });
}

export function useTemplateFields() {
  const source = useSource();
  return useQuery({ queryKey: keys.templateFields, queryFn: () => source.templateFields() });
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

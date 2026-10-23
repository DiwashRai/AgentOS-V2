// The DataSource served from the invented fixtures (W0 to W10); W11 replaces it with the API.
import {
  ADA,
  INTAKE,
  MESSAGES,
  NOW,
  PEOPLE,
  PLANS,
  RUNS,
  SETTINGS,
  TICKETS,
  ticketOf,
} from "../domain/fixtures";
import {
  AGENTS,
  FILES,
  itemOf,
  itemsOf,
  RUNTIMES,
  SKILLS,
  TEMPLATE_FIELDS,
  ticketWorkflowOf,
  WORKFLOWS,
} from "../domain/library-fixtures";
import { type DataSource, NotFound } from "./source";
import type { Page } from "./types";

const page = <T>(items: readonly T[]): Page<T> => ({ items, next: null });
/** A read of one thing, as the API answers it: read when it's there, else a 404 (NotFound). */
const found = <T>(what: string, there: boolean, read: () => T): Promise<T> =>
  there ? Promise.resolve().then(read) : Promise.reject(new NotFound(what));
const isTicket = (key: string) => TICKETS.some((t) => t.key === key);
/** One library item by id. */
const byId = <T extends { id: string }>(list: readonly T[], id: string): Promise<T> => {
  const hit = list.find((x) => x.id === id);
  return hit ? Promise.resolve(hit) : Promise.reject(new NotFound(id));
};

export const fixtureSource: DataSource = {
  now: () => NOW,
  session: () =>
    Promise.resolve({ auth_mode: "dev", jira_url: "https://northwind.atlassian.example", me: ADA }),
  settings: () => Promise.resolve(SETTINGS),
  people: () => Promise.resolve(PEOPLE),
  tickets: () => Promise.resolve(page(TICKETS)),
  ticket: (key) => found(`ticket ${key}`, isTicket(key), () => ticketOf(key)),
  messages: (key) => Promise.resolve(page(MESSAGES[key] ?? [])),
  runs: (key) => Promise.resolve(page(RUNS[key] ?? [])),
  plan: (key) => Promise.resolve(PLANS[key] ?? null),
  items: (key) => Promise.resolve(page(itemsOf(key))),
  item: (key, name) =>
    found(
      `item ${name} on ${key}`,
      itemsOf(key).some((i) => i.name === name),
      () => itemOf(key, name),
    ),
  ticketWorkflow: (key) => found(`workflow on ${key}`, isTicket(key), () => ticketWorkflowOf(key)),
  intake: () => Promise.resolve(INTAKE),
  workflows: () => Promise.resolve(page(WORKFLOWS)),
  workflow: (id) => byId(WORKFLOWS, id),
  agents: () => Promise.resolve(page(AGENTS)),
  agent: (id) => byId(AGENTS, id),
  skills: () => Promise.resolve(page(SKILLS)),
  skill: (id) => byId(SKILLS, id),
  files: () => Promise.resolve(page(FILES)),
  file: (id) => byId(FILES, id),
  runtimes: () => Promise.resolve(RUNTIMES),
  templateFields: () => Promise.resolve(TEMPLATE_FIELDS),
};

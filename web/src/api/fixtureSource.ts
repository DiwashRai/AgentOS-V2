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
import type { DataSource } from "./source";
import type { Page } from "./types";

const page = <T>(items: readonly T[]): Page<T> => ({ items, next: null });
/** A read that can fail, as the API's would: an unknown key rejects (a 404), it doesn't throw. */
const settle = <T>(read: () => T): Promise<T> =>
  new Promise((resolve) => {
    resolve(read());
  });
/** One library item by id; an unknown id rejects. */
const byId = <T extends { id: string }>(list: readonly T[], id: string): Promise<T> =>
  settle(() => {
    const found = list.find((x) => x.id === id);
    if (!found) throw new Error(`no fixture ${id}`);
    return found;
  });

export const fixtureSource: DataSource = {
  now: () => NOW,
  session: () =>
    Promise.resolve({ auth_mode: "dev", jira_url: "https://northwind.atlassian.example", me: ADA }),
  settings: () => Promise.resolve(SETTINGS),
  people: () => Promise.resolve(PEOPLE),
  tickets: () => Promise.resolve(page(TICKETS)),
  ticket: (key) => settle(() => ticketOf(key)),
  messages: (key) => Promise.resolve(page(MESSAGES[key] ?? [])),
  runs: (key) => Promise.resolve(page(RUNS[key] ?? [])),
  plan: (key) => Promise.resolve(PLANS[key] ?? null),
  items: (key) => Promise.resolve(page(itemsOf(key))),
  item: (key, name) => settle(() => itemOf(key, name)),
  ticketWorkflow: (key) => settle(() => ticketWorkflowOf(key)),
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

// The DataSource served from the invented fixtures (W0 to W10); W11 replaces it with the API.
import {
  ADA,
  INTAKE,
  ITEMS,
  MESSAGES,
  NOW,
  PEOPLE,
  PLANS,
  RUNS,
  SETTINGS,
  TICKETS,
  ticketOf,
} from "../domain/fixtures";
import type { DataSource } from "./source";
import type { Page } from "./types";

const page = <T>(items: readonly T[]): Page<T> => ({ items, next: null });
/** A read that can fail, as the API's would: an unknown key rejects (a 404), it doesn't throw. */
const settle = <T>(read: () => T): Promise<T> =>
  new Promise((resolve) => {
    resolve(read());
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
  items: () => Promise.resolve(page(ITEMS)),
  intake: () => Promise.resolve(INTAKE),
};

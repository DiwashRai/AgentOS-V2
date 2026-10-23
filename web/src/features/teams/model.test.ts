import { describe, expect, it } from "vitest";

import type { Attention, Person, Phase, TicketRow } from "../../api/types";
import { groupsOf, stateOf } from "./model";

const person = (id: number, name: string): Person => ({
  id,
  name,
  avatar: null,
  role: "writer",
  disabled: false,
});
const ADA = person(1, "Ada Park");
const BEA = person(2, "Bea Quinn");

const ticket = (
  key: string,
  repo: string,
  phase: Phase,
  attention: Attention,
  owner: Person | null = ADA,
): TicketRow => ({
  key,
  title: key,
  type: "task",
  priority: "normal",
  state: "open",
  owner,
  repo,
  source: null,
  phase,
  rail: [],
  attention,
  since: "2026-10-23T09:00:00Z",
  now: "",
  plan: null,
  messages: 0,
  actions: [],
  updated_at: "2026-10-23T09:00:00Z",
});

const RUN: Attention = { kind: "running", run_id: 1, agent: "Builder", step: "", progress: null };
const BLOCKED: Attention = { kind: "blocked", reason: "Tests failed" };
const MINE: Attention = { kind: "waiting", on: ADA, ask: "Plan sign-off" };

describe("All teams' groups", () => {
  it("runs a repo's tickets in flight down the stages, what needs you first in a stage", () => {
    const rows = [
      ticket("NW-3", "web", "review", RUN),
      ticket("NW-2", "web", "build", RUN),
      ticket("NW-1", "web", "build", BLOCKED),
      ticket("NW-4", "web", "build", MINE),
      ticket("NW-5", "web", "inbox", { kind: "inbox" }, BEA),
    ];
    const [web] = groupsOf(rows, ["web"], ADA, []).active;
    expect(web?.rows.map((t) => t.key)).toEqual(["NW-4", "NW-1", "NW-2", "NW-3"]);
    expect(web?.tally.map((s) => [s.word, s.n])).toEqual([
      ["need you", 1],
      ["blocked", 1],
      ["running", 2],
    ]);
    expect(web?.people.map((p) => p.name)).toEqual(["Ada Park", "Bea Quinn"]);
  });

  it("calls a repo with nothing in flight quiet, whatever the search leaves", () => {
    const rows = [
      ticket("NW-1", "web", "build", RUN),
      ticket("NW-2", "docs", "inbox", { kind: "inbox" }),
    ];
    const { active, quiet } = groupsOf(rows, ["web", "docs"], ADA, ["nomatch"]);
    expect(active.map((g) => [g.repo, g.rows.length])).toEqual([["web", 0]]);
    expect(quiet.map((g) => g.repo)).toEqual(["docs"]);
  });
});

describe("a ticket's state in words", () => {
  it("says your move in the accent and someone else's by name", () => {
    expect(stateOf(ticket("NW-1", "web", "plan", MINE), ADA)).toMatchObject({ tone: "you" });
    expect(stateOf(ticket("NW-1", "web", "plan", MINE), BEA)).toMatchObject({
      text: "Plan sign-off · Ada",
      tone: "plain",
    });
  });
});

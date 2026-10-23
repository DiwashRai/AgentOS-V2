import { describe, expect, it } from "vitest";

import type { Attention, Person, TicketRow } from "../api/types";
import { ADA, BEA, TICKETS } from "./fixtures";
import { groupOf, stageModel } from "./board";

const waiting = (on: Person | null): Pick<TicketRow, "attention"> => ({
  attention: { kind: "waiting", on, ask: "Plan sign-off" },
});

const row = (key: string): TicketRow => {
  const t = TICKETS.find((x) => x.key === key);
  if (!t) throw new Error(key);
  return t;
};

describe("who a ticket waits on, for each viewer (R13)", () => {
  it("is my move when it waits on me or on nobody, and someone else's otherwise", () => {
    expect(groupOf(waiting(ADA), ADA)).toBe("needs_you");
    expect(groupOf(waiting(null), BEA)).toBe("needs_you");
    expect(groupOf(waiting(ADA), BEA)).toBe("waiting");
  });

  it("shows the gate a ticket is parked at as mine or as theirs", () => {
    const t = row("NW-14");
    const gateFor = (me: Person) => stageModel(t, me).stages.find((s) => s.gate)?.gate?.state;
    expect(gateFor(ADA)).toBe("you");
    expect(gateFor(BEA)).toBe("waiting");
  });
});

describe("the stage glyph's model", () => {
  it("stops an abandoned ticket at the first stage it didn't finish, and leaves Done ahead", () => {
    const abandoned: Attention = { kind: "done", outcome: "abandoned", note: null };
    const m = stageModel({ ...row("NW-7"), attention: abandoned }, ADA);
    expect(m.closed).toBe(true);
    expect(m.stages.filter((s) => s.state === "failed").map((s) => s.name)).toEqual(["Open a PR"]);
    expect(m.stages.at(-1)?.state).toBe("upcoming");
  });

  it("draws a running ticket's current stage live", () => {
    const m = stageModel(row("NW-17"), ADA);
    expect(m.live).toBe(true);
    expect(m.stages.find((s) => s.state === "current")?.name).toBe("Implement");
  });
});

import { describe, expect, it } from "vitest";

import { ADA } from "./fixtures";
import {
  ago,
  agoInWords,
  fromAssignee,
  fromAuthor,
  fromPerson,
  fromStarter,
  nameOf,
} from "./format";

describe("how long ago", () => {
  it("is to the minute, and under a minute is just now", () => {
    const now = Date.parse("2026-10-23T12:00:00Z");
    expect(ago("2026-10-23T08:50:00Z", now)).toBe("3h 10m ago");
    expect(ago("2026-10-23T11:59:40Z", now)).toBe("just now");
  });

  it("is said in full words in an age's tooltip", () => {
    const now = Date.parse("2026-10-23T12:00:00Z");
    expect(agoInWords("2026-10-23T08:50:00Z", now)).toBe("3 hours 10 minutes ago");
    expect(agoInWords("2026-10-23T11:59:00Z", now)).toBe("1 minute ago");
    expect(agoInWords("2026-10-21T09:00:00Z", now)).toBe("2 days ago");
  });
});

describe("someone's name", () => {
  it("is the first in a cell and full elsewhere, and nobody is Unassigned", () => {
    expect([nameOf(fromPerson(ADA), false), nameOf(fromPerson(ADA), true)]).toEqual([
      "Ada",
      "Ada Park",
    ]);
    const run = fromAuthor({ kind: "run", run_id: 42, ticket: "NW-17" });
    expect([nameOf(run, false), nameOf(run, true)]).toEqual(["Run #42", "Run #42 on NW-17"]);
    expect(nameOf(fromPerson(null), true)).toBe("Unassigned");
    expect(nameOf(fromAssignee(null), false)).toBe("Unassigned");
  });

  it("is AgentOS for a run no person started, not Unassigned", () => {
    expect(nameOf(fromStarter(null), true)).toBe("AgentOS");
    expect(nameOf(fromStarter(ADA), true)).toBe("Ada Park");
  });
});

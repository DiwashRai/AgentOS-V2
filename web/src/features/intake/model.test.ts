import { describe, expect, it } from "vitest";

import type { IntakeQuery } from "../../api/types";
import { onlyOf } from "./model";

const query = (name: string): IntakeQuery => ({
  name,
  jql: "project = SUP",
  result: { kind: "issues", issues: [], total: 0 },
});

describe("Intake's ?only=", () => {
  it("names one of the queries there are, and any other name is as if absent", () => {
    const queries = [query("Support"), query("Platform")];
    expect(onlyOf("Platform", queries)).toBe("Platform");
    expect(onlyOf("Gone", queries)).toBeNull();
    expect(onlyOf(null, queries)).toBeNull();
  });
});

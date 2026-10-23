import { describe, expect, it } from "vitest";

import { ADA } from "./fixtures";
import { fromAssignee, fromAuthor, fromPerson, nameOf } from "./format";

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
});

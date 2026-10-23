import { describe, expect, it } from "vitest";

import { chipWords } from "./model";

describe("a Now chip's words", () => {
  it("names who a ticket waits on before what it waits for", () => {
    expect(chipWords({ kind: "wait", name: "Bea", ask: "Plan sign-off" })).toBe(
      "Bea · Plan sign-off",
    );
  });
  it("says your move when it asks nothing", () => {
    expect(chipWords({ kind: "you" })).toBe("Your move");
  });
  it("says the ask alone for your move", () => {
    expect(chipWords({ kind: "you", ask: "Sign off the plan" })).toBe("Sign off the plan");
  });
});

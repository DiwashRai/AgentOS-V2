import { describe, expect, it } from "vitest";

import { chipWords } from "./model";

describe("a Now chip's words", () => {
  it("names who a ticket waits on before what it waits for", () => {
    expect(chipWords({ kind: "wait", name: "Bea", ask: "Plan sign-off" })).toBe(
      "Bea · Plan sign-off",
    );
  });
  it("says the state when it names no one", () => {
    expect(chipWords({ kind: "run" })).toBe("Running");
  });
  it("says the ask alone for your move", () => {
    expect(chipWords({ kind: "you", ask: "Sign off the plan" })).toBe("Sign off the plan");
  });
});

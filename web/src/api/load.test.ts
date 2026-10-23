import { describe, expect, it } from "vitest";

import { fixtureSource } from "./fixtureSource";
import { loadOf } from "./queries";
import { NotFound } from "./source";

describe("a read of one thing that isn't there (the source's boundary)", () => {
  it("rejects with NotFound, as the API's 404", async () => {
    await expect(fixtureSource.ticket("NW-404")).rejects.toBeInstanceOf(NotFound);
    await expect(fixtureSource.ticketWorkflow("NW-404")).rejects.toBeInstanceOf(NotFound);
    await expect(fixtureSource.item("NW-17", "NOPE.md")).rejects.toBeInstanceOf(NotFound);
    await expect(fixtureSource.agent("nobody")).rejects.toBeInstanceOf(NotFound);
  });
});

describe("a read's state, as the screens say it (loadOf)", () => {
  it("is its data once there, and pending until then", () => {
    expect(loadOf({ status: "success", data: 7 })).toEqual({ kind: "ready", data: 7 });
    expect(loadOf({ status: "pending" })).toEqual({ kind: "pending" });
  });

  it("is missing for a NotFound, and the server out of reach for any other failure", () => {
    expect(loadOf({ status: "error", error: new NotFound("ticket NW-404") })).toEqual({
      kind: "missing",
    });
    expect(loadOf({ status: "error", error: new Error("Failed to fetch") })).toEqual({
      kind: "unreachable",
      message: "Failed to fetch",
    });
  });
});

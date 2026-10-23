import { describe, expect, it } from "vitest";

import { patternProblems, staleSingles } from "./patterns.mjs";

const pattern = (changes) => ({
  file: "patterns/who.tsx",
  name: "Who",
  screens: ["intake", "teams"],
  props: { who: [], place: [] },
  ...changes,
});

describe("the patterns", () => {
  it("passes a component two screens import, with domain props", () => {
    expect(patternProblems([pattern({})], 8)).toEqual([]);
  });

  it("wants two screens for every export, a component or not", () => {
    const problems = patternProblems(
      [pattern({ screens: ["teams"] }), pattern({ name: "LINE_END", screens: [], props: null })],
      8,
    );
    expect(problems).toHaveLength(2);
    expect(problems[1]).toContain("LINE_END");
  });

  it("refuses a prop typed with the kit's own types", () => {
    const problems = patternProblems([pattern({ props: { who: [], look: ["MarkKind"] } })], 8);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Who.look");
  });

  it("holds a component to the kit's props budget", () => {
    const problems = patternProblems([pattern({})], 1);
    expect(problems).toHaveLength(1);
  });
});

describe("the kit's single reasons", () => {
  it("names a single reason on a component two screens now draw", () => {
    const led = { components: { Tabs: { single: "one screen" }, Drag: { single: "one screen" } } };
    const uses = new Map([
      ["Tabs", new Set(["ticket", "workflow"])],
      ["Drag", new Set(["workflow"])],
    ]);
    const problems = staleSingles(uses, led);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Tabs");
  });
});

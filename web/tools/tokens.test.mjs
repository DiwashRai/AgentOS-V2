import { describe, expect, it } from "vitest";

import { repeatedTokens } from "./tokens.mjs";

describe("the kit's tokens", () => {
  it("finds a token two plain :root blocks both define", () => {
    const css = ":root { --h-check: 36px; }\n/* forms */\n:root { --h-check: 14px; --h-pip: 6px; }";
    expect(repeatedTokens(css)).toEqual(["--h-check"]);
  });

  it("lets each theme define the same token", () => {
    const css =
      ':root:not([data-theme]), [data-theme="light"] { --ink: x; }\n[data-theme="dark"] { --ink: y; }';
    expect(repeatedTokens(css)).toEqual([]);
  });

  it("finds a colour two shared-selector blocks both define", () => {
    const css =
      ":root:not([data-theme]),\n[data-theme] { --lane: x; }\n:root:not([data-theme]), [data-theme] { --lane: y; }";
    expect(repeatedTokens(css)).toEqual(["--lane"]);
  });

  it("reads past a name in a comment", () => {
    expect(repeatedTokens(":root { --a: 1px; /* not --a: 2px */ }")).toEqual([]);
  });
});

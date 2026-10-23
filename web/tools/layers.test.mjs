import { rmSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { layerProblems } from "./layers.mjs";
import { open, readModules } from "./reach.mjs";
import { tree } from "./tree.mjs";

// The reviewers' ways past the import rules, each in a tree the real compiler resolves.
const FILES = {
  "main.tsx": `import { App } from "./app/App";\nimport "./kit";\nexport { App };\n`,
  "app/App.tsx": `export const App = () => import("../features/ticket/RunsTab");\n`,
  "kit/index.ts": `import "./base.css";\nexport { Checklist } from "./Checklist";\n`,
  "kit/base.css": "",
  "kit/Checklist.tsx": `export function Checklist() {\n  return <div />;\n}\n`,
  "domain/fixtures.ts": `export const ADA = 1;\n`,
  "domain/format.ts": `export const plural = (n: number) => String(n);\n`,
  "api/types.ts": `export type Iso = string;\n`,
  "api/queries.ts": `export const useTickets = () => 1;\n`,
  "features/compact/model.ts": `export const nowLine = 1;\n`,
  "features/ticket/RunsTab.tsx": [
    `import { nowLine } from "./../compact/model";`,
    `import { nowLine as again } from "../shared/../compact/model";`,
    `import { Checklist } from "../../kit";`,
    `import { useTickets } from "../../api/queries";`,
    `import { plural } from "../../domain/format";`,
    `export const RunsTab = () => [nowLine, again, Checklist, useTickets, plural, import("../compact/model")];`,
    ``,
  ].join("\n"),
  "features/queue/QueueView.tsx": `export { RunsTab } from "../shared/../ticket/RunsTab";\n`,
  "features/shared/peek.ts": `import { RunsTab } from "./../ticket/RunsTab";\nexport const peek = RunsTab;\n`,
  "patterns/who.tsx": [
    `import { useQuery } from "@tanstack/react-query";`,
    `import { ADA } from "../domain/fixtures.js";`,
    `import { ADA as again } from "../domain/./fixtures";`,
    `import { Link } from "react-router";`,
    `import { Menu } from "@base-ui/react/menu";`,
    `import type { Iso } from "../api/types";`,
    `export const Who = (at: Iso) => [useQuery, ADA, again, Link, Menu, at, import("../api/queries")];`,
    ``,
  ].join("\n"),
  "ui/Badge.tsx": `export const Badge = 1;\n`,
  "features/intake/IntakeView.tsx": [
    `import * as React from "react";`,
    `import { createElement as h } from "react";`,
    `const Div = "div";`,
    `export const A = () => <Div />;`,
    `export const B = () => React.createElement("span");`,
    `export const C = () => h("p", { style: { color: "red" } });`,
    ``,
  ].join("\n"),
};

let root;
let problems;
beforeAll(() => {
  root = tree(FILES);
  problems = layerProblems(readModules(open(root)));
});
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});
const at = (where) => problems.filter((p) => p.startsWith(where));

describe("the layers, on what each import resolves to", () => {
  it("keeps a screen from another screen, however the path is spelled", () => {
    expect(at("features/ticket/RunsTab.tsx:1 ")).toHaveLength(1);
    expect(at("features/ticket/RunsTab.tsx:2 ")).toHaveLength(1);
    expect(at("features/queue/QueueView.tsx:1 ")).toHaveLength(1); // a re-export
    expect(at("features/shared/peek.ts:1 ")).toHaveLength(1);
  });

  it("lets a screen import the kit's index, the query hooks, the domain", () => {
    expect(at("features/ticket/RunsTab.tsx:3 ")).toEqual([]);
    expect(at("features/ticket/RunsTab.tsx:4 ")).toEqual([]);
    expect(at("features/ticket/RunsTab.tsx:5 ")).toEqual([]);
  });

  it("allows a pattern only the kit, the domain, the API's types, other patterns and React", () => {
    const lines = at("patterns/who.tsx").map((p) => p.split(" ")[0]);
    expect(lines).toEqual([1, 2, 3, 4, 5, 7].map((n) => `patterns/who.tsx:${String(n)}`));
  });

  it("leaves a lazy import to the app", () => {
    expect(at("features/ticket/RunsTab.tsx:6 ")).toHaveLength(1);
    expect(at("app/")).toEqual([]);
  });

  it("puts every file in a layer", () => {
    expect(at("ui/Badge.tsx")).toHaveLength(1);
    expect(at("main.tsx")).toEqual([]);
    expect(at("kit/")).toEqual([]);
  });

  it("finds an element made without a tag outside the kit", () => {
    const lines = at("features/intake/IntakeView.tsx").map((p) => p.split(" ")[0]);
    expect(lines).toEqual([4, 5, 6].map((n) => `features/intake/IntakeView.tsx:${String(n)}`));
  });
});

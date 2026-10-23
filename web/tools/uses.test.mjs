import { rmSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { knobProblems, patternProblems, sharedProblems } from "./patterns.mjs";
import { tree } from "./tree.mjs";
import { readWeb } from "./uses.mjs";

// A kit of three, the patterns that use it (some in disguise), and screens that reach them in the
// ways the reviewers found: through a shared module that takes one name, by a type-only import,
// by a re-export.
const FILES = {
  "kit/index.ts": [
    `export type Tone = "1" | "2";`,
    `export interface ChecklistProps { look?: "bare" | "page" | "peek" }`,
    `export function Checklist(p: ChecklistProps) { return p.look ?? null; }`,
    `export function Avatar(p: { name: string }) { return p.name; }`,
    `export function Text(p: { tone?: Tone }) { return p.tone ?? null; }`,
    ``,
  ].join("\n"),
  "patterns/who.tsx": [
    `import { Avatar } from "../kit";`,
    `export function Who({ name }: { name: string }) { return <Avatar name={name} />; }`,
    ``,
  ].join("\n"),
  "patterns/plan.tsx": [
    `import { Checklist } from "../kit";`,
    `export function Plan({ place }: { place: "page" | "peek" }) { return <Checklist look={place} />; }`,
    `export function Steps(props: { where: "page" | "peek" }) { return <Checklist look={props.where} />; }`,
    `const LOOK = { page: "page", peek: "peek" } as const;`,
    `export function Mapped({ place }: { place: "page" | "peek" }) { return <Checklist look={LOOK[place]} />; }`,
    ``,
  ].join("\n"),
  "patterns/disguise.tsx": [
    `import { Checklist, type ChecklistProps, type Tone } from "../kit";`,
    `type Alias = ChecklistProps["look"];`,
    `interface Appearance { tone: Tone }`,
    `type PropsOf<T> = T extends (p: infer P) => unknown ? P : never;`,
    `export function A({ look }: { look: Alias }) { return look; }`,
    `export function B({ appearance }: { appearance: Appearance }) { return appearance; }`,
    `export function C({ look }: { look: PropsOf<typeof Checklist>["look"] }) { return look; }`,
    `export function lineEnd({ shade }: { shade: { deep: Tone }[] }) { return shade; }`,
    `export function D({ ok }: { ok: string }) { return ok; }`,
    ``,
  ].join("\n"),
  "features/shared/parts.ts": [
    `import { Who } from "../../patterns/who";`,
    `import { Plan } from "../../patterns/plan";`,
    `export const usesWho = () => Who;`,
    `export const usesPlan = () => Plan;`,
    ``,
  ].join("\n"),
  "features/a/A.tsx": [
    `import { usesWho } from "../shared/parts";`,
    `export const A = () => usesWho();`,
    ``,
  ].join("\n"),
  "features/b/B.tsx": [
    `import type { Who } from "../../patterns/who";`,
    `import { Plan } from "../../patterns/plan";`,
    `export type Signature = typeof Who | typeof Plan;`,
    ``,
  ].join("\n"),
  "features/c/C.tsx": `export { Who, Plan } from "../../patterns/who";\n`,
  "features/d/D.tsx": [
    `import { Who } from "../../patterns/who";`,
    `export const D = () => <Who name="Ada" />;`,
    ``,
  ].join("\n"),
};

let root;
let web;
beforeAll(() => {
  root = tree(FILES);
  web = readWeb(root);
});
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});
const pattern = (file, name) => web.patterns.find((p) => p.file === file && p.name === name);

describe("a screen's credit, by the names it uses", () => {
  it("credits what a shared module's used name reaches, not all it imports", () => {
    expect(pattern("patterns/who.tsx", "Who").screens).toEqual(["a", "d"]);
    expect(pattern("patterns/plan.tsx", "Plan").screens).toEqual([]);
    expect([...web.used.get("Avatar")].sort()).toEqual(["a", "d"]);
    expect(web.used.get("Checklist")).toBeUndefined();
  });

  it("gives a type-only import and a re-export no credit", () => {
    expect(pattern("patterns/who.tsx", "Who").screens).not.toContain("b");
    expect(pattern("patterns/who.tsx", "Who").screens).not.toContain("c");
  });

  it("holds features/shared to two screens", () => {
    const problems = sharedProblems(web.shared);
    expect(problems).toHaveLength(2);
    expect(problems.join("\n")).toContain("usesWho: used by 1 screen");
    expect(problems.join("\n")).toContain("usesPlan: used by 0 screens");
  });
});

describe("a pattern's props, through its types", () => {
  it("finds the kit's types however they are named", () => {
    const problems = patternProblems(web.patterns, 8).filter((p) => p.includes("typed with"));
    const props = problems.map((p) => p.split(":")[0]);
    expect(props).toEqual([
      "patterns/disguise.tsx A.look",
      "patterns/disguise.tsx B.appearance",
      "patterns/disguise.tsx C.look",
      "patterns/disguise.tsx lineEnd.shade",
    ]);
  });

  it("calls a prop handed unchanged to a kit variant a styling knob", () => {
    const problems = knobProblems(web.knobs).map((p) => p.split(":")[0]);
    expect(problems).toEqual(["patterns/plan.tsx Plan.place", "patterns/plan.tsx Steps.where"]);
  });
});

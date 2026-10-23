import { rmSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { knobProblems, patternProblems, sharedProblems } from "./patterns.mjs";
import { tree } from "./tree.mjs";
import { readWeb } from "./uses.mjs";

// A kit of three, the patterns that use it (some in disguise), and screens that reach them in the
// ways the reviewers found: through a shared module that takes one name, by a type-only import,
// by a re-export, by naming it in code nothing runs. The app routes to each screen.
const FILES = {
  "main.tsx": `import { App } from "./app/App";\nexport const root = App;\n`,
  "app/App.tsx": [
    `import { A } from "../features/a/A";`,
    `import { B } from "../features/b/B";`,
    `import { Who } from "../features/c/C";`,
    `import { D } from "../features/d/D";`,
    `import { GView } from "../features/g";`,
    `import { E } from "../features/e/E";`,
    `import { F } from "../features/f/F";`,
    `export const App = () => [A, B, Who, D, E, F, GView];`,
    `export const lazyH = async () => (await import("../features/h/H")).H;`,
    ``,
  ].join("\n"),
  "kit/index.ts": [
    `export type Tone = "1" | "2";`,
    `export interface ChecklistProps { look?: "bare" | "roomy" | "snug" }`,
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
    `import { forwardRef, memo } from "react";`,
    `import { Checklist } from "../kit";`,
    `export function Plan({ place }: { place: "roomy" | "snug" }) { return <Checklist look={place} />; }`,
    `export function Steps(props: { where: "roomy" | "snug" }) { return <Checklist look={props.where} />; }`,
    `const LOOK = { page: "roomy", peek: "snug" } as const;`,
    `export function Mapped({ place }: { place: "page" | "peek" }) { return <Checklist look={LOOK[place]} />; }`,
    `type Look = "roomy" | "snug";`,
    `export const Memo = memo(function Memo({ place }: { place: Look }) { return <Checklist look={place} />; });`,
    `export const Fwd = forwardRef(({ place }: { place: Look }, ref) => <Checklist look={place} />);`,
    `export function Rest({ items, ...rest }: { items: string; look: Look }) { return <Checklist {...rest} />; }`,
    `export function Whole(props: { look: Look }) { return <Checklist {...props} />; }`,
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
    `export function G<T extends Tone>({ tone }: { tone: T }) { return tone; }`,
    ``,
  ].join("\n"),
  // a screen's export nothing imports: code that never runs
  "features/e/E.tsx": [
    `import { Plan } from "../../patterns/plan";`,
    `export const keep = [Plan];`,
    `export const E = 1;`,
    ``,
  ].join("\n"),
  "features/f/F.tsx": [
    `import { Plan } from "../../patterns/plan";`,
    `export const keep = [Plan];`,
    `export const F = 1;`,
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
    `export const B = 1;`,
    ``,
  ].join("\n"),
  "features/c/C.tsx": `export { Who, Plan } from "../../patterns/who";\n`,
  // a screen behind its own barrel, through a shared one; a screen the app loads lazily
  "features/g/index.ts": `export { GView } from "./GView";\n`,
  "features/g/GView.tsx": [
    `import { usesWho } from "../shared/again";`,
    `export const GView = () => usesWho();`,
    ``,
  ].join("\n"),
  "features/shared/again.ts": [
    `export { usesWho } from "./parts";`,
    `export { usesPlan as unusedPlan } from "./parts";`,
    ``,
  ].join("\n"),
  "features/h/H.tsx": [
    `import { Who } from "../../patterns/who";`,
    `export const H = () => <Who name="Cy" />;`,
    ``,
  ].join("\n"),
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
    expect(pattern("patterns/who.tsx", "Who").screens).toEqual(["a", "d", "g", "h"]);
    expect(pattern("patterns/plan.tsx", "Plan").screens).toEqual([]);
    expect([...web.used.get("Avatar")].sort()).toEqual(["a", "d", "g", "h"]);
    expect(web.used.get("Checklist")).toBeUndefined();
  });

  it("gives code nothing runs no credit", () => {
    expect(pattern("patterns/plan.tsx", "Plan").screens).not.toContain("e");
    expect(pattern("patterns/plan.tsx", "Plan").screens).not.toContain("f");
  });

  it("gives a type-only import and a re-export no credit", () => {
    expect(pattern("patterns/who.tsx", "Who").screens).not.toContain("b");
    expect(pattern("patterns/who.tsx", "Who").screens).not.toContain("c");
  });

  it("follows a re-export and a lazy import that are used, and credits an unused one nothing", () => {
    const problems = sharedProblems(web.shared).map((p) => p.split(";")[0]);
    expect(problems.sort()).toEqual([
      "features/shared/again.ts unusedPlan: used by 0 screens",
      "features/shared/again.ts usesWho: used by 1 screen",
      "features/shared/parts.ts usesPlan: used by 0 screens",
    ]);
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
      "patterns/disguise.tsx G.tone",
    ]);
  });

  it("calls a prop handed unchanged to a kit variant a styling knob, through a wrapper or a spread", () => {
    const problems = knobProblems(web.knobs).map((p) => p.split(":")[0]);
    expect(problems).toEqual([
      "patterns/plan.tsx Plan.place",
      "patterns/plan.tsx Steps.where",
      "patterns/plan.tsx Memo.place",
      "patterns/plan.tsx Fwd.place",
      "patterns/plan.tsx Rest.look",
      "patterns/plan.tsx Whole.look",
    ]);
  });
});

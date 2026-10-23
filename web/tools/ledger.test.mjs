import { describe, expect, it } from "vitest";

import { ledgerProblems, mergeProp } from "./ledger.mjs";

const VOCAB = { Width: ["sm", "fill"], Length: ["sm"] };
const VOCAB_LEDGER = {
  Width: { why: "widths", values: { sm: "small", fill: "the rest" } },
  Length: { why: "lengths", of: "Width" },
};
const ledger = (props) => ({
  budget: { props: 8 },
  vocab: VOCAB_LEDGER,
  components: { Cell: { why: "a cell", props } },
});
const kit = (props) => ({ Cell: { props } });
const shape = (values, vocabs = []) => ({ vocabs, values, items: {}, array: false });

describe("the kit ledger", () => {
  it("takes a vocabulary prop's reasons from the vocabulary", () => {
    const problems = ledgerProblems(
      kit({ width: shape([], ["Width"]) }),
      VOCAB,
      ledger({ width: { why: "how wide" } }),
    );
    expect(problems).toEqual([]);
  });

  it("wants a reason for a value a union adds beside a vocabulary", () => {
    const problems = ledgerProblems(
      kit({ width: shape(["auto"], ["Width"]) }),
      VOCAB,
      ledger({ width: { why: "how wide" } }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("width=auto");
  });

  it("names a reason beside a vocabulary the kit no longer has", () => {
    const problems = ledgerProblems(
      kit({ width: shape([], ["Width"]) }),
      VOCAB,
      ledger({ width: { why: "how wide", values: { auto: "its own" } } }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("width=auto");
  });

  it("checks every vocabulary a union's cases give one prop, whatever their order", () => {
    const width = shape([], ["Width"]);
    const length = shape([], ["Length"]);
    const lost = {
      ...ledger({ width: { why: "how wide" } }),
      vocab: { Length: VOCAB_LEDGER.Width },
    };
    for (const merged of [mergeProp(width, length), mergeProp(length, width)]) {
      expect(merged.vocabs.sort()).toEqual(["Length", "Width"]);
      const problems = ledgerProblems(kit({ width: merged }), VOCAB, lost);
      expect(problems.some((p) => p.includes("vocabulary Width"))).toBe(true);
    }
  });

  it("takes a narrowing vocabulary's reasons from the one it narrows", () => {
    const missing = { ...VOCAB, Length: ["sm", "xl"] };
    const problems = ledgerProblems(kit({}), missing, ledger({}));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("Length=xl");
  });

  it("wants a reason for each literal of a prop of its own", () => {
    const problems = ledgerProblems(
      kit({ tone: shape(["quiet", "loud"]) }),
      VOCAB,
      ledger({ tone: { why: "its tone", values: { quiet: "calm" } } }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("tone=loud");
  });
});

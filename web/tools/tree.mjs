// A web tree for the tools' tests: a tsconfig like the web's and the given files under src/, in a
// fresh temporary folder, so the checks run through the real compiler on the reviewers' cases.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const TSCONFIG = {
  compilerOptions: {
    target: "ES2023",
    module: "ESNext",
    moduleResolution: "bundler",
    jsx: "react-jsx",
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  },
  include: ["src"],
};

/** @param {Record<string, string>} files each file's text, by its path under src/ */
export function tree(files) {
  const root = mkdtempSync(join(tmpdir(), "web-tree-"));
  writeFileSync(join(root, "tsconfig.json"), JSON.stringify(TSCONFIG));
  for (const [rel, text] of Object.entries(files)) {
    const path = join(root, "src", rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }
  return root;
}

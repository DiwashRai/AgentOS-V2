// Count a web's components, tokens and raw values, the same way for V1's web and V2's, so the two
// compare like for like. Usage: node tools/count.mjs [--features a,b] <web dir> [<another web dir>]
// (markdown). `--features` limits "screens" to those src/features folders in every web, so a web
// with more screens than the other compares on the same ones.
//   components   React components defined (PascalCase functions, or a PascalCase const bound to an
//                arrow function, memo or forwardRef, in .tsx), split by where they live
//   kit          the components the kit exports (src/kit/index.ts, or V1's src/ui/index.ts): its
//                PascalCase value exports that a .tsx file in the kit defines as a component
//   tokens       custom properties defined in tokens.css
//   raw values   lengths (px, rem, em) and colours (hex, rgb(), hsl()) in CSS outside tokens.css,
//                and in screens' TypeScript
//   raw tags     JSX intrinsic elements in screens (src/features), by the gates' own measure
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MEASURES = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../tools/gates/ts_measures.mjs",
);
const RAW = /\b\d+(?:\.\d+)?(?:px|rem|em)\b|#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g;
const COMPONENT =
  /^(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*[<(]|^(?:export\s+)?const\s+([A-Z]\w*)(?:\s*:[^=]+)?\s*=\s*(?:(?:React\.)?(?:memo|forwardRef)\b|(?:async\s+)?(?:\([^)]*\)|\w+)\s*(?::[^=]+)?=>)/gm;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules") return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const codeLines = (text) =>
  text.split("\n").filter((l) => l.trim() && !/^\s*(\/\/|\/\*|\*)/.test(l)).length;
/** The text without comments, so a "2px" in a comment isn't a raw value. */
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

function count(web, features) {
  const src = join(web, "src");
  const rel = (p) => relative(src, p).replace(/\\/g, "/");
  const feature = (p) => (rel(p).startsWith("features/") ? rel(p).split("/")[1] : null);
  const files = walk(src).filter(
    (p) =>
      !/\.test\.tsx?$/.test(p) &&
      !/schema\.ts$|openapi\.json$|fixtures\.ts$/.test(p) &&
      (features === null || feature(p) === null || features.includes(feature(p))),
  );
  const area = (p) =>
    feature(p) !== null ? "screens" : /^(kit|ui)\//.test(rel(p)) ? "kit" : "other";
  const read = (p) => readFileSync(p, "utf8");
  const raw = (p) => (code(read(p)).match(RAW) ?? []).length;
  const tsx = files.filter((p) => p.endsWith(".tsx"));
  const css = files.filter((p) => p.endsWith(".css"));
  const tokensFile = css.find((p) => p.endsWith("tokens.css"));
  const comps = { kit: 0, screens: 0, other: 0 };
  const defined = (p) => [...read(p).matchAll(COMPONENT)].map((m) => m[1] ?? m[2]);
  for (const p of tsx) comps[area(p)] += defined(p).length;
  const kitDefined = new Set(tsx.filter((p) => area(p) === "kit").flatMap(defined));
  const index = ["kit/index.ts", "ui/index.ts"].map((f) => join(src, f)).find(existsSync);
  // Exported components: names in the index's export lists (types and constants aside) that the
  // kit defines as components.
  const exported = index
    ? [...read(index).matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) => m[1].split(","))
    : [];
  const kitExports = new Set(
    exported
      .map((e) =>
        e
          .trim()
          .split(/\s+as\s+/)
          .pop(),
      )
      .filter((e) => e !== undefined && kitDefined.has(e)),
  );
  const tokens = tokensFile
    ? new Set([...read(tokensFile).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])).size
    : 0;
  const rawCss = css.filter((p) => p !== tokensFile).reduce((n, p) => n + raw(p), 0);
  const screenTs = files.filter((p) => area(p) === "screens" && /\.tsx?$/.test(p));
  const rawScreens = screenTs.reduce((n, p) => n + raw(p), 0);
  const screenTsx = screenTs
    .filter((p) => p.endsWith(".tsx"))
    .map((p) => relative(web, p).replace(/\\/g, "/"));
  const tags = screenTsx.length
    ? Object.values(
        JSON.parse(
          execFileSync("node", [MEASURES, web, ...screenTsx], {
            encoding: "utf8",
            maxBuffer: 1 << 26,
          }),
        ),
      ).reduce((n, m) => n + m.raw_tags.length, 0)
    : 0;
  const cssLines = (ps) => ps.reduce((n, p) => n + codeLines(read(p)), 0);
  return {
    "components (all)": comps.kit + comps.screens + comps.other,
    "  components in the kit": comps.kit,
    "  components in screens": comps.screens,
    "  components elsewhere (app, shell)": comps.other,
    "kit exports": kitExports.size,
    tokens,
    "raw values in CSS (outside tokens.css)": rawCss,
    "raw values in screens' TypeScript": rawScreens,
    "raw tags in screens": tags,
    "CSS code lines (all, tokens included)": cssLines(css),
    "  CSS code lines in screens": cssLines(css.filter((p) => area(p) === "screens")),
    "screen TypeScript code lines": screenTs.reduce((n, p) => n + codeLines(read(p)), 0),
  };
}

const args = process.argv.slice(2);
const at = args.indexOf("--features");
const features = at >= 0 ? args[at + 1].split(",") : null;
const dirs = args.filter((_, i) => at < 0 || (i !== at && i !== at + 1));
if (dirs.length === 0) {
  console.error("usage: node tools/count.mjs [--features a,b] <web dir> [<another web dir>]");
  process.exit(2);
}
const results = dirs.map((d) => count(resolve(d), features));
if (features) console.log(`Screens: ${features.join(", ")}\n`);
console.log(`| Measure | ${dirs.join(" | ")} |\n|---|${dirs.map(() => "---:").join("|")}|`);
for (const key of Object.keys(results[0]))
  console.log(`| ${key} | ${results.map((r) => r[key]).join(" | ")} |`);

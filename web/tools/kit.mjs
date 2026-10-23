// The kit's gates, so ad hoc code can't just move into the kit (W0):
//   ledger  every kit component, prop and variant (string and number literals, and the fields
//           of the kit's own object and item shapes inside a prop, three levels down) has a
//           one-line reason in src/kit/ledger.json (`items` holds the fields); a prop typed with one of
//           the kit's vocabularies (Space, Width, Length, Tone, MarkKind, IconName) takes the
//           vocabulary's reasons, given once; the ledger names nothing the kit doesn't have (the
//           rules are ./ledger.mjs, tested beside it);
//   budget  at most `budget.components` components, `budget.props` props each, `budget.lines`
//           code lines in src/kit; raising one against the base needs a `raises` entry (the
//           owner's to add, as the gate baseline's are). The budget is a checkpoint, not a wall:
//           a failure means ask the owner, with the reuse tried first; the card lists each raise;
//   reuse   each component's screens (a features/ folder; a shared module or a pattern counts for
//           every screen that reaches it, by the names each uses: ./uses.mjs; the app's layout is
//           "app"); one drawn by a single screen needs a `single` reason, and one 2 or more
//           screens draw has none. The card lists the variants 0 or 1 screens choose;
//   tokens  no token is defined twice across tokens.css's blocks of one selector (./tokens.mjs);
//   patterns  each value src/patterns exports is used by 2 or more screens, and a function's props
//           are domain values or slots (./props.mjs follows their types), never handed unchanged
//           to a kit variant, at most `budget.props`; each features/shared export is used by 2 or
//           more screens too (the rules are ./patterns.mjs, tested beside it). The card lists
//           each pattern export with its screens;
//   layers  every file under src/ is in a layer, and each import, resolved to the file it loads,
//           is one its layer may make; only the kit renders elements (./layers.mjs, its reading
//           ./reach.mjs, tested beside them on a tree).
// Usage: node tools/kit.mjs --check [--base REF]  (exit 1 on any failure; `just gates` runs it)
//        node tools/kit.mjs --card [--base REF]   (markdown for a PR description)
//   The base is the merge base with REF (default HEAD for --check, origin/main for --card), as
//   the gates compare; a REF that doesn't resolve fails.
//        node tools/kit.mjs --list                (the kit's components, props and variants)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { layerProblems } from "./layers.mjs";
import { ledgerProblems } from "./ledger.mjs";
import { knobProblems, patternProblems, sharedProblems, staleSingles } from "./patterns.mjs";
import { readKit } from "./props.mjs";
import { open, posix, walk } from "./reach.mjs";
import { repeatedTokens } from "./tokens.mjs";
import { readWeb } from "./uses.mjs";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = join(WEB, "src", "kit");
const LEDGER = join(KIT, "ledger.json");
const MEASURES = resolve(WEB, "../tools/gates/ts_measures.mjs");

/** Code lines in the kit: TypeScript by the gates' own measure (tools/gates/ts_measures.mjs, the
 *  one the file-size gate reads), CSS lines left once comments are removed; the tokens apart. */
function kitLines() {
  const files = walk(KIT).filter((p) => /\.(tsx?|css)$/.test(p) && !/\.test\.tsx?$/.test(p));
  const tsFiles = files.filter((p) => !p.endsWith(".css")).map((p) => posix(relative(WEB, p)));
  const measured = JSON.parse(
    execFileSync("node", [MEASURES, WEB, ...tsFiles], { encoding: "utf8", maxBuffer: 1 << 26 }),
  );
  const code = Object.values(measured).reduce((n, m) => n + m.code_lines, 0);
  const cssLines = (p) =>
    readFileSync(p, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((l) => l.trim()).length;
  const sum = (ps) => ps.reduce((n, p) => n + cssLines(p), 0);
  const tokens = sum(files.filter((p) => p.endsWith("tokens.css")));
  const css = sum(files.filter((p) => p.endsWith(".css") && !p.endsWith("tokens.css")));
  return { total: code + css + tokens, code, css, tokens };
}
const linesText = (l) =>
  `${String(l.total)} lines (${String(l.code)} TS, ${String(l.css)} CSS, ${String(l.tokens)} tokens)`;

const git = (...a) =>
  execFileSync("git", a, { cwd: WEB, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/** The ledger at the merge base with `ref` (as the gates compare): null only when the base has no
 *  ledger. A ref that doesn't resolve is an error, never a quiet pass. */
function ledgerAt(ref) {
  let base;
  try {
    base = git("merge-base", "HEAD", git("rev-parse", "--verify", `${ref}^{commit}`));
  } catch {
    console.error(`kit: --base ${ref}: not a commit with a merge base with HEAD`);
    process.exit(2);
  }
  const path = `${base}:web/src/kit/ledger.json`;
  try {
    git("cat-file", "-e", path);
  } catch {
    return null; // no ledger at the base: nothing to compare
  }
  return JSON.parse(git("show", path));
}

const BUDGET = ["components", "props", "lines"];

/** Budget fields raised against the base without a `raises` entry saying why. */
function raised(led, before) {
  if (!before) return [];
  const explained = (key, n) =>
    (led.raises ?? []).some((r) => r.budget === key && r.to === n && r.why);
  return Object.entries(led.budget)
    .filter(
      ([key, n]) => key in (before.budget ?? {}) && n > before.budget[key] && !explained(key, n),
    )
    .map(
      ([key, n]) =>
        `budget.${key} raised ${String(before.budget[key])} -> ${String(n)} without a \`raises\` entry`,
    );
}

function check(base) {
  const { kit, vocab, modules, used, patterns, knobs, shared } = readWeb(WEB);
  const led = JSON.parse(readFileSync(LEDGER, "utf8"));
  const names = Object.keys(kit);
  const lines = kitLines();
  const problems = BUDGET.filter((k) => typeof led.budget[k] !== "number").map(
    (k) => `budget.${k} is missing from the ledger`,
  );
  problems.push(...ledgerProblems(kit, vocab, led));
  for (const t of repeatedTokens(readFileSync(join(KIT, "tokens.css"), "utf8")))
    problems.push(`tokens.css: ${t} is defined in two blocks of one selector (the later wins)`);
  if (names.length > led.budget.components)
    problems.push(`${String(names.length)} components > ${String(led.budget.components)}`);
  if (lines.total > led.budget.lines)
    problems.push(`${String(lines.total)} kit lines > ${String(led.budget.lines)}`);
  problems.push(...raised(led, ledgerAt(base)));
  for (const name of names) {
    const n = used.get(name)?.size ?? 0;
    if (n < 2 && !led.components[name]?.single)
      problems.push(
        `${name}: drawn by ${String(n)} screen${n === 1 ? "" : "s"} and no \`single\` reason`,
      );
  }
  problems.push(...staleSingles(used, led));
  const ok = problems.length === 0;
  const head = `${String(names.length)}/${String(led.budget.components)} components, ${linesText(lines)}`;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} kit             ${head}, budget ${String(led.budget.lines)}; props <= ${String(led.budget.props)}`,
  );
  for (const p of problems) console.log(`         ${p}`);
  const wrong = [
    ...patternProblems(patterns, led.budget.props),
    ...knobProblems(knobs),
    ...sharedProblems(shared),
  ];
  const files = new Set(patterns.map((p) => p.file)).size;
  console.log(
    `  ${wrong.length ? "FAIL" : "ok  "} patterns        ${String(patterns.length)} exports in ${String(files)} files, ${String(shared.length)} shared; 2+ screens each, domain props <= ${String(led.budget.props)}`,
  );
  for (const p of wrong) console.log(`         ${p}`);
  const strays = layerProblems(modules);
  console.log(
    `  ${strays.length ? "FAIL" : "ok  "} layers          ${String(modules.length)} files under src/, each import by the file it resolves to`,
  );
  for (const p of strays) console.log(`         ${p}`);
  return ok && wrong.length === 0 && strays.length === 0;
}

/** Ledger entries new or changed since the base: components, props, variants, single reasons. */
function added(led, before) {
  const out = [];
  const old = before ?? { components: {}, vocab: {} };
  const walkProps = (name, props, oldProps, prefix) => {
    for (const [prop, p] of Object.entries(props ?? {})) {
      const o = oldProps?.[prop];
      if (!o) out.push(`\`${name}.${prefix}${prop}\`: ${p.why}`);
      for (const [v, why] of Object.entries(p.values ?? {}))
        if (!o?.values?.[v]) out.push(`\`${name}.${prefix}${prop}=${v}\`: ${why}`);
      walkProps(name, p.items, o?.items, `${prefix}${prop}.`);
    }
  };
  for (const [name, entry] of Object.entries(led.components)) {
    const o = old.components[name];
    if (!o) out.push(`\`${name}\`: ${entry.why}`);
    if (entry.single && entry.single !== o?.single) out.push(`\`${name}\` single: ${entry.single}`);
    walkProps(name, entry.props, o?.props, "");
  }
  for (const [name, entry] of Object.entries(led.vocab ?? {}))
    for (const [v, why] of Object.entries(entry.values ?? {}))
      if (!old.vocab?.[name]?.values?.[v]) out.push(`\`${name}=${v}\`: ${why}`);
  const removed = Object.keys(old.components).filter((n) => !(n in led.components));
  return [...out, ...removed.map((n) => `\`${n}\` removed`)];
}

function card(base) {
  const { kit, used, patterns } = readWeb(WEB);
  const led = JSON.parse(readFileSync(LEDGER, "utf8"));
  const before = ledgerAt(base);
  const lines = kitLines();
  console.log(
    `### Kit\n\n${String(Object.keys(kit).length)}/${String(led.budget.components)} components, ${linesText(lines)}, budget ${String(led.budget.lines)}.\n`,
  );
  // A raise is the owner's checkpoint: each one is listed with its reason, so the review sees it.
  const changed = Object.entries(led.budget).filter(([k, n]) => before && n !== before.budget?.[k]);
  if (changed.length) {
    console.log(`**Budget raised** (the owner reviews each raise)\n`);
    for (const [k, n] of changed) {
      const why = (led.raises ?? []).find((r) => r.budget === k && r.to === n)?.why;
      console.log(`- ${k}: ${String(before.budget[k])} -> ${String(n)}: ${why ?? "**no reason**"}`);
    }
    console.log("");
  }
  const fresh = added(led, before);
  console.log(`**New in the ledger** (${String(fresh.length)})\n`);
  for (const a of fresh) console.log(`- ${a}`);
  console.log(
    `\n**Reuse** (screens drawing each component)\n\n| Component | Screens | |\n|---|---|---|`,
  );
  for (const name of Object.keys(kit).sort()) {
    const s = [...(used.get(name) ?? [])].sort();
    const single = s.length < 2 ? `single: ${led.components[name]?.single ?? "**no reason**"}` : "";
    console.log(`| \`${name}\` | ${String(s.length)} (${s.join(", ")}) | ${single} |`);
  }
  const variants = [];
  for (const [name, comp] of Object.entries(kit))
    for (const [prop, p] of Object.entries(comp.props))
      for (const v of p.values) {
        const s = [...(used.get(`${name}.${prop}=${v}`) ?? [])];
        if (s.length < 2)
          variants.push(
            `\`${name}.${prop}=${v}\`: ${s.length ? s.join(", ") : "no screen chooses it (a default, the kit's own, or only passed through)"}`,
          );
      }
  console.log(
    `\n**Variants chosen by 0 or 1 screens** (${String(variants.length)}; a literal, or an expression's literal type)\n`,
  );
  for (const v of variants) console.log(`- ${v}`);
  console.log(`\n### Patterns\n\n${String(patterns.length)} exports (2+ screens each).\n`);
  if (patterns.length) console.log(`| Pattern | Screens | Props |\n|---|---|---|`);
  for (const p of patterns) {
    const props = p.props ? String(Object.keys(p.props).length) : "-";
    console.log(
      `| \`${p.file} ${p.name}\` | ${String(p.screens.length)} (${p.screens.join(", ")}) | ${props} |`,
    );
  }
}

const args = process.argv.slice(2);
const at = args.indexOf("--base");
if (args[0] === "--card") card(at >= 0 ? args[at + 1] : "origin/main");
else if (args[0] === "--list") console.log(JSON.stringify(readKit(open(WEB)), null, 1));
else process.exit(check(at >= 0 ? args[at + 1] : "HEAD") ? 0 : 1);

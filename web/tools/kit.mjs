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
//   reuse   each component's screens (a features/ folder; a shared module counts for the screens
//           that import it; the app's layout is "app"); one drawn by a single screen needs a
//           `single` reason. The card lists the variants 0 or 1 screens choose;
//   tokens  no token is defined twice across tokens.css's blocks of one selector (./tokens.mjs).
// Usage: node tools/kit.mjs --check [--base REF]  (exit 1 on any failure; `just gates` runs it)
//        node tools/kit.mjs --card [--base REF]   (markdown for a PR description)
//   The base is the merge base with REF (default HEAD for --check, origin/main for --card), as
//   the gates compare; a REF that doesn't resolve fails.
//        node tools/kit.mjs --list                (the kit's components, props and variants)
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ledgerProblems, mergeProp } from "./ledger.mjs";
import { repeatedTokens } from "./tokens.mjs";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(WEB, "src");
const KIT = join(SRC, "kit");
const FEATURES = join(SRC, "features");
const LEDGER = join(KIT, "ledger.json");
const MEASURES = resolve(WEB, "../tools/gates/ts_measures.mjs");
const VOCAB = ["Space", "Width", "Length", "Tone", "MarkKind", "IconName"];
// Not screens: shared modules count for their importers; the kit sheet draws everything on purpose.
const NOT_SCREENS = new Set(["shared", "sheet"]);
const ts = createRequire(join(WEB, "package.json"))("typescript");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const posix = (p) => p.replace(/\\/g, "/");

/** One program over the web (its own tsconfig), so the screens' expressions have their types too. */
let built;
function program() {
  if (built) return built;
  const config = ts.readConfigFile(join(WEB, "tsconfig.json"), ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, WEB);
  built = ts.createProgram(parsed.fileNames, parsed.options);
  return built;
}

/** The literal values of a type: its string and number literal members. */
function literals(t) {
  return (t.isUnion() ? t.types : [t])
    .filter((x) => x.isStringLiteral() || x.isNumberLiteral())
    .map((x) => String(x.value));
}

/** The kit declares this symbol. */
const inKit = (sym) =>
  sym?.declarations?.some((d) => posix(d.getSourceFile().fileName).startsWith(posix(KIT))) === true;

/** A shape the kit itself declares (an item, a model): its fields are the kit's to account for. */
const kitShape = (x) =>
  Boolean(x.flags & ts.TypeFlags.Object) &&
  x.getCallSignatures().length === 0 &&
  inKit(x.aliasSymbol ?? x.getSymbol());

/** The fields of a kit-declared object prop, or of each item of an array prop (every shape of a
 *  union item: a counter or a "|" divider), that carry variants of their own, down to `depth` 3. */
function fieldsOf(checker, t, depth) {
  if (depth > 3) return {};
  const element = checker.isArrayType(t) ? checker.getTypeArguments(t)[0] : t;
  // a kit shape, or an intersection of kit shapes only (a column: its track's case and its common
  // fields); a field the union's cases declare differently is merged (mergeProp)
  const isKit = (x) => kitShape(x) || (x.isIntersection() && x.types.every(kitShape));
  const shapes = (element.isUnion() ? element.types : [element]).filter(isKit);
  const items = {};
  for (const field of shapes.flatMap((x) => x.getProperties())) {
    const p = propOf(checker, field, depth + 1);
    if (!(p.vocabs.length || p.values.length || Object.keys(p.items).length)) continue;
    items[field.name] = mergeProp(items[field.name], p);
  }
  return items;
}

/** One prop: its vocabulary, or its own literal values, and the fields inside it. */
function propOf(checker, prop, depth = 0) {
  const declared = prop.valueDeclaration?.type?.getText() ?? "";
  if (VOCAB.includes(declared)) return { vocabs: [declared], values: [], items: {}, array: false };
  const t = checker.getNonNullableType(checker.getTypeOfSymbol(prop));
  const array = checker.isArrayType(t);
  return { vocabs: [], values: literals(t), items: fieldsOf(checker, t, depth), array };
}

/** The kit: every PascalCase value its index exports, as a component with its props. */
function readKit() {
  const prog = program();
  const checker = prog.getTypeChecker();
  const index = prog.getSourceFile(join(KIT, "index.ts"));
  const kit = {};
  const vocab = {};
  for (const sym of checker.getExportsOfModule(checker.getSymbolAtLocation(index))) {
    const target = checker.getAliasedSymbol(sym);
    if (VOCAB.includes(sym.name))
      vocab[sym.name] = literals(checker.getDeclaredTypeOfSymbol(target));
    if (!/^[A-Z]/.test(sym.name) || !(target.flags & ts.SymbolFlags.Value)) continue;
    const decl = target.valueDeclaration;
    const signature = checker.getTypeOfSymbolAtLocation(target, decl).getCallSignatures()[0];
    if (!signature) {
      kit[sym.name] = { notComponent: true, props: {} };
      continue;
    }
    const param = signature.getParameters()[0];
    const type = param ? checker.getTypeOfSymbolAtLocation(param, decl) : null;
    const members = type?.isUnion() ? type.types : type ? [type] : [];
    const props = {};
    for (const member of members) {
      for (const prop of checker.getPropertiesOfType(member)) {
        const p = propOf(checker, prop);
        props[prop.name] = mergeProp(props[prop.name], p);
      }
    }
    kit[sym.name] = { notComponent: false, props };
  }
  return { kit, vocab };
}

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

/** The variants an attribute sets: a literal's value, or the literal members of an expression's
 *  type (`look={done ? "flat" : "raised"}` sets both; so does a screen's own model, `stageDot(t, me)`).
 *  An expression typed as one of the kit's own types (a `ButtonVariant` handed on) passes a value
 *  through rather than choosing one, and sets none. */
function setBy(checker, attr) {
  const init = ts.isJsxExpression(attr.initializer)
    ? attr.initializer.expression
    : attr.initializer;
  if (!init) return [];
  if (ts.isStringLiteral(init) || ts.isNumericLiteral(init)) return [init.text];
  const t = checker.getTypeAtLocation(init);
  return inKit(t.aliasSymbol) ? [] : literals(t);
}

/** What a file draws: kit components, and the variants it sets on them ("Button.variant=lit"). */
function scan(path, kit) {
  const checker = program().getTypeChecker();
  const sf = program().getSourceFile(path);
  const used = new Set();
  const imports = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node))
      imports.push(resolve(dirname(path), node.moduleSpecifier.text) + ".tsx");
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText() in kit
    ) {
      const tag = node.tagName.getText();
      used.add(tag);
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
        const name = attr.name.getText();
        for (const v of setBy(checker, attr)) used.add(`${tag}.${name}=${v}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { used, imports };
}

function screenUses(kit) {
  const files = walk(FEATURES).filter((p) => p.endsWith(".tsx") && !p.endsWith(".test.tsx"));
  const screenOf = (p) => posix(relative(FEATURES, p)).split("/")[0];
  const scanned = new Map(files.map((p) => [resolve(p), scan(resolve(p), kit)]));
  const out = new Map();
  const add = (screen, set) => {
    for (const u of set) out.set(u, new Set([...(out.get(u) ?? []), screen]));
  };
  for (const [path, s] of scanned) {
    const screen = screenOf(path);
    if (NOT_SCREENS.has(screen)) continue;
    add(screen, s.used);
    for (const imp of s.imports)
      if (screenOf(imp) === "shared" && scanned.has(imp)) add(screen, scanned.get(imp).used);
  }
  for (const path of walk(join(SRC, "app")).filter((p) => p.endsWith(".tsx")))
    add("app", scan(resolve(path), kit).used);
  return out;
}

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
  const { kit, vocab } = readKit();
  const led = JSON.parse(readFileSync(LEDGER, "utf8"));
  const names = Object.keys(kit);
  const lines = kitLines();
  const used = screenUses(kit);
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
  const ok = problems.length === 0;
  const head = `${String(names.length)}/${String(led.budget.components)} components, ${linesText(lines)}`;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} kit             ${head}, budget ${String(led.budget.lines)}; props <= ${String(led.budget.props)}`,
  );
  for (const p of problems) console.log(`         ${p}`);
  return ok;
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
  const { kit } = readKit();
  const led = JSON.parse(readFileSync(LEDGER, "utf8"));
  const before = ledgerAt(base);
  const lines = kitLines();
  const used = screenUses(kit);
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
}

const args = process.argv.slice(2);
const at = args.indexOf("--base");
if (args[0] === "--card") card(at >= 0 ? args[at + 1] : "origin/main");
else if (args[0] === "--list") console.log(JSON.stringify(readKit(), null, 1));
else process.exit(check(at >= 0 ? args[at + 1] : "HEAD") ? 0 : 1);

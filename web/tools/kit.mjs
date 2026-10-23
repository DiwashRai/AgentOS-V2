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
//           every screen that reaches it through its imports; the app's layout is "app"); one
//           drawn by a single screen needs a `single` reason, and one 2 or more screens draw has
//           none. The card lists the variants 0 or 1 screens choose;
//   tokens  no token is defined twice across tokens.css's blocks of one selector (./tokens.mjs);
//   patterns  each value src/patterns exports is imported by 2 or more screens, and a component's
//           props are domain values or slots, at most `budget.props` (the rules are
//           ./patterns.mjs, tested beside it). The card lists each export with its screens.
// Usage: node tools/kit.mjs --check [--base REF]  (exit 1 on any failure; `just gates` runs it)
//        node tools/kit.mjs --card [--base REF]   (markdown for a PR description)
//   The base is the merge base with REF (default HEAD for --check, origin/main for --card), as
//   the gates compare; a REF that doesn't resolve fails.
//        node tools/kit.mjs --list                (the kit's components, props and variants)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ledgerProblems, mergeProp } from "./ledger.mjs";
import { patternProblems, staleSingles } from "./patterns.mjs";
import { repeatedTokens } from "./tokens.mjs";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(WEB, "src");
const KIT = join(SRC, "kit");
const FEATURES = join(SRC, "features");
const PATTERNS = join(SRC, "patterns");
const APP = join(SRC, "app");
const LEDGER = join(KIT, "ledger.json");
const MEASURES = resolve(WEB, "../tools/gates/ts_measures.mjs");
const VOCAB = ["Space", "Width", "Length", "Tone", "MarkKind", "IconName"];
// Not screens: shared modules and patterns count for their importers; the kit sheet draws
// everything on purpose.
const NOT_SCREENS = new Set(["shared", "patterns", "sheet"]);
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

/** The names an import (or a re-export) takes from its module: "default", "*" for all of them. */
function namesOf(node) {
  if (ts.isExportDeclaration(node))
    return node.exportClause && ts.isNamedExports(node.exportClause)
      ? node.exportClause.elements.map((e) => (e.propertyName ?? e.name).text)
      : ["*"];
  const clause = node.importClause;
  if (!clause) return [];
  const names = clause.name ? ["default"] : [];
  const bound = clause.namedBindings;
  if (bound && ts.isNamespaceImport(bound)) names.push("*");
  else if (bound) names.push(...bound.elements.map((e) => (e.propertyName ?? e.name).text));
  return names;
}

/** What a file draws: kit components, and the variants it sets on them ("Button.variant=lit");
 *  and what it imports: each module's file (as the compiler resolves it) and the names it takes. */
function scan(path, kit) {
  const checker = program().getTypeChecker();
  const sf = program().getSourceFile(path);
  const options = program().getCompilerOptions();
  const used = new Set();
  const imports = [];
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const to = ts.resolveModuleName(node.moduleSpecifier.text, path, options, ts.sys);
      const file = to.resolvedModule?.resolvedFileName;
      if (file) imports.push({ file: resolve(file), names: namesOf(node) });
    }
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

/** A folder's modules (none when it doesn't exist yet), tests aside. */
const sources = (dir) =>
  existsSync(dir)
    ? walk(dir)
        .filter((p) => /\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p))
        .map((p) => resolve(p))
    : [];
/** Where a module sits: its screen (a features/ folder), "shared", "sheet", "patterns" or "app". */
const placeOf = (p) => {
  const [top, folder] = posix(relative(SRC, p)).split("/");
  return top === "features" ? folder : top;
};

/** Each screen's drawing, through everything it imports: what its modules draw and what the
 *  modules they reach draw, transitively (its own, shared modules and patterns; it imports no other
 *  screen). The app follows the same, not the screens it imports to route them. `kit` maps each
 *  component and variant to its screens; `patterns` each pattern export ("patterns/who.tsx#Who")
 *  to the screens that import it. */
function screenUses(kit) {
  const scanned = new Map(
    [...sources(FEATURES), ...sources(PATTERNS), ...sources(APP)].map((p) => [p, scan(p, kit)]),
  );
  const follows = (screen, place) => [screen, "shared", "patterns"].includes(place);
  const reached = (screen) => {
    const seen = new Set();
    const go = (p) => {
      if (seen.has(p) || !scanned.has(p) || !follows(screen, placeOf(p))) return;
      seen.add(p);
      for (const imp of scanned.get(p).imports) go(imp.file);
    };
    for (const p of scanned.keys()) if (placeOf(p) === screen) go(p);
    return seen;
  };
  const out = { kit: new Map(), patterns: new Map() };
  const add = (map, key, screen) => map.set(key, new Set([...(map.get(key) ?? []), screen]));
  const screens = new Set([...scanned.keys()].map(placeOf).filter((s) => !NOT_SCREENS.has(s)));
  for (const screen of screens)
    for (const p of reached(screen)) {
      const s = scanned.get(p);
      for (const u of s.used) add(out.kit, u, screen);
      for (const imp of s.imports)
        if (placeOf(imp.file) === "patterns")
          for (const name of imp.names)
            add(out.patterns, `${posix(relative(SRC, imp.file))}#${name}`, screen);
    }
  return out;
}

/** The kit's declared types a type node names (`MarkKind`, `ChecklistProps["look"]`, `Fact`), and
 *  the kit aliases its type resolves to through a local one. */
function kitTypesIn(checker, prop) {
  const out = new Set();
  const visit = (node) => {
    if (ts.isTypeReferenceNode(node)) {
      let sym = checker.getSymbolAtLocation(node.typeName);
      if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
      if (inKit(sym)) out.add(node.typeName.getText());
    }
    ts.forEachChild(node, visit);
  };
  const node = prop.valueDeclaration?.type;
  if (node) visit(node);
  const t = checker.getTypeOfSymbol(prop);
  for (const x of [t, ...(t.isUnion() ? t.types : [])])
    if (inKit(x.aliasSymbol)) out.add(x.aliasSymbol.name);
  return [...out];
}

/** The patterns: each value a patterns file exports, its screens (`uses` from screenUses), and,
 *  for a component, its props with the kit types each names. */
function readPatterns(uses) {
  const checker = program().getTypeChecker();
  const out = [];
  for (const path of sources(PATTERNS)) {
    const sf = program().getSourceFile(path);
    const file = posix(relative(SRC, path));
    const mod = checker.getSymbolAtLocation(sf);
    if (!mod) continue; // a file that exports nothing
    for (const sym of checker.getExportsOfModule(mod)) {
      const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
      if (!(target.flags & ts.SymbolFlags.Value)) continue;
      const screens = new Set([
        ...(uses.get(`${file}#${sym.name}`) ?? []),
        ...(uses.get(`${file}#*`) ?? []),
      ]);
      const signature = checker.getTypeOfSymbolAtLocation(target, sf).getCallSignatures()[0];
      const param = /^[A-Z]/.test(sym.name) ? signature?.getParameters()[0] : undefined;
      const type = param ? checker.getTypeOfSymbolAtLocation(param, sf) : null;
      const props = {};
      for (const member of type?.isUnion() ? type.types : type ? [type] : [])
        for (const prop of checker.getPropertiesOfType(member))
          props[prop.name] = kitTypesIn(checker, prop);
      out.push({ file, name: sym.name, screens: [...screens].sort(), props: type ? props : null });
    }
  }
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
  const uses = screenUses(kit);
  const used = uses.kit;
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
  const patterns = readPatterns(uses.patterns);
  const wrong = patternProblems(patterns, led.budget.props);
  const files = new Set(patterns.map((p) => p.file)).size;
  console.log(
    `  ${wrong.length ? "FAIL" : "ok  "} patterns        ${String(patterns.length)} exports in ${String(files)} files; 2+ screens each, domain props <= ${String(led.budget.props)}`,
  );
  for (const p of wrong) console.log(`         ${p}`);
  return ok && wrong.length === 0;
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
  const uses = screenUses(kit);
  const used = uses.kit;
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
  const patterns = readPatterns(uses.patterns);
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
else if (args[0] === "--list") console.log(JSON.stringify(readKit(), null, 1));
else process.exit(check(at >= 0 ? args[at + 1] : "HEAD") ? 0 : 1);

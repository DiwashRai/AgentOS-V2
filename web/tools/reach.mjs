// What the web's code reaches, read with the TypeScript compiler over a web folder (the real one,
// or a test's tree): every module under src/ with its imports, each resolved to the file the
// bundler would load (or named as a package), and what in it only the kit may do: render an
// element itself (an intrinsic tag, a tag that may be a string, any mention of createElement),
// take the kit by another name (a renamed or default import, a re-export, a kit component held
// anywhere but its tag, a call's argument or a type), import a module whole as a namespace,
// declare a class. kit.mjs checks them against the layers (./layers.mjs).
import { existsSync, globSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

const ts = createRequire(import.meta.url)("typescript");

export const posix = (p) => p.replace(/\\/g, "/");
export const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/** The web at `web`: one program over it (its own tsconfig), so every expression has its type. */
export function open(web) {
  const path = join(web, "tsconfig.json");
  // named, so its types resolve from its own folder whatever the working directory
  const parsed = ts.parseJsonConfigFileContent(
    ts.readConfigFile(path, ts.sys.readFile).config,
    ts.sys,
    web,
    undefined,
    path,
  );
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const src = join(web, "src");
  return { ts, web, src, program, checker: program.getTypeChecker(), options: parsed.options };
}

/** A path under src/ as the layers name it ("features/ticket/RunsTab.tsx"); outside it, "../…". */
const relOf = (w, file) => posix(relative(w.src, file));

/** Where an import leads: a module under src/ (as the compiler resolves it, or, for a file it
 *  doesn't read, such as a stylesheet, the file itself), a package by name, or nothing. */
export function resolveSpec(w, spec, from) {
  const found = ts.resolveModuleName(spec, from, w.options, ts.sys).resolvedModule;
  if (found && !found.isExternalLibraryImport)
    return { to: relOf(w, resolve(found.resolvedFileName)), pkg: null };
  if (!spec.startsWith(".") && !spec.startsWith("/")) return { to: null, pkg: spec };
  const file = resolve(dirname(from), spec);
  return { to: existsSync(file) && statSync(file).isFile() ? relOf(w, file) : null, pkg: null };
}

const isGlob = (call) =>
  ts.isPropertyAccessExpression(call.expression) &&
  call.expression.name.text === "glob" &&
  ts.isMetaProperty(call.expression.expression);

/** The files an `import.meta.glob(…)` matches, as Vite reads its patterns: from the importer's
 *  folder, or from the web's root when one starts with "/"; a "!"-led one takes its matches out of
 *  the others'. A pattern that isn't a string, or one (not "!"-led) that matches nothing, is an
 *  import of nothing. */
function globbed(w, call, from) {
  const arg = call.arguments[0];
  const specs = arg && ts.isArrayLiteralExpression(arg) ? arg.elements : [arg];
  const matches = (text) => {
    const [cwd, pattern] = text.startsWith("/") ? [w.web, text.slice(1)] : [dirname(from), text];
    return globSync(pattern, { cwd }).map((f) => resolve(cwd, f));
  };
  const out = [];
  const left = new Set();
  for (const s of specs) {
    if (!s || !ts.isStringLiteralLike(s)) out.push({ spec: "<computed>", file: null });
    else if (s.text.startsWith("!")) for (const f of matches(s.text.slice(1))) left.add(f);
    else {
      const files = matches(s.text);
      if (files.length === 0) out.push({ spec: s.text, file: null });
      for (const file of files) out.push({ spec: s.text, file });
    }
  }
  return out.filter((g) => g.file === null || !left.has(g.file));
}
/** What is wrong with a JSX tag's type, if anything: it is, or may be, a string (`const Div: "div"
 *  | "span"`); or it didn't resolve (`any`, say when a package's types are missing), so it may be
 *  anything. */
function tagTypeProblem(checker, tag) {
  const t = checker.getTypeAtLocation(tag);
  const all = t.isUnion() ? t.types : [t];
  if (all.some((x) => x.flags & ts.TypeFlags.StringLike)) return "a tag that may be a string";
  if (all.some((x) => x.flags & ts.TypeFlags.Any)) return "a tag whose type didn't resolve (any)";
  return null;
}

/** Whether a mention of a kit component is anything but its tag, a call's argument (`memo(Text)`)
 *  or a type (`typeof Text`): one held anywhere else (`const List = Checklist`, `{ text: Text }`)
 *  would draw under a name the checks don't know. */
function kitUse(id) {
  const p = id.parent;
  if ((ts.isJsxOpeningLikeElement(p) || ts.isJsxClosingElement(p)) && p.tagName === id)
    return false;
  if (ts.isCallExpression(p) && p.arguments.includes(id)) return false;
  return !ts.isTypeQueryNode(p);
}

/** One module: its imports (static, re-exports, lazy, globbed; type-only ones too), and what in it
 *  only the kit may do (`kind`: "element", "kit", "namespace", "class"), each with its line. */
function readModule(w, path) {
  const { checker } = w;
  const rel = relOf(w, path);
  const sf = w.program.getSourceFile(path);
  const imports = [];
  const only = [];
  const kitBindings = new Set(); // the declarations a kit import binds a component to
  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const edge = (node, spec, kind) => {
    const to = resolveSpec(w, spec, path);
    imports.push({ spec, kind, line: line(node), ...to });
    return to.to;
  };
  const flag = (node, kind, what) => only.push({ line: line(node), kind, what });
  const fromKit = (to) => to !== null && to.startsWith("kit/");
  const visit = (node) => {
    const spec = node.moduleSpecifier;
    if (ts.isImportDeclaration(node) && spec) {
      const to = edge(node, spec.text, "import");
      const c = node.importClause;
      const named = c?.namedBindings;
      if (named && ts.isNamespaceImport(named))
        flag(node, "namespace", `imports "${spec.text}" whole as a namespace`);
      if (fromKit(to) && c?.name) flag(node, "kit", "takes the kit by a default import");
      if (fromKit(to) && named && ts.isNamedImports(named))
        for (const e of named.elements) {
          if (e.propertyName)
            flag(e, "kit", `takes the kit's ${e.propertyName.text} by another name`);
          if (!e.isTypeOnly && !c.isTypeOnly && /^[A-Z]/.test(e.name.text)) kitBindings.add(e);
        }
    }
    if (ts.isExportDeclaration(node) && spec) {
      const to = edge(node, spec.text, "re-export");
      if (fromKit(to)) flag(node, "kit", "re-exports the kit");
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteralLike(arg)) edge(node, arg.text, "dynamic");
      else
        imports.push({
          spec: "<computed>",
          kind: "dynamic",
          line: line(node),
          to: null,
          pkg: null,
        });
    }
    if (ts.isCallExpression(node) && isGlob(node))
      for (const g of globbed(w, node, path))
        imports.push({
          spec: g.spec,
          kind: "glob",
          line: line(node),
          to: g.file === null ? null : relOf(w, g.file),
          pkg: null,
        });
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName;
      if (ts.isIdentifier(tag) && ts.isIntrinsicJsxName(tag.text))
        flag(node, "element", `renders <${tag.text}>`);
      else {
        const problem = tagTypeProblem(checker, tag);
        if (problem) flag(node, "element", `renders <${tag.getText()}>, ${problem}`);
      }
    }
    if (ts.isIdentifier(node) && node.text === "createElement")
      flag(node, "element", "names createElement");
    if (ts.isIdentifier(node) && !kitBindings.has(node.parent) && kitUse(node)) {
      const decl = checker.getSymbolAtLocation(node)?.declarations?.[0];
      if (decl && kitBindings.has(decl))
        flag(node, "kit", `holds the kit's ${node.text} outside a tag (a const, an object)`);
    }
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node))
      flag(node, "class", "declares a class");
    ts.forEachChild(node, visit);
  };
  if (sf) visit(sf);
  return { rel, test: /\.test\.tsx?$/.test(rel), imports, only };
}

/** Every file under src/: a module's imports and what in it only the kit may do; any other file (a
 *  stylesheet, a twin's JSON) only where it sits. */
export function readModules(w) {
  return walk(w.src).map((path) =>
    /\.tsx?$/.test(path) && !/\.d\.ts$/.test(path)
      ? readModule(w, resolve(path))
      : { rel: relOf(w, path), test: false, imports: [], only: [] },
  );
}

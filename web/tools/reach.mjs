// What the web's code reaches, read with the TypeScript compiler over a web folder (the real one,
// or a test's tree): every module under src/ with its imports, each resolved to the file the
// bundler would load (or named as a package), and the elements it renders itself. kit.mjs checks
// them against the layers (./layers.mjs).
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
  const config = ts.readConfigFile(join(web, "tsconfig.json"), ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, web);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const src = join(web, "src");
  return { ts, web, src, program, checker: program.getTypeChecker(), options: parsed.options };
}

/** A path under src/ as the layers name it ("features/ticket/RunsTab.tsx"); outside it, "../…". */
const relOf = (w, file) => posix(relative(w.src, file));

/** Where an import leads: a module under src/ (as the compiler resolves it, or, for a file it
 *  doesn't read, such as a stylesheet, the file itself), a package by name, or nothing. */
function resolveSpec(w, spec, from) {
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

/** The specifiers an `import.meta.glob(…)` names, each file it matches as an import of its own. */
function globbed(call, from) {
  const arg = call.arguments[0];
  const specs = arg && ts.isArrayLiteralExpression(arg) ? arg.elements : [arg];
  return specs.flatMap((s) =>
    s && ts.isStringLiteralLike(s)
      ? globSync(s.text, { cwd: dirname(from) }).map((f) => ({ spec: s.text, file: f }))
      : [{ spec: "<computed>", file: null }],
  );
}

/** A call that makes an element without a tag: `createElement(…)`, `React.createElement(…)`, or
 *  an alias of an import of it. */
function makesElement(checker, call) {
  const callee = call.expression;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text === "createElement";
  if (!ts.isIdentifier(callee)) return false;
  const decl = checker.getSymbolAtLocation(callee)?.declarations?.[0];
  return decl !== undefined && ts.isImportSpecifier(decl)
    ? (decl.propertyName ?? decl.name).text === "createElement"
    : callee.text === "createElement";
}

/** The elements a module renders itself: an intrinsic tag, a tag bound to a string (`const Div =
 *  "div"`), a createElement call. */
function rawOf(checker, node) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    const tag = node.tagName;
    if (ts.isIdentifier(tag) && ts.isIntrinsicJsxName(tag.text)) return `<${tag.text}>`;
    if (checker.getTypeAtLocation(tag).flags & ts.TypeFlags.StringLike)
      return `<${tag.getText()}> (a tag bound to a string)`;
  }
  if (ts.isCallExpression(node) && makesElement(checker, node))
    return `${node.expression.getText()}(…)`;
  return null;
}

/** One module: its imports (static, re-exports, lazy, globbed; type-only ones too) and its raw
 *  elements, each with its line. */
function readModule(w, path) {
  const rel = relOf(w, path);
  const sf = w.program.getSourceFile(path);
  const imports = [];
  const raw = [];
  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const edge = (node, spec, kind) =>
    imports.push({ spec, kind, line: line(node), ...resolveSpec(w, spec, path) });
  const visit = (node) => {
    const spec = node.moduleSpecifier;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && spec)
      edge(node, spec.text, ts.isImportDeclaration(node) ? "import" : "re-export");
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
      for (const g of globbed(node, path))
        imports.push({
          spec: g.spec,
          kind: "glob",
          line: line(node),
          to: g.file === null ? null : relOf(w, resolve(dirname(path), g.file)),
          pkg: null,
        });
    const what = rawOf(w.checker, node);
    if (what) raw.push({ line: line(node), what });
    ts.forEachChild(node, visit);
  };
  if (sf) visit(sf);
  return { rel, test: /\.test\.tsx?$/.test(rel), imports, raw };
}

/** Every file under src/: a module's imports and raw elements; any other file (a stylesheet, a
 *  twin's JSON) only where it sits. */
export function readModules(w) {
  return walk(w.src).map((path) =>
    /\.tsx?$/.test(path)
      ? readModule(w, resolve(path))
      : { rel: relOf(w, path), test: false, imports: [], raw: [] },
  );
}

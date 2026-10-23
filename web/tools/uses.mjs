// What each screen uses, by name: a module's top-level names are its units, and a screen reaches a
// unit of a shared module or a pattern only by naming it in code that runs (a type-only import, a
// `typeof` in a type, a re-export give no reach and no credit). A screen is credited with each kit
// component and variant the units it reaches draw, and with each pattern and shared export they
// are. Read with the compiler over the web (./reach.mjs opens it); kit.mjs checks the counts. In a
// pattern, a top-level function's prop handed unchanged to a kit variant (`look={place}`) is
// noted: it is a styling knob, whatever its name.
import { join } from "node:path";

import { isKnob, readKit, readPatterns, setBy } from "./props.mjs";
import { open, readModules, resolveSpec } from "./reach.mjs";

/** `export`ed, and `export default`. */
const flags = (ts, node) => ts.getCombinedModifierFlags(node);

/** The names a binding declares (`const { a, b: [c] } = …`), each with its declaration. */
function bound(ts, name) {
  if (ts.isIdentifier(name)) return [[name.parent, name.text]];
  return name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : bound(ts, e.name)));
}

/** A module's top level: each import's runtime bindings (`file#name`, `file#*`), each declaration
 *  with its unit and the code it runs, and its exports (a name to its unit; null for a
 *  re-export). Types declare no unit. */
function topOf(w, sf, path) {
  const { ts } = w;
  const t = { bindings: new Map(), tops: new Map(), bodies: [], exports: new Map() };
  const unit = (decl, name, body) => {
    t.tops.set(decl, name);
    if (body) t.bodies.push([name, body]);
  };
  for (const st of sf.statements) {
    const exported = (flags(ts, st) & ts.ModifierFlags.Export) !== 0;
    if (ts.isImportDeclaration(st)) {
      const { to } = resolveSpec(w, st.moduleSpecifier.text, path);
      const c = st.importClause;
      if (!to || !c || c.isTypeOnly) continue;
      if (c.name) t.bindings.set(c, `${to}#default`);
      const named = c.namedBindings;
      if (named && ts.isNamespaceImport(named)) t.bindings.set(named, `${to}#*`);
      else
        for (const e of named?.elements ?? [])
          if (!e.isTypeOnly) t.bindings.set(e, `${to}#${(e.propertyName ?? e.name).text}`);
    } else if (
      ts.isFunctionDeclaration(st) ||
      ts.isClassDeclaration(st) ||
      ts.isEnumDeclaration(st)
    ) {
      const name = st.name?.text ?? "default";
      unit(st, name, st);
      const isDefault = (flags(ts, st) & ts.ModifierFlags.Default) !== 0;
      if (exported) t.exports.set(isDefault ? "default" : name, name);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations)
        for (const [decl, name] of bound(ts, d.name)) {
          unit(decl, name, d.initializer);
          if (exported) t.exports.set(name, name);
        }
    } else if (ts.isExportAssignment(st)) {
      unit(st, "default", st.expression);
      t.exports.set("default", "default");
    } else if (ts.isExportDeclaration(st)) {
      const clause = st.exportClause;
      if (st.isTypeOnly || !clause || !ts.isNamedExports(clause)) continue;
      for (const e of clause.elements)
        if (!e.isTypeOnly)
          t.exports.set(e.name.text, st.moduleSpecifier ? null : (e.propertyName ?? e.name).text);
    } else if (
      !ts.isInterfaceDeclaration(st) &&
      !ts.isTypeAliasDeclaration(st) &&
      !ts.isModuleDeclaration(st)
    )
      unit(st, "<top>", st);
  }
  return t;
}

/** The top-level function a node is in, by name, and whether `param` is one of its parameters. */
function topFunction(ts, node) {
  for (let n = node; n; n = n.parent) {
    if (!ts.isFunctionLike(n)) continue;
    if (ts.isFunctionDeclaration(n) && ts.isSourceFile(n.parent)) return n;
    const v = n.parent;
    if (
      (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) &&
      ts.isVariableDeclaration(v) &&
      ts.isSourceFile(v.parent.parent.parent)
    )
      return n;
  }
  return null;
}
const nameOf = (ts, fn) =>
  fn.name?.getText() ??
  (ts.isVariableDeclaration(fn.parent) ? fn.parent.name.getText() : "default");

/** The top-level function's prop an expression hands on unchanged, by name (`place`,
 *  `props.place`, `place ?? "page"`, a local const of it), or null. */
function propPassed(w, expr, fn, seen = new Set()) {
  const { ts, checker } = w;
  let e = expr;
  while (
    ts.isParenthesizedExpression(e) ||
    ts.isAsExpression(e) ||
    ts.isNonNullExpression(e) ||
    ts.isSatisfiesExpression(e)
  )
    e = e.expression;
  const either = [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken];
  if (ts.isBinaryExpression(e) && either.includes(e.operatorToken.kind))
    return propPassed(w, e.left, fn, seen);
  const field = ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) ? e.name : null;
  const id = field ? e.expression : ts.isIdentifier(e) ? e : null;
  const decl = id ? checker.getSymbolAtLocation(id)?.valueDeclaration : undefined;
  if (!decl || seen.has(decl)) return null;
  seen.add(decl);
  if (ts.isParameter(decl)) return decl.parent === fn ? (field ?? id).text : null;
  if (ts.isBindingElement(decl)) {
    if (field) return null; // a field of a prop (`t.priority`): a domain value's own
    let at = decl.parent;
    while (ts.isBindingElement(at.parent) || ts.isObjectBindingPattern(at.parent)) at = at.parent;
    const holder = at.parent;
    const name = (decl.propertyName ?? decl.name).getText();
    if (ts.isParameter(holder)) return holder.parent === fn ? name : null;
    if (ts.isVariableDeclaration(holder) && holder.initializer)
      return propPassed(w, holder.initializer, fn, seen) === null ? null : name;
    return null;
  }
  if (ts.isVariableDeclaration(decl) && decl.initializer && !field)
    return propPassed(w, decl.initializer, fn, seen);
  return null;
}

/** Each kit variant a JSX element's attributes set (`Button.variant=lit`), and in a pattern the
 *  props it hands on unchanged to a kit variant. */
function drawn(w, kit, node, u, knobs) {
  const { ts } = w;
  const tag = node.tagName.getText();
  u.draws.add(tag);
  const fn = knobs ? topFunction(ts, node) : null;
  const passed = (prop, expr) => {
    const p = fn && isKnob(kit, tag, prop) ? propPassed(w, expr, fn) : null;
    if (p !== null) knobs.push({ fn: nameOf(ts, fn), prop: p, to: `${tag}.${prop}` });
  };
  for (const attr of node.attributes.properties) {
    if (ts.isJsxSpreadAttribute(attr) && ts.isObjectLiteralExpression(attr.expression))
      for (const p of attr.expression.properties)
        if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p))
          passed(p.name.getText(), ts.isPropertyAssignment(p) ? p.initializer : p.name);
    if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
    const name = attr.name.getText();
    for (const v of setBy(w, attr)) u.draws.add(`${tag}.${name}=${v}`);
    if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression)
      passed(name, attr.initializer.expression);
  }
}

/** A module's units: what each references (`:name` here, `file#name` an import), the kit it
 *  draws; the module's exports; in a pattern, its knobs. */
function unitsOf(w, kit, rel) {
  const { ts, checker } = w;
  const path = join(w.src, rel);
  const sf = w.program.getSourceFile(path);
  const t = topOf(w, sf, path);
  const knobs = rel.startsWith("patterns/") ? [] : null;
  const units = new Map();
  const refs = (id) => {
    const p = id.parent;
    const sym =
      ts.isShorthandPropertyAssignment(p) && p.name === id
        ? checker.getShorthandAssignmentValueSymbol(p)
        : checker.getSymbolAtLocation(id);
    return (sym?.declarations ?? []).flatMap((d) =>
      t.tops.has(d) ? [`:${t.tops.get(d)}`] : t.bindings.has(d) ? [t.bindings.get(d)] : [],
    );
  };
  for (const [name, body] of t.bodies) {
    if (!units.has(name)) units.set(name, { refs: new Set(), draws: new Set() });
    const u = units.get(name);
    const visit = (node) => {
      if (ts.isTypeNode(node) && !ts.isExpressionWithTypeArguments(node)) return; // types run nothing
      if (ts.isIdentifier(node)) for (const r of refs(node)) u.refs.add(r);
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        node.tagName.getText() in kit
      )
        drawn(w, kit, node, u, knobs);
      ts.forEachChild(node, visit);
    };
    visit(body);
  }
  return { units, exports: t.exports, knobs: knobs ?? [] };
}

/** Where a module counts for: its screen (a features/ folder; the app is "app"), or null for a
 *  shared module or a pattern, which count for the screens that reach them. The kit sheet draws
 *  everything on purpose and counts for nothing. */
const SHARED = (rel) => rel.startsWith("features/shared/") || rel.startsWith("patterns/");
const screenOf = (rel) => {
  const [top, folder] = rel.split("/");
  if (top === "app") return "app";
  return top === "features" && folder !== "shared" && folder !== "sheet" ? folder : null;
};

/**
 * Each screen's uses, through the units it reaches: `kit` maps each component and variant to its
 * screens, `exports` each shared or pattern export ("patterns/who.tsx#Who") to the screens that
 * reach it.
 * @param {Map<string, {units: Map, exports: Map}>} read each module's units, by its path
 */
function screenUses(read) {
  const out = { kit: new Map(), exports: new Map() };
  const add = (map, key, screen) => map.set(key, new Set([...(map.get(key) ?? []), screen]));
  const screens = new Set([...read.keys()].map(screenOf).filter((s) => s !== null));
  for (const screen of screens) {
    const seen = new Set();
    const go = (rel, unit) => {
      const m = read.get(rel);
      const u = m?.units.get(unit);
      if (!u || seen.has(`${rel}#${unit}`)) return;
      seen.add(`${rel}#${unit}`);
      for (const d of u.draws) add(out.kit, d, screen);
      if (SHARED(rel))
        for (const [name, local] of m.exports)
          if (local === unit) add(out.exports, `${rel}#${name}`, screen);
      for (const r of u.refs) {
        if (r.startsWith(":")) {
          go(rel, r.slice(1));
          continue;
        }
        const at = r.lastIndexOf("#");
        const [to, name] = [r.slice(0, at), r.slice(at + 1)];
        const target = read.get(to);
        if (!target || !(SHARED(to) || screenOf(to) === screen)) continue;
        const locals = name === "*" ? [...target.exports.values()] : [target.exports.get(name)];
        for (const l of locals) if (l) go(to, l);
      }
    };
    for (const [rel, m] of read)
      if (screenOf(rel) === screen) for (const unit of m.units.keys()) go(rel, unit);
  }
  return out;
}

/** Every module that draws or is drawn: the screens', the shared modules', the patterns', the
 *  app's (tests aside), read into units. */
function readUses(w, kit, modules) {
  const read = new Map();
  for (const m of modules)
    if (!m.test && /\.tsx?$/.test(m.rel) && (SHARED(m.rel) || screenOf(m.rel) !== null))
      read.set(m.rel, unitsOf(w, kit, m.rel));
  return read;
}

/** The web at `web` read once: its program (its own tsconfig, so the screens' expressions have
 *  their types too), the kit, every module, what each screen uses (`used`: each kit component and
 *  variant's screens), the patterns' exports and knobs, and each shared export's screens. */
export function readWeb(web) {
  const w = open(web);
  const { kit, vocab } = readKit(w);
  const modules = readModules(w);
  const read = readUses(w, kit, modules);
  const uses = screenUses(read);
  const patterns = readPatterns(w, modules, uses.exports);
  const knobs = [...read].flatMap(([file, r]) => r.knobs.map((k) => ({ file, ...k })));
  const shared = [...read]
    .filter(([file]) => file.startsWith("features/shared/"))
    .flatMap(([file, r]) =>
      [...r.exports.keys()].map((name) => ({
        file,
        name,
        screens: [...(uses.exports.get(`${file}#${name}`) ?? [])].sort(),
      })),
    );
  return { kit, vocab, modules, used: uses.kit, patterns, knobs, shared };
}

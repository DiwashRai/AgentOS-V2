// What the kit's components take, and what the patterns' exports take, read with the compiler. The
// kit's props with their variants (the ledger's to account for); for each pattern export, the
// kit's own types its parameters name, followed through local aliases and interfaces, indexed
// access, `typeof` and nested shapes, so no renaming hides one (./patterns.mjs says what may be).
import { join } from "node:path";

import { mergeProp } from "./ledger.mjs";

const posix = (p) => p.replace(/\\/g, "/");

/** The kit's vocabularies: a prop typed with one takes the vocabulary's reasons. */
export const VOCAB = ["Space", "Width", "Length", "Tone", "MarkKind", "IconName"];

/** The literal values of a type: its string and number literal members. */
function literals(t) {
  return (t.isUnion() ? t.types : [t])
    .filter((x) => x.isStringLiteral() || x.isNumberLiteral())
    .map((x) => String(x.value));
}

/** Whether a declaration sits under `dir` (a folder of the web's src/). */
const under = (w, dir) => {
  const root = `${posix(join(w.src, dir))}/`;
  return (d) => posix(d.getSourceFile().fileName).startsWith(root);
};

/** The kit declares this symbol. */
export const inKit = (w, sym) => sym?.declarations?.some(under(w, "kit")) === true;

/** A shape the kit itself declares (an item, a model): its fields are the kit's to account for. */
const kitShape = (w, x) =>
  Boolean(x.flags & w.ts.TypeFlags.Object) &&
  x.getCallSignatures().length === 0 &&
  inKit(w, x.aliasSymbol ?? x.getSymbol());

/** The fields of a kit-declared object prop, or of each item of an array prop (every shape of a
 *  union item: a counter or a "|" divider), that carry variants of their own, down to `depth` 3. */
function fieldsOf(w, t, depth) {
  if (depth > 3) return {};
  const element = w.checker.isArrayType(t) ? w.checker.getTypeArguments(t)[0] : t;
  // a kit shape, or an intersection of kit shapes only (a column: its track's case and its common
  // fields); a field the union's cases declare differently is merged (mergeProp)
  const isKit = (x) =>
    kitShape(w, x) || (x.isIntersection() && x.types.every((y) => kitShape(w, y)));
  const shapes = (element.isUnion() ? element.types : [element]).filter(isKit);
  const items = {};
  for (const field of shapes.flatMap((x) => x.getProperties())) {
    const p = propOf(w, field, depth + 1);
    if (!(p.vocabs.length || p.values.length || Object.keys(p.items).length)) continue;
    items[field.name] = mergeProp(items[field.name], p);
  }
  return items;
}

/** One prop: its vocabulary, or its own literal values, and the fields inside it. */
function propOf(w, prop, depth = 0) {
  const declared = prop.valueDeclaration?.type?.getText() ?? "";
  if (VOCAB.includes(declared)) return { vocabs: [declared], values: [], items: {}, array: false };
  const t = w.checker.getNonNullableType(w.checker.getTypeOfSymbol(prop));
  const array = w.checker.isArrayType(t);
  return { vocabs: [], values: literals(t), items: fieldsOf(w, t, depth), array };
}

/** The kit: every PascalCase value its index exports, as a component with its props. */
export function readKit(w) {
  const { ts, checker } = w;
  const index = w.program.getSourceFile(join(w.src, "kit", "index.ts"));
  const kit = {};
  const vocab = {};
  for (const sym of checker.getExportsOfModule(checker.getSymbolAtLocation(index))) {
    const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
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
        const p = propOf(w, prop);
        props[prop.name] = mergeProp(props[prop.name], p);
      }
    }
    kit[sym.name] = { notComponent: false, props };
  }
  return { kit, vocab };
}

/** A kit prop that chooses a look: one with variants (literal values or a vocabulary). */
export const isKnob = (kit, tag, prop) => {
  const p = kit[tag]?.props[prop];
  return p !== undefined && (p.values.length > 0 || p.vocabs.length > 0);
};

/** The variants an attribute sets: a literal's value, or the literal members of an expression's
 *  type (`look={done ? "flat" : "raised"}` sets both; so does a screen's own model, `stageDot(t, me)`).
 *  An expression typed as one of the kit's own types (a `ButtonVariant` handed on) passes a value
 *  through rather than choosing one, and sets none. */
export function setBy(w, attr) {
  const { ts } = w;
  const init = ts.isJsxExpression(attr.initializer)
    ? attr.initializer.expression
    : attr.initializer;
  if (!init) return [];
  if (ts.isStringLiteral(init) || ts.isNumericLiteral(init)) return [init.text];
  const t = w.checker.getTypeAtLocation(init);
  return inKit(w, t.aliasSymbol) ? [] : literals(t);
}

/** The kit's declared types a parameter's type names, however it is written: directly (`Tone`), by
 *  a kit prop's type (`ChecklistProps["look"]`, `ComponentProps<typeof Checklist>`), or through a
 *  local alias or interface, a type parameter's constraint (`<T extends Tone>`), or a field of a
 *  nested shape, that names one. The API's types and the domain can't name the kit (the layers),
 *  so the walk stops at them, and at the packages. */
function kitTypesIn(w, decl, type) {
  const { ts, checker } = w;
  const out = new Set();
  const seen = new Set();
  const local = (d) => !under(w, "kit")(d) && !under(w, "api")(d) && !under(w, "domain")(d);
  const inSrc = under(w, ".");
  const follow = (sym) => {
    for (const d of sym?.declarations ?? []) {
      if (seen.has(d) || !inSrc(d) || !local(d)) continue;
      seen.add(d);
      if (ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d)) visit(d);
      else if (ts.isTypeParameterDeclaration(d)) {
        // `<T extends Tone>`: what it may be is its constraint's
        if (d.constraint) visit(d.constraint);
        if (d.default) visit(d.default);
      } else if ((ts.isVariableDeclaration(d) || ts.isParameter(d)) && d.type) visit(d.type);
    }
  };
  const visit = (node) => {
    const name = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isTypeQueryNode(node)
        ? node.exprName
        : ts.isExpressionWithTypeArguments(node)
          ? node.expression
          : null;
    if (name) {
      let sym = checker.getSymbolAtLocation(name);
      if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
      if (inKit(w, sym)) out.add(name.getText());
      else follow(sym);
    }
    ts.forEachChild(node, visit);
  };
  if (decl?.type) visit(decl.type);
  // what the written type doesn't show: an inferred one, the kit's aliases it resolves to
  const types = new Set();
  const walkType = (t) => {
    if (types.has(t)) return;
    types.add(t);
    const sym = t.aliasSymbol ?? t.getSymbol();
    if (inKit(w, t.aliasSymbol) || inKit(w, t.getSymbol())) {
      out.add(sym.name);
      return;
    }
    if (t.isUnionOrIntersection()) t.types.forEach(walkType);
    if (t.flags & ts.TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(t);
      if (constraint) walkType(constraint);
      return;
    }
    const d = sym?.declarations?.[0];
    if (d && !(inSrc(d) && local(d))) return;
    if (t.flags & ts.TypeFlags.Object) {
      if (t.objectFlags & ts.ObjectFlags.Reference) checker.getTypeArguments(t).forEach(walkType);
      for (const p of t.getProperties()) walkType(checker.getTypeOfSymbol(p));
    }
  };
  walkType(type);
  return [...out];
}

/** Each value a pattern exports, its screens (`uses`, by "patterns/who.tsx#Who"), and, for a
 *  function, its first parameter's props with the kit types each names; `more`, the kit types its
 *  parameters name otherwise (the first one whole, `(p: ChecklistProps)`, or a later one). */
export function readPatterns(w, modules, uses) {
  const { ts, checker } = w;
  const out = [];
  for (const m of modules) {
    if (!m.rel.startsWith("patterns/") || m.test || !/\.tsx?$/.test(m.rel)) continue;
    const sf = w.program.getSourceFile(join(w.src, m.rel));
    const mod = checker.getSymbolAtLocation(sf);
    if (!mod) continue; // a file that exports nothing
    for (const sym of checker.getExportsOfModule(mod)) {
      const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
      if (!(target.flags & ts.SymbolFlags.Value)) continue;
      const screens = [...(uses.get(`${m.rel}#${sym.name}`) ?? [])].sort();
      const signature = checker.getTypeOfSymbolAtLocation(target, sf).getCallSignatures()[0];
      const params = signature?.getParameters() ?? [];
      const typeOf = (p) => checker.getTypeOfSymbolAtLocation(p, sf);
      const props = {};
      const [first, ...later] = params;
      const type = first ? typeOf(first) : null;
      for (const member of type?.isUnion() ? type.types : type ? [type] : [])
        for (const prop of checker.getPropertiesOfType(member))
          props[prop.name] = kitTypesIn(w, prop.valueDeclaration, checker.getTypeOfSymbol(prop));
      const named = new Set(Object.values(props).flat());
      const more = [first, ...later]
        .flatMap((p) => (p ? kitTypesIn(w, p.valueDeclaration, typeOf(p)) : []))
        .filter((k) => !named.has(k));
      out.push({ file: m.rel, name: sym.name, screens, props: signature ? props : null, more });
    }
  }
  return out;
}

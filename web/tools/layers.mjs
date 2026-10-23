// The web's layers (docs/architecture.md › The web), checked on what each import resolves to, so
// no spelling of a path gets past them (ESLint's import rules are the fast first line; this is the
// one that can't be fooled). Every file under src/ is in a layer; each layer lists what it may
// import: local modules by the layer they resolve to, packages by name. A static import, a
// re-export, a type-only import and an `import.meta.glob` (its "/"-led patterns from the web's
// root; one that matches nothing fails) all count; a lazy `import()` is the app's alone. Where a
// construct could carry code past the checks, it is banned outright rather than read more
// cleverly: code under src/ is .ts or .tsx (no JavaScript, no bare declarations); a stylesheet of
// any language Vite reads is the kit's alone; outside the kit nothing renders an element itself (an
// intrinsic tag, a tag that may be a string, any mention of createElement), takes the kit by
// another name (a renamed or default import, a re-export, a component held in a const) or imports a
// module whole as a namespace; and the layers that draw declare no class. kit.mjs reads the
// modules (./reach.mjs) and checks them here; pure, so its tests run on plain values as well as on
// a tree.

/** Where a module under src/ sits ("features/ticket/RunsTab.tsx" is the ticket screen), or null
 *  when it is in no layer. */
export function layerOf(rel) {
  const [top, next, ...rest] = rel.split("/");
  if (next === undefined) return rel === "main.tsx" ? { layer: "main" } : null;
  if (top === "features") {
    if (rest.length === 0) return null; // a screen is a folder
    return next === "shared" ? { layer: "shared" } : { layer: "screen", screen: next };
  }
  if (top === "domain" && /^(library-)?fixtures\.tsx?$/.test(next) && rest.length === 0)
    return { layer: "fixtures" };
  return ["kit", "domain", "api", "patterns", "app"].includes(top) ? { layer: top } : null;
}

/** What an import reaches, as the allow-lists name it: the kit's index apart from its insides, the
 *  API's types and its query hooks apart from the rest of it, a screen by its name. */
function reachOf(rel) {
  const at = layerOf(rel);
  if (at === null) return "outside";
  if (at.layer === "kit") return rel === "kit/index.ts" ? "kit" : "kit/*";
  if (at.layer === "api" && (rel === "api/types.ts" || rel === "api/queries.ts"))
    return rel.slice(0, -3);
  return at.layer === "screen" ? `screen:${at.screen}` : at.layer;
}

const SCREEN = ["kit", "patterns", "domain", "api/types", "api/queries", "shared"];
/** Each layer's local imports. A screen also has its own folder; the app every screen. */
const MAY = {
  kit: ["kit", "kit/*"],
  domain: ["domain", "api/types"],
  fixtures: ["fixtures", "domain", "api/types"],
  api: ["api", "api/types", "api/queries", "domain", "fixtures"],
  patterns: ["kit", "domain", "api/types", "patterns"],
  shared: SCREEN,
  screen: SCREEN,
  app: [...SCREEN, "api", "app"],
  main: ["app", "kit"],
};
/** Each layer's packages, by name ("@base-ui/react/" and its subpaths). Patterns draw what their
 *  props say: React for local state, no data, no router, no headless pieces. */
const PACKAGES = {
  kit: ["react", "react-router", "@base-ui/react/"],
  domain: [],
  fixtures: [],
  api: ["react", "@tanstack/react-query"],
  patterns: ["react"],
  shared: ["react", "react-router"],
  screen: ["react", "react-router"],
  app: ["react", "react-router", "react-router/dom", "@tanstack/react-query"],
  main: ["react", "react-dom/client"],
};
/** A test also has its runner and the fixtures. */
const TEST = { local: ["fixtures"], packages: ["vitest"] };

const named = (allowed, pkg) =>
  allowed.some((a) => (a.endsWith("/") ? pkg.startsWith(a) : pkg === a));

/** Whether a module in `at` may import `rel` (a local module). */
function mayReach(at, rel, test) {
  const to = reachOf(rel);
  if (at.layer === "screen" && to === `screen:${at.screen}`) return true;
  if (at.layer === "app" && to.startsWith("screen:")) return true;
  return MAY[at.layer].includes(to) || (test && TEST.local.includes(to));
}

/** Every stylesheet Vite reads, whatever its language. */
const STYLE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)$/;
/** The code under src/ is TypeScript, which every check reads: a JavaScript file, or a declaration
 *  with no code of its own, would carry code past them. */
const NOT_READ = /\.(js|jsx|mjs|cjs|d\.ts|d\.tsx|d\.mts|d\.cts)$/;
/** The layers that draw: no class there (a class component would skip the props checks). */
const DRAWING = ["patterns", "shared", "screen", "app", "main"];

/** One import's problem, or null. */
function importProblem(at, imp, test) {
  if (imp.kind === "dynamic" && at.layer !== "app") return "imports lazily: only the app does";
  if (imp.to !== null && STYLE.test(imp.to) && at.layer !== "kit")
    return "imports a stylesheet: only src/kit/ has CSS";
  if (imp.pkg !== null)
    return named(PACKAGES[at.layer], imp.pkg) || (test && named(TEST.packages, imp.pkg))
      ? null
      : `imports the package ${imp.pkg}: not for ${at.layer}`;
  if (imp.to === null) return "imports what doesn't resolve";
  if (mayReach(at, imp.to, test)) return null;
  return `reaches ${imp.to} (${reachOf(imp.to)}): not for ${at.layer}`;
}

const WHY = {
  element: "only the kit renders elements",
  kit: "outside the kit, a kit component is imported by its own name, from the index",
  namespace: "outside the kit, import the names a module is used by",
  class: "a class component would skip the props checks; write a function",
};

/**
 * @param {{rel: string, test: boolean, imports: {spec: string, to: string | null, pkg: string | null,
 *   kind: string, line: number}[], only: {line: number, kind: string, what: string}[]}[]} modules
 *   every file under src/, its imports resolved (a file under src/, else a package by name) and
 *   what in it only the kit may do (`kind`: element, kit, namespace; class, which only the layers
 *   that draw may not)
 * @returns {string[]}
 */
export function layerProblems(modules) {
  const problems = [];
  for (const m of modules) {
    const at = layerOf(m.rel);
    if (at === null) {
      problems.push(`${m.rel}: in no layer (src/ holds kit, domain, api, patterns, features, app)`);
      continue;
    }
    if (NOT_READ.test(m.rel))
      problems.push(`${m.rel}: not TypeScript code the checks read; write it as .ts or .tsx`);
    if (STYLE.test(m.rel) && at.layer !== "kit")
      problems.push(`${m.rel}: a stylesheet; only src/kit/ has CSS`);
    for (const imp of m.imports) {
      const p = importProblem(at, imp, m.test);
      if (p) problems.push(`${m.rel}:${String(imp.line)} "${imp.spec}" ${p}`);
    }
    for (const o of m.only) {
      const banned = o.kind === "class" ? DRAWING.includes(at.layer) : at.layer !== "kit";
      if (banned) problems.push(`${m.rel}:${String(o.line)} ${o.what}: ${WHY[o.kind]}`);
    }
  }
  return problems;
}

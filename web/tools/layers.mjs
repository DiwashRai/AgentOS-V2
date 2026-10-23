// The web's layers (docs/architecture.md › The web), checked on what each import resolves to, so
// no spelling of a path gets past them (ESLint's import rules are the fast first line; this is the
// one that can't be fooled). Every file under src/ is in a layer; each layer lists what it may
// import: local modules by the layer they resolve to, packages by name. A static import, a
// re-export, a type-only import and an `import.meta.glob` all count; a lazy `import()` is the app's
// alone. Only the kit renders elements: a raw tag, a tag bound to a string, a createElement call
// anywhere else fails. kit.mjs reads the modules (./reach.mjs) and checks them here; pure, so its
// tests run on plain values as well as on a tree.

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

/** One import's problem, or null. */
function importProblem(at, imp, test) {
  if (imp.kind === "dynamic" && at.layer !== "app") return "imports lazily: only the app does";
  if (imp.pkg !== null)
    return named(PACKAGES[at.layer], imp.pkg) || (test && named(TEST.packages, imp.pkg))
      ? null
      : `imports the package ${imp.pkg}: not for ${at.layer}`;
  if (imp.to === null) return "imports what doesn't resolve";
  if (mayReach(at, imp.to, test)) return null;
  return `reaches ${imp.to} (${reachOf(imp.to)}): not for ${at.layer}`;
}

/**
 * @param {{rel: string, test: boolean, imports: {spec: string, to: string | null, pkg: string | null,
 *   kind: string, line: number}[], raw: {line: number, what: string}[]}[]} modules every file under
 *   src/, its imports resolved (a file under src/, else a package by name) and the elements it
 *   renders itself
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
    for (const imp of m.imports) {
      const p = importProblem(at, imp, m.test);
      if (p) problems.push(`${m.rel}:${String(imp.line)} "${imp.spec}" ${p}`);
    }
    if (at.layer !== "kit")
      for (const r of m.raw)
        problems.push(
          `${m.rel}:${String(r.line)} renders ${r.what}: only the kit renders elements`,
        );
  }
  return problems;
}

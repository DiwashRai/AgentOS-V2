import { readdirSync } from "node:fs";
import { join } from "node:path";

import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import ts from "typescript";
import tseslint from "typescript-eslint";

// The layers (AGENTS.md › Layout, docs/architecture.md › The web): only the kit renders elements or
// holds CSS; patterns compose the kit over domain values; screens reach the data only through the
// query hooks. These rules are the fast first line, on how an import is spelled; `just gates`
// checks the same layers on the file each import resolves to (tools/layers.mjs), which no
// spelling gets past. Each block lists everything its folder may not import, because a later
// block's `no-restricted-imports` replaces an earlier one's for the same file.
const CSS = {
  regex: String.raw`\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(\?.*)?$`,
  message: "Only src/kit/ has CSS; compose kit components.",
};
const KIT = { group: ["**/kit/**", "!**/kit"], message: "Import the kit from its index." };
// A path climbs only at its start, so the rules below read where it goes: no "./..", no "x/../",
// no "/./".
const PLAIN = {
  regex: String.raw`^\./\.|/\./|/[^./][^/]*/\.\./`,
  message: "Spell the path plainly: climb only at its start.",
};
const FIXTURES = {
  regex: String.raw`(^|/)(library-)?fixtures(\.[jt]sx?)?$`,
  message: "Only the API's fixture source and the tests read the fixtures.",
};
const LAYERS = {
  "src/kit/**": [
    PLAIN,
    {
      group: ["**/api/**", "**/domain/**", "**/patterns/**", "**/features/**", "**/app/**"],
      message: "The kit is presentation only.",
    },
  ],
  "src/domain/**": [
    PLAIN,
    CSS,
    {
      group: [
        "react",
        "react-*",
        "@*/**",
        "**/kit",
        "**/kit/**",
        "**/patterns/**",
        "**/features/**",
        "**/app/**",
      ],
      message: "domain/ is pure.",
    },
    { group: ["**/api/*", "!**/api/types"], message: "domain/ may use the API's types only." },
  ],
  "src/api/**": [
    PLAIN,
    CSS,
    {
      group: ["**/kit", "**/kit/**", "**/patterns/**", "**/features/**", "**/app/**"],
      message: "api/ is data only.",
    },
  ],
  "src/patterns/**": [
    PLAIN,
    CSS,
    KIT,
    FIXTURES,
    {
      group: ["**/features/**", "**/app/**", "react-router", "react-router/**", "@*/**"],
      message:
        "A pattern draws what its props say: no screens, routes, queries or headless pieces.",
    },
    {
      group: ["**/api/*", "!**/api/types"],
      message: "Patterns take data as props: the API's types only.",
    },
  ],
  "src/features/**": [
    PLAIN,
    CSS,
    KIT,
    FIXTURES,
    {
      group: ["**/app/**", "@*/**"],
      message: "Screens don't reach into the app, and read the data through the query hooks.",
    },
    {
      group: ["**/api/*", "!**/api/queries", "!**/api/types"],
      message: "Screens use the query hooks and the API's types.",
    },
  ],
  "src/app/**": [PLAIN, CSS, KIT],
};
// What renders elements without an intrinsic tag (so the raw-tag gate can't see it) stays in the
// kit: the headless library, react-dom, react-router's link components and createElement.
const DRAWS = {
  paths: [
    {
      name: "react-router",
      importNames: ["Link", "NavLink", "Form"],
      message: "A link is a kit Button with href.",
    },
    { name: "react-dom", message: "Screens render through the kit." },
    { name: "react", importNames: ["createElement"], message: "Only src/kit/ renders elements." },
  ],
  patterns: [{ group: ["@base-ui/*", "react-dom/*"], message: "Headless pieces live in the kit." }],
};
// Everything that draws through the kit: patterns, screens and the app.
const SCREENS = new Set(["src/patterns/**", "src/features/**", "src/app/**"]);
const importsOf = (folder, patterns) =>
  SCREENS.has(folder)
    ? { paths: DRAWS.paths, patterns: [...patterns, ...DRAWS.patterns] }
    : { patterns };

// A screen imports no other screen, and features/shared imports no screen: what two screens share
// goes down a layer. From a file `depth` folders under features/, an import that climbs that far
// is in features/, where the one folder it may enter is shared. A block for each depth the folder
// has (it replaces the features block there), so a deeper folder is never missed.
const FEATURE_DEPTHS = new Set(
  readdirSync(join(import.meta.dirname, "src/features"), { recursive: true })
    .filter((p) => /\.tsx?$/.test(p))
    .map((p) => p.split(/[\\/]/).length - 1),
);
const APART =
  "A screen imports no other screen, nor features/shared a screen: share it a layer down.";
const apart = (depth) => [
  { regex: `^(\\.\\./){${String(depth)}}(?!shared/)[^.]`, message: APART },
  { group: ["**/features/**"], message: APART },
];

// What only the kit may do (tools/layers.mjs and the raw-tag gate fail the same): render an element
// itself (an intrinsic tag, any mention of createElement; a tag that may be a string is the `web`
// plugin's below), or import a module whole as a namespace.
const KIT_ONLY = [
  {
    selector: "JSXOpeningElement > JSXIdentifier[name=/^[a-z]/]",
    message: "Only src/kit/ renders elements.",
  },
  { selector: "Identifier[name='createElement']", message: "Only src/kit/ renders elements." },
  {
    selector: "ImportNamespaceSpecifier",
    message: "Import the names a module is used by, not the whole of it.",
  },
];
// The layers that draw write function components: a class would skip the props checks.
const CLASS = [
  {
    selector: ":matches(ClassDeclaration, ClassExpression)",
    message: "Write a function component.",
  },
];
// The app alone loads a screen lazily; anywhere else an `import()` would hide an import from the
// layers.
const LAZY = [{ selector: "ImportExpression", message: "Only src/app/ imports lazily." }];
// Code under src/ is TypeScript, which the checks read: a JavaScript file or a bare declaration
// would carry code past them.
const UNREAD = [{ selector: "Program", message: "Write code under src/ as .ts or .tsx." }];

/** The kit's index, however its path is spelled to it. */
const KIT_INDEX = /(^|\/)kit(\/index(\.ts)?)?$/;
// Two rules no selector can say: a JSX tag whose type is, or may be, a string; and the kit taken by
// another name (a renamed or default import, a re-export, a component held in a const).
const web = {
  rules: {
    "no-string-tag": {
      meta: { type: "problem", schema: [] },
      create(context) {
        const services = context.sourceCode.parserServices;
        const checker = services.program.getTypeChecker();
        const stringy = (t) => (t.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Any)) !== 0;
        return {
          "JSXOpeningElement > JSXIdentifier[name=/^[A-Z]/]"(node) {
            const t = checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
            if (stringy(t) || (t.isUnion() && t.types.some(stringy)))
              context.report({
                node,
                message: "A tag that may be a string renders an element: only src/kit/ does.",
              });
          },
        };
      },
    },
    "kit-by-name": {
      meta: { type: "problem", schema: [] },
      create(context) {
        const kit = new Set();
        const report = (node) => {
          context.report({
            node,
            message: "Take a kit component by its own name, from the index.",
          });
        };
        return {
          ImportDeclaration(node) {
            if (!KIT_INDEX.test(node.source.value)) return;
            for (const s of node.specifiers) {
              if (s.type !== "ImportSpecifier") report(s);
              else if (s.imported.name !== s.local.name) report(s);
              else kit.add(s.local.name);
            }
          },
          "ExportNamedDeclaration, ExportAllDeclaration"(node) {
            if (node.source && KIT_INDEX.test(node.source.value)) report(node);
          },
          "VariableDeclarator > Identifier.init"(node) {
            if (kit.has(node.name)) report(node);
          },
        };
      },
    },
  },
};
export default tseslint.config(
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  ...Object.entries(LAYERS).map(([folder, patterns]) => ({
    files: [`${folder}/*.{ts,tsx}`],
    rules: { "no-restricted-imports": ["error", importsOf(folder, patterns)] },
  })),
  ...[...FEATURE_DEPTHS].map((depth) => ({
    files: [`src/features/${"*/".repeat(depth)}*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        importsOf("src/features/**", [...LAYERS["src/features/**"], ...apart(depth)]),
      ],
    },
  })),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/kit/**"],
    plugins: { web },
    rules: { "web/no-string-tag": "error", "web/kit-by-name": "error" },
  },
  // One `no-restricted-syntax` per file (a later block's replaces an earlier one's).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/kit/**", "src/app/**"],
    rules: { "no-restricted-syntax": ["error", ...KIT_ONLY, ...LAZY] },
  },
  {
    files: ["src/patterns/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}", "src/main.tsx"],
    rules: { "no-restricted-syntax": ["error", ...KIT_ONLY, ...LAZY, ...CLASS] },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...KIT_ONLY, ...CLASS] },
  },
  { files: ["src/kit/**/*.{ts,tsx}"], rules: { "no-restricted-syntax": ["error", ...LAZY] } },
  { files: ["**/*.{js,mjs,cjs,jsx}"], ...tseslint.configs.disableTypeChecked },
  {
    files: ["src/**/*.{js,mjs,cjs,jsx}", "src/**/*.d.ts"],
    rules: { "no-restricted-syntax": ["error", ...UNREAD] },
  },
  { files: ["tools/**/*.mjs"], languageOptions: { globals: globals.node } },
);

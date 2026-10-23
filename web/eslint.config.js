import { readdirSync } from "node:fs";
import { join } from "node:path";

import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// The layers (AGENTS.md › Layout, docs/architecture.md › The web): only the kit renders elements or
// holds CSS; patterns compose the kit over domain values; screens reach the data only through the
// query hooks. These rules are the fast first line, on how an import is spelled; `just gates`
// checks the same layers on the file each import resolves to (tools/layers.mjs), which no
// spelling gets past. Each block lists everything its folder may not import, because a later
// block's `no-restricted-imports` replaces an earlier one's for the same file.
const CSS = { group: ["**/*.css"], message: "Only src/kit/ has CSS; compose kit components." };
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

// Only the kit renders elements: no intrinsic tag, no tag bound to a string (`const Div = "div"`),
// no createElement (the raw-tag gate and tools/layers.mjs count the same).
const RAW = [
  {
    selector: "JSXOpeningElement > JSXIdentifier[name=/^[a-z]/]",
    message: "Only src/kit/ renders elements.",
  },
  {
    selector:
      "VariableDeclarator[id.name=/^[A-Z][a-z0-9]/] > Literal.init[value=/^[a-z][a-z0-9-]*$/]",
    message: "A tag bound to a string renders an element: only src/kit/ does.",
  },
  {
    selector: "CallExpression[callee.property.name='createElement']",
    message: "Only src/kit/ renders elements.",
  },
];
// The app alone loads a screen lazily; anywhere else an `import()` would hide an import from the
// layers.
const LAZY = [{ selector: "ImportExpression", message: "Only src/app/ imports lazily." }];

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
  // One `no-restricted-syntax` per file (a later block's replaces an earlier one's).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/kit/**", "src/app/**"],
    rules: { "no-restricted-syntax": ["error", ...RAW, ...LAZY] },
  },
  { files: ["src/app/**/*.{ts,tsx}"], rules: { "no-restricted-syntax": ["error", ...RAW] } },
  { files: ["src/kit/**/*.{ts,tsx}"], rules: { "no-restricted-syntax": ["error", ...LAZY] } },
  { files: ["**/*.{js,mjs}"], ...tseslint.configs.disableTypeChecked },
  { files: ["tools/**/*.mjs"], languageOptions: { globals: globals.node } },
);

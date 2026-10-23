import { readdirSync } from "node:fs";
import { join } from "node:path";

import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// The layers (AGENTS.md › Layout, docs/architecture.md › The web): only the kit renders elements or
// holds CSS; patterns compose the kit over domain values; screens reach the data only through the
// query hooks. Each block lists everything its folder may not import, because a later block's
// `no-restricted-imports` replaces an earlier one's for the same file.
const CSS = { group: ["**/*.css"], message: "Only src/kit/ has CSS; compose kit components." };
const KIT = { group: ["**/kit/**", "!**/kit"], message: "Import the kit from its index." };
const LAYERS = {
  "src/kit/**": [
    {
      group: ["**/api/**", "**/domain/**", "**/patterns/**", "**/features/**", "**/app/**"],
      message: "The kit is presentation only.",
    },
  ],
  "src/domain/**": [
    CSS,
    {
      group: [
        "react",
        "react-*",
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
    CSS,
    {
      group: ["**/kit", "**/kit/**", "**/patterns/**", "**/features/**", "**/app/**"],
      message: "api/ is data only.",
    },
  ],
  "src/patterns/**": [
    CSS,
    KIT,
    {
      group: [
        "**/features/**",
        "**/app/**",
        "**/domain/fixtures",
        "**/domain/library-fixtures",
        "react-router",
      ],
      message: "A pattern draws what its props say: no screens, routes or fixtures.",
    },
    {
      group: ["**/api/*", "!**/api/types"],
      message: "Patterns take data as props: the API's types only.",
    },
  ],
  "src/features/**": [
    CSS,
    KIT,
    {
      group: ["**/app/**", "**/domain/fixtures", "**/domain/library-fixtures"],
      message: "Screens don't reach into the app or the fixtures.",
    },
    {
      group: ["**/api/*", "!**/api/queries", "!**/api/types"],
      message: "Screens use the query hooks and the API's types.",
    },
  ],
  "src/app/**": [CSS, KIT],
};
// What renders elements without an intrinsic tag (so the raw-tag gate can't see it) stays in the
// kit: the headless library, react-dom, and react-router's link components.
const DRAWS = {
  paths: [
    {
      name: "react-router",
      importNames: ["Link", "NavLink", "Form"],
      message: "A link is a kit Button with href.",
    },
    { name: "react-dom", message: "Screens render through the kit." },
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
    // Only the kit renders elements: no intrinsic JSX tag anywhere else (the raw-tag gate measures
    // features and patterns; this covers the app and the rest too).
    files: ["src/**/*.tsx"],
    ignores: ["src/kit/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement > JSXIdentifier[name=/^[a-z]/]",
          message: "Only src/kit/ renders elements.",
        },
      ],
    },
  },
  { files: ["**/*.{js,mjs}"], ...tseslint.configs.disableTypeChecked },
  { files: ["tools/**/*.mjs"], languageOptions: { globals: globals.node } },
);

import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// The layers (AGENTS.md › Layout): only the kit renders elements or holds CSS; screens reach the data
// only through the query hooks. Each block lists everything its folder may not import, because a
// later block's `no-restricted-imports` replaces an earlier one's for the same file.
const CSS = { group: ["**/*.css"], message: "Only src/kit/ has CSS; compose kit components." };
const KIT = { group: ["**/kit/**", "!**/kit"], message: "Import the kit from its index." };
const LAYERS = {
  "src/kit/**": [
    {
      group: ["**/api/**", "**/domain/**", "**/features/**", "**/app/**"],
      message: "The kit is presentation only.",
    },
  ],
  "src/domain/**": [
    CSS,
    {
      group: ["react", "react-*", "**/kit", "**/kit/**", "**/features/**", "**/app/**"],
      message: "domain/ is pure.",
    },
    { group: ["**/api/*", "!**/api/types"], message: "domain/ may use the API's types only." },
  ],
  "src/api/**": [
    CSS,
    {
      group: ["**/kit", "**/kit/**", "**/features/**", "**/app/**"],
      message: "api/ is data only.",
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
const SCREENS = new Set(["src/features/**", "src/app/**"]);

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
    rules: {
      "no-restricted-imports": [
        "error",
        SCREENS.has(folder)
          ? { paths: DRAWS.paths, patterns: [...patterns, ...DRAWS.patterns] }
          : { patterns },
      ],
    },
  })),
  {
    // Only the kit renders elements: no intrinsic JSX tag anywhere else (the raw-tag gate measures
    // features; this covers the app and the rest too).
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

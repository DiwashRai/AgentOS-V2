// Raw values live in src/kit/tokens.css only: everywhere else a colour, a length or a font is a
// `var(--token)`. Allowed without a token: unitless numbers for line heights, weights, flex and
// opacity; %, fr, viewport units, s, ms and deg; and `calc` that only negates, doubles or halves
// tokens (so a new size is a new token, not arithmetic).
const OFF = {
  "color-no-hex": null,
  "color-named": null,
  "function-disallowed-list": null,
  "unit-allowed-list": null,
  "declaration-property-value-allowed-list": null,
  "declaration-property-value-disallowed-list": null,
};

/** @type {import("stylelint").Config} */
export default {
  rules: {
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
      "color-mix",
    ],
    "unit-allowed-list": ["%", "fr", "vh", "dvh", "vw", "s", "ms", "deg"],
    "declaration-property-value-allowed-list": {
      "font-family": ["/^var\\(--font-/", "inherit"],
      // V1's rule: 400, 500 and 600, never 700.
      "font-weight": ["400", "500", "600", "inherit"],
      "stroke-width": ["/^var\\(--line-/"],
    },
    "declaration-property-value-disallowed-list": {
      // Multiplying by anything but -1 or 2, or dividing by anything but 2, makes a new size; the
      // factor goes after the token, so a number before `*` is refused too.
      "/.*/": [
        "/\\*\\s*(?!(?:-1|2)(?![\\d.]))-?[\\d.]/",
        "/\\/\\s*(?!2(?![\\d.]))[\\d.]/",
        "/[\\d.]\\s*\\*/",
      ],
    },
  },
  overrides: [{ files: ["src/kit/tokens.css"], rules: OFF }],
};

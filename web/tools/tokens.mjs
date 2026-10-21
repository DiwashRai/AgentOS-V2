// The kit's tokens (src/kit/tokens.css), checked by kit.mjs: a token the theme-free `:root`
// blocks define twice. tokens.css keeps one such block per part of the kit, under that part's
// comment, so stylelint's one-block rule can't see a name reused in another block, and the later
// one silently wins (a checkbox's size once took a plan row's height). Pure, so its tests run on
// plain text.

/** Each token defined more than once across the plain `:root` blocks of a stylesheet. */
export function repeatedTokens(css) {
  const seen = new Set();
  const twice = new Set();
  for (const [, selector, body] of css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (selector.trim() !== ":root") continue;
    for (const [, name] of body.matchAll(/(--[\w-]+)\s*:/g)) {
      if (seen.has(name)) twice.add(name);
      seen.add(name);
    }
  }
  return [...twice];
}

// The kit's tokens (src/kit/tokens.css), checked by kit.mjs: a token two blocks with the same
// selector both define. tokens.css keeps one block per part of the kit (its sizes under `:root`,
// its colours under `:root:not([data-theme]), [data-theme]`), each under that part's comment, so
// stylelint's one-block rule can't see a name reused in another block, and the later one silently
// wins (a checkbox's size once took a plan row's height). A theme's own block, under its own
// selector, overrides on purpose. Pure, so its tests run on plain text.

/** Each token defined more than once across the blocks that share a selector. */
export function repeatedTokens(css) {
  const seen = new Map();
  const twice = new Set();
  const blocks = css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selector, body] of blocks) {
    const key = selector.replace(/\s+/g, " ").trim();
    const names = seen.get(key) ?? new Set();
    for (const [, name] of body.matchAll(/(--[\w-]+)\s*:/g)) {
      if (names.has(name)) twice.add(name);
      names.add(name);
    }
    seen.set(key, names);
  }
  return [...twice];
}

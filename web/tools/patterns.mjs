// The patterns' rules (kit.mjs reads the patterns and the screens, then checks them here): a
// pattern is a composition of the kit that screens share, so each value a src/patterns file exports
// is imported by 2 or more screens (directly, or through a shared module or another pattern); a
// component's props are domain values or slots, never one of the kit's own types (a vocabulary
// like `MarkKind`, a kit prop's type, a kit shape like `Fact`); and it has at most the kit's
// `budget.props`. Beside them, the kit ledger's `single` reasons stay true: a component 2 or more
// screens draw has none. Pure, so its tests run on plain values.

/**
 * @param {{file: string, name: string, screens: string[], props: Record<string, string[]> | null}[]} patterns
 *   each export, the screens importing it, and a component's props with the kit types each names
 * @param {number} maxProps the kit's `budget.props`
 * @returns {string[]}
 */
export function patternProblems(patterns, maxProps) {
  const problems = [];
  for (const p of patterns) {
    const where = `${p.file} ${p.name}`;
    const n = p.screens.length;
    if (n < 2)
      problems.push(
        `${where}: imported by ${String(n)} screen${n === 1 ? "" : "s"}; a pattern serves 2 or more`,
      );
    const props = Object.entries(p.props ?? {});
    for (const [prop, kitTypes] of props)
      for (const k of kitTypes)
        problems.push(`${where}.${prop}: typed with the kit's ${k}; take a domain value or a slot`);
    if (props.length > maxProps)
      problems.push(`${where}: ${String(props.length)} props > ${String(maxProps)}`);
  }
  return problems;
}

/**
 * @param {Map<string, Set<string>>} uses each kit component's screens
 * @param {object} led the ledger
 * @returns {string[]}
 */
export function staleSingles(uses, led) {
  return Object.entries(led.components)
    .filter(([name, entry]) => entry.single && (uses.get(name)?.size ?? 0) >= 2)
    .map(
      ([name]) =>
        `${name}: drawn by ${String(uses.get(name).size)} screens, so its \`single\` reason is stale`,
    );
}

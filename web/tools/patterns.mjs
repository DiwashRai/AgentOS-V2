// The patterns' rules (kit.mjs reads the patterns and the screens, then checks them here): a
// pattern is a composition of the kit that screens share, so each value a src/patterns file exports
// is used by 2 or more screens (directly, or through a shared module or another pattern, counted
// by the names each uses); a function's props are domain values or slots, never one of the kit's
// own types (a vocabulary like `MarkKind`, a kit prop's type, a kit shape like `Fact`, however
// renamed), and never handed unchanged to a kit variant (`look={place}`: a styling knob by another
// name); and it has at most the kit's `budget.props`. features/shared is held to the same 2
// screens: one screen's code stays in that screen. Beside them, the kit ledger's `single` reasons
// stay true: a component 2 or more screens draw has none. Pure, so its tests run on plain values.

const screensText = (n) => `${String(n)} screen${n === 1 ? "" : "s"}`;

/**
 * @param {{file: string, name: string, screens: string[], props: Record<string, string[]> | null,
 *   more?: string[]}[]} patterns each export, the screens using it, a function's props with the
 *   kit types each names, and the kit types its parameters name otherwise
 * @param {number} maxProps the kit's `budget.props`
 * @returns {string[]}
 */
export function patternProblems(patterns, maxProps) {
  const problems = [];
  for (const p of patterns) {
    const where = `${p.file} ${p.name}`;
    const n = p.screens.length;
    if (n < 2) problems.push(`${where}: used by ${screensText(n)}; a pattern serves 2 or more`);
    const props = Object.entries(p.props ?? {});
    for (const [prop, kitTypes] of props)
      for (const k of kitTypes)
        problems.push(`${where}.${prop}: typed with the kit's ${k}; take a domain value or a slot`);
    for (const k of p.more ?? [])
      problems.push(`${where}: its parameters name the kit's ${k}; take domain values or slots`);
    if (props.length > maxProps)
      problems.push(`${where}: ${String(props.length)} props > ${String(maxProps)}`);
  }
  return problems;
}

/**
 * @param {{file: string, fn: string, prop: string, to: string}[]} knobs a pattern function's prop
 *   handed unchanged to a kit component's variant prop
 * @returns {string[]}
 */
export function knobProblems(knobs) {
  return knobs.map(
    (k) =>
      `${k.file} ${k.fn}.${k.prop}: handed unchanged to ${k.to}, a styling knob; take a domain word and choose the variant from it`,
  );
}

/**
 * @param {{file: string, name: string, screens: string[]}[]} shared each features/shared export
 *   and the screens using it
 * @returns {string[]}
 */
export function sharedProblems(shared) {
  return shared
    .filter((s) => s.screens.length < 2)
    .map(
      (s) =>
        `${s.file} ${s.name}: used by ${screensText(s.screens.length)}; features/shared serves 2 or more`,
    );
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

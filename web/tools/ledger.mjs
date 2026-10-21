// The ledger's reasons, checked against what the kit declares (kit.mjs reads both): every
// component, prop, variant and nested field has a reason; a prop typed with a vocabulary takes the
// vocabulary's, and a value a union adds beside it needs its own; a vocabulary that narrows another
// (`of`) takes that one's reasons; the ledger names nothing the kit doesn't have; no component has
// more than `budget.props` props. Pure, so its tests run on plain values.

function propProblems(where, value, entry, led, vocab) {
  if (!entry?.why) return [`${where}: no reason in the ledger`];
  if (value.vocabs.length) {
    const unknown = value.vocabs.filter((name) => !led.vocab?.[name]);
    if (unknown.length)
      return unknown.map((name) => `${where}: vocabulary ${name} not in the ledger`);
    // a value a union's other case adds beside the vocabularies needs its own reason
    const own = value.vocabs.flatMap((name) => vocab[name] ?? []);
    const extra = value.values.filter((v) => !own.includes(v));
    const beside = value.vocabs.join(", ");
    const out = extra
      .filter((v) => !entry.values?.[v])
      .map((v) => `${where}=${v}: no reason in the ledger (beside ${beside})`);
    for (const v of Object.keys(entry.values ?? {}))
      if (!extra.includes(v)) out.push(`${where}=${v}: in the ledger, not in the kit`);
    return out;
  }
  const out = [];
  for (const v of value.values)
    if (!entry.values?.[v]) out.push(`${where}=${v}: no reason in the ledger`);
  for (const v of Object.keys(entry.values ?? {}))
    if (!value.values.includes(v)) out.push(`${where}=${v}: in the ledger, not in the kit`);
  const inner = `${where}${value.array ? "[]" : ""}`;
  for (const [field, f] of Object.entries(value.items))
    out.push(...propProblems(`${inner}.${field}`, f, entry.items?.[field], led, vocab));
  for (const field of Object.keys(entry.items ?? {}))
    if (!(field in value.items)) out.push(`${inner}.${field}: in the ledger, not in the kit`);
  return out;
}

/**
 * @param {Record<string, {props: Record<string, object>, notComponent?: boolean}>} kit
 * @param {Record<string, string[]>} vocab the kit's vocabularies and their values
 * @param {object} led the ledger
 * @returns {string[]}
 */
export function ledgerProblems(kit, vocab, led) {
  const problems = [];
  for (const [name, comp] of Object.entries(kit)) {
    const entry = led.components[name];
    if (comp.notComponent) problems.push(`${name}: a PascalCase export that isn't a component`);
    if (!entry?.why) {
      problems.push(`${name}: no ledger entry with a reason`);
      continue;
    }
    for (const [prop, value] of Object.entries(comp.props))
      problems.push(...propProblems(`${name}.${prop}`, value, entry.props?.[prop], led, vocab));
    for (const prop of Object.keys(entry.props ?? {}))
      if (!(prop in comp.props)) problems.push(`${name}.${prop}: in the ledger, not in the kit`);
    const n = Object.keys(comp.props).length;
    if (n > led.budget.props)
      problems.push(`${name}: ${String(n)} props > ${String(led.budget.props)}`);
  }
  for (const name of Object.keys(led.components))
    if (!(name in kit)) problems.push(`${name}: in the ledger, not in the kit`);
  for (const [name, values] of Object.entries(vocab)) {
    const entry = led.vocab?.[name];
    // a vocabulary that narrows another (`of`) takes its values' reasons from that one
    const reasons = entry?.of ? led.vocab?.[entry.of]?.values : entry?.values;
    for (const v of values)
      if (!reasons?.[v]) problems.push(`${name}=${v}: no reason in the ledger's vocabulary`);
    for (const v of Object.keys(entry?.values ?? {}))
      if (!values.includes(v)) problems.push(`${name}=${v}: in the ledger, not in the kit`);
  }
  return problems;
}

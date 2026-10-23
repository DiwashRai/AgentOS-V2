// Pure display helpers over server fields. They may combine fields into text; they never derive a
// state the server owns.

/** Whole minutes from `from` to `now` (never negative). */
export function minutesSince(from: string, now: number): number {
  return Math.max(0, (now - Date.parse(from)) / 60_000);
}

/** `now`, `25m`, `3h 10m` (`1h 05m`, `2h`), `2d`. */
export function age(from: string, now: number): string {
  const total = Math.round(minutesSince(from, now));
  if (total < 1) return "now";
  if (total < 60) return `${String(total)}m`;
  if (total < 1440) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m ? `${String(h)}h ${String(m).padStart(2, "0")}m` : `${String(h)}h`;
  }
  return `${String(Math.floor(total / 1440))}d`;
}

/** Elapsed run time as `m:ss`. */
export function elapsed(from: string, now: number): string {
  const s = Math.max(0, Math.floor((now - Date.parse(from)) / 1000));
  return `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, "0")}`;
}

/** "1 query", "2 queries". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${String(n)} ${n === 1 ? one : many}`;
}

/** The search box's terms: lowercased, split on whitespace; none matches everything. */
export function terms(q: string): readonly string[] {
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every term is a substring of one of the fields. */
export function matches(fields: readonly string[], query: readonly string[]): boolean {
  const hay = fields.join("\n").toLowerCase();
  return query.every((t) => hay.includes(t));
}

/** "NW-14" → "NW"; a bare prefix is its own project. */
export function prefixOf(key: string): string {
  const dash = key.lastIndexOf("-");
  return dash > 0 ? key.slice(0, dash).toUpperCase() : key.toUpperCase();
}

/** "northwind/web" → "web". */
export function repoShort(name: string): string {
  return name.split("/").pop() ?? name;
}

/** "Ada Park" → "Ada". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

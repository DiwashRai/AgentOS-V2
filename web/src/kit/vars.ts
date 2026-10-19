// Kit props are token names, never raw values: these unions are the names, and `space()` turns one
// into its `var(--sp-N)`. A kit component passes a token to its CSS as a custom property.
import type { CSSProperties } from "react";

/** Token values handed to a component's CSS as custom properties (an object literal of `--names`
 *  fails React's style type, so this is the one spot that names them). */
export function vars(values: Record<`--${string}`, string | undefined>): CSSProperties {
  return values;
}

/** A spacing step: `--sp-1` (2px) to `--sp-10` (32px); 0 is none. */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function space(n: Space): string {
  return n === 0 ? "0" : `var(--sp-${String(n)})`;
}

/** A length token's value in px, for the headless library's placement offsets (which take
 *  numbers), so no raw length is written in the kit's code either. */
export function tokenPx(name: `--${string}`): number {
  const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  if (Number.isNaN(px)) throw new Error(`no length token ${name}`);
  return px;
}

/** Text colour: the three inks, or a status hue's text colour. */
export type Tone = "1" | "2" | "3" | "you" | "done" | "blocked" | "live";

/** A column width: a `--col-*` size, a share of the free space, the content's own width (at
 *  least 2xl), a hairline, or a glyph's or a face's slot. */
export type Width =
  "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "fill" | "fit" | "line" | "dot" | "face";

const WIDTH: Partial<Record<Width, string>> = {
  fill: "minmax(0, 1fr)",
  fit: "minmax(var(--col-2xl), max-content)",
  line: "var(--line-1)",
  dot: "var(--sp-6)",
  face: "var(--h-chip)",
};

export function width(w: Width): string {
  return WIDTH[w] ?? `var(--col-${w})`;
}

/** Join class names, skipping falsy ones (CSS-module lookups may be undefined). */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

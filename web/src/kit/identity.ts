// A person's face: its hue, a stable hash of who they are over the five `--id-*` hues (V1's, so
// the same person reads in the same colour), and its initials. Project keys are neutral. Pure.

export const HUES = ["violet", "blue", "rose", "teal", "slate"] as const;
export type Hue = (typeof HUES)[number];

/** FNV-1a (32-bit) over the UTF-16 code units: small, stable and well spread for short strings. */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hueOf(seed: string): Hue {
  return HUES[fnv1a(seed) % HUES.length] ?? "violet";
}

/** "Ada Park" → "AP"; "ada" → "AD". */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  const first = words[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  const out = last ? `${first.charAt(0)}${last.charAt(0)}` : first.slice(0, 2);
  return out.toUpperCase() || "?";
}

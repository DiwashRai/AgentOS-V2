// Identity hues: a project key takes its hue from the key's prefix, a person from their name. A
// stable hash over the five `--id-*` hues (V1's, so the same key reads in the same colour). Pure.

export const HUES = ["violet", "plum", "rose", "gold", "olive"] as const;
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

/** "NW-14" → "NW"; a bare prefix is its own project. */
export function projectPrefix(key: string): string {
  const trimmed = key.trim();
  const dash = trimmed.lastIndexOf("-");
  const head = dash > 0 && /^\d+$/.test(trimmed.slice(dash + 1)) ? trimmed.slice(0, dash) : trimmed;
  return head.toUpperCase();
}

export function keyHue(key: string): Hue {
  return hueOf(`project:${projectPrefix(key)}`);
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

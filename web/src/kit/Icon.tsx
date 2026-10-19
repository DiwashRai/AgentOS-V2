import type { ReactNode } from "react";

import s from "./Icon.module.css";
import { cx } from "./vars";

// V1's glyphs (its kit's `I` set and the refresh's type squares). Colour comes from the CSS:
// line icons draw in currentColor, type squares and the tick in their tokens.
const LINE18 = { box: 18, cls: s.line };
const LINE14 = { box: 14, cls: s.line };
const LINE12 = { box: 12, cls: s.line };
const LINE10 = { box: 10, cls: s.line };
const TYPE = { box: 14, cls: s.type };

const TICK = (
  <>
    <circle cx="7" cy="7" r="7" />
    <path d="m4 7.2 2 2 4-4.4" />
  </>
);

const GLYPHS = {
  teams: {
    ...LINE18,
    d: (
      <>
        <rect x="3" y="3" width="5" height="5" rx="1.2" />
        <rect x="10" y="3" width="5" height="5" rx="1.2" />
        <rect x="3" y="10" width="5" height="5" rx="1.2" />
        <rect x="10" y="10" width="5" height="5" rx="1.2" />
      </>
    ),
  },
  queue: {
    ...LINE18,
    d: (
      <>
        <path d="M3 4.5h12M3 9h7M3 13.5h7" />
        <circle cx="13.5" cy="12" r="1.8" />
        <path d="M11 16c.4-1.2 1.4-1.8 2.5-1.8s2.1.6 2.5 1.8" />
      </>
    ),
  },
  compact: { ...LINE18, d: <path d="M3 4h12M3 7.3h12M3 10.6h12M3 14h12" /> },
  intake: {
    ...LINE18,
    d: <path d="M3 11.5l2.5-7h7l2.5 7M3 11.5v3h12v-3M3 11.5h3.5l1 1.5h3l1-1.5H15" />,
  },
  settings: {
    ...LINE18,
    d: (
      <>
        <circle cx="9" cy="9" r="2.3" />
        <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M4.4 13.6l1.4-1.4M12.2 5.8l1.4-1.4" />
      </>
    ),
  },
  theme: {
    ...LINE18,
    d: (
      <>
        <circle cx="9" cy="9" r="6.2" />
        <path d="M9 2.8a6.2 6.2 0 0 1 0 12.4z" className={s.solid} />
      </>
    ),
  },
  search: {
    ...LINE14,
    d: (
      <>
        <circle cx="6" cy="6" r="4" />
        <path d="M9 9l3 3" />
      </>
    ),
  },
  arrow: { ...LINE14, d: <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" /> },
  check: { ...LINE12, d: <path d="M2.5 6.2l2.3 2.3 4.7-5" /> },
  plus: { ...LINE12, d: <path d="M6 1.75v8.5M1.75 6h8.5" /> },
  close: { ...LINE12, d: <path d="M3 3l6 6M9 3l-6 6" /> },
  chevron: { ...LINE10, d: <path d="M2.5 4l2.5 2.5L7.5 4" /> },
  out: { ...LINE10, d: <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" /> },
  high: { box: 12, cls: s.high, d: <path d="M2.5 6.2 6 3l3.5 3.2M2.5 9.7 6 6.5l3.5 3.2" /> },
  low: { box: 12, cls: s.low, d: <path d="M2.5 4.5 6 7.7l3.5-3.2" /> },
  normal: { box: 12, cls: s.low, d: null },
  tick: { box: 14, cls: s.tick, d: TICK },
  "tick-sm": { box: 12, view: 14, cls: s.tick, d: TICK },
  feature: {
    ...TYPE,
    d: <path className={s.fill} d="M7.9 2.6 4.3 7.7h2.6l-.8 3.7 3.6-5.1H7.1z" />,
  },
  bug: { ...TYPE, d: <circle className={s.fill} cx="7" cy="7" r="2.6" /> },
  improvement: { ...TYPE, d: <path className={s.glyph} d="M7 10.6V3.9M4.3 6.5 7 3.8l2.7 2.7" /> },
  task: { ...TYPE, d: <path className={s.glyph} d="m4.1 7.3 2 2 3.8-4.3" /> },
} satisfies Record<string, { box: number; view?: number; cls: string | undefined; d: ReactNode }>;

export type IconName = keyof typeof GLYPHS;

export interface IconProps {
  name: IconName;
  /** The accessible name; without one the icon is decorative (the text beside it says it). */
  label?: string;
}

export function Icon({ name, label }: IconProps) {
  const g: { box: number; view?: number; cls: string | undefined; d: ReactNode } = GLYPHS[name];
  const view = String(g.view ?? g.box);
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <span className={cx(s.icon, s[name])} title={label} {...a11y}>
      <svg className={g.cls} width={g.box} height={g.box} viewBox={`0 0 ${view} ${view}`}>
        {g.box === 14 && g.cls === s.type ? <rect width="14" height="14" rx="3.5" /> : null}
        {g.d}
      </svg>
    </span>
  );
}

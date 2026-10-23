import type { ReactNode } from "react";

import s from "./Icon.module.css";
import { Tip } from "./tip";
import { cx } from "./vars";

// V1's glyphs (its kit's `I` set and the refresh's type squares). Colour comes from the CSS:
// line icons draw in currentColor, type squares and the tick in their tokens.
const LINE16 = { box: 16, cls: s.line };
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

// The sidebar's glyphs: drawn on a 16 grid at 16px, so their strokes land whole, in Linear's
// rounded line style.
const GLYPHS = {
  teams: {
    ...LINE16,
    d: (
      <>
        <rect x="2" y="2" width="5" height="5" rx="1.5" />
        <rect x="9" y="2" width="5" height="5" rx="1.5" />
        <rect x="2" y="9" width="5" height="5" rx="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="1.5" />
      </>
    ),
  },
  queue: {
    ...LINE16,
    d: (
      <>
        <path d="M2 5.5v-2A1.5 1.5 0 0 1 3.5 2h2M10.5 2h2A1.5 1.5 0 0 1 14 3.5v2M14 10.5v2a1.5 1.5 0 0 1-1.5 1.5h-2M5.5 14h-2A1.5 1.5 0 0 1 2 12.5v-2" />
        <circle cx="8" cy="8" r="2" className={s.solid} />
      </>
    ),
  },
  compact: { ...LINE16, d: <path d="M2.5 3.5h11M2.5 6.5h11M2.5 9.5h11M2.5 12.5h11" /> },
  // a view's own controls, each its own picture: filter narrows (three lines, each shorter),
  // display sets (two sliders), ordering sorts (an arrow up beside one down), and the order's
  // direction (an arrow up beside lines that shorten)
  filter: { ...LINE16, d: <path d="M2.5 4h11M4.5 8h7M6.5 12h3" /> },
  display: {
    ...LINE16,
    d: <path d="M2 5h3.5M9 5h5M2 11h7.5M13 11h1M7.25 3v4M11.25 9v4" />,
  },
  sort: {
    ...LINE16,
    d: <path d="M5 13V3M2.75 5.25 5 3l2.25 2.25M11 3v10M8.75 10.75 11 13l2.25-2.25" />,
  },
  order: { ...LINE16, d: <path d="M4 13V3M1.75 5.25 4 3l2.25 2.25M8.5 4H14M8.5 8h4M8.5 12H11" /> },
  intake: {
    ...LINE16,
    d: (
      <>
        <rect x="2" y="2.5" width="12" height="11" rx="2.5" />
        <path d="M2 9h3.25l1 1.5h3.5l1-1.5H14" />
      </>
    ),
  },
  settings: {
    ...LINE16,
    d: (
      <>
        <circle cx="8" cy="8" r="2" />
        <path d="M12.73 8.44 14.1 9.38l-.81 1.95-1.63-.3-.63.63.3 1.63-1.95.81-.94-1.37h-.88l-.94 1.37-1.95-.81.3-1.63-.63-.63-1.63.3-.81-1.95 1.37-.94v-.88L1.9 6.62l.81-1.95 1.63.3.63-.63-.3-1.63 1.95-.81.94 1.37h.88l.94-1.37 1.95.81-.3 1.63.63.63 1.63-.3.81 1.95-1.37.94z" />
      </>
    ),
  },
  agents: {
    ...LINE16,
    d: (
      <>
        <rect x="2.25" y="5" width="11.5" height="8.75" rx="2.5" />
        <path d="M8 5V2.75" />
        <circle cx="8" cy="2.25" r="1" className={s.solid} />
        <circle cx="5.75" cy="9.25" r="1" className={s.solid} />
        <circle cx="10.25" cy="9.25" r="1" className={s.solid} />
      </>
    ),
  },
  skills: {
    ...LINE16,
    d: <path d="M8 1.75 13.75 5v6L8 14.25 2.25 11V5zM2.25 5 8 8.25 13.75 5M8 8.25v6" />,
  },
  // the library's workflows: the ticket's stepped path, on the sidebar's grid
  workflows: {
    ...LINE16,
    d: (
      <>
        <circle cx="4" cy="3.5" r="1.75" />
        <circle cx="12" cy="12.5" r="1.75" />
        <path d="M4 5.25V7a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 1 12 10v.75" />
      </>
    ),
  },
  // the library's files: a page with its corner turned
  files: {
    ...LINE16,
    d: (
      <path d="M4.5 2h4.75l3.25 3.25v7.25a1.5 1.5 0 0 1-1.5 1.5h-6.5A1.5 1.5 0 0 1 3 12.5v-9A1.5 1.5 0 0 1 4.5 2zM9.25 2v3.25h3.25" />
    ),
  },
  theme: {
    ...LINE16,
    d: (
      <>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 2a6 6 0 0 1 0 12z" className={s.solid} />
      </>
    ),
  },
  // new ticket, the sidebar head's: Linear's compose, a page with a pen across its open corner
  compose: {
    ...LINE16,
    d: (
      <path d="M7.5 2.5h-3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3M11.9 2.35a1.3 1.3 0 0 1 1.85 1.85L8.4 9.55l-2.45.6.6-2.45z" />
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
  minus: { ...LINE12, d: <path d="M1.75 6h8.5" /> },
  // a drag handle: two columns of three dots
  grip: {
    ...LINE12,
    d: (
      <>
        {[3, 6, 9].map((y) => (
          <g key={y} className={s.solid}>
            <circle cx="4.25" cy={y} r="1" />
            <circle cx="7.75" cy={y} r="1" />
          </g>
        ))}
      </>
    ),
  },
  undo: { ...LINE14, d: <path d="M5.5 3 3 5.5 5.5 8M3 5.5h5.25a3 3 0 0 1 0 6H6.5" /> },
  redo: { ...LINE14, d: <path d="M8.5 3 11 5.5 8.5 8M11 5.5H5.75a3 3 0 0 0 0 6H7.5" /> },
  // a loop's rounds: two arrows chasing round a circle
  loop: {
    ...LINE14,
    d: (
      <path d="M11.5 6a4.5 4.5 0 0 0-8.3-1.4M2.5 8a4.5 4.5 0 0 0 8.3 1.4M3 2.5v2.25h2.25M11 11.5V9.25H8.75" />
    ),
  },
  // a shell stage: a prompt and a cursor
  shell: { ...LINE14, d: <path d="M3 4.5 5.5 7 3 9.5M7 10h4" /> },
  // a gate: the stepper's diamond, as a glyph
  gate: { ...LINE12, d: <path d="M6 1.75 10.25 6 6 10.25 1.75 6z" /> },
  close: { ...LINE12, d: <path d="M3 3l6 6M9 3l-6 6" /> },
  // three dots in a row: a menu of more actions
  more: {
    ...LINE14,
    d: (
      <g className={s.solid}>
        {[3, 7, 11].map((x) => (
          <circle key={x} cx={x} cy="7" r="1.25" />
        ))}
      </g>
    ),
  },
  chevron: { ...LINE10, d: <path d="M2.5 4l2.5 2.5L7.5 4" /> },
  // the chevron turned up: move a row up, the previous item
  up: { ...LINE10, d: <path d="M2.5 6l2.5-2.5L7.5 6" /> },
  // the chevron turned right: a folded block
  right: { ...LINE10, d: <path d="M4 2.5l2.5 2.5L4 7.5" /> },
  // a section heading's fold caret, Linear's small solid triangle
  caret: { ...LINE10, d: <path d="M2.75 3.75h4.5L5 6.5z" className={s.caret} /> },
  out: { ...LINE10, d: <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" /> },
  // a menu's take-away actions: a chain's two links (copy a link), two sheets (copy a key)
  link: {
    ...LINE14,
    d: (
      <path d="M6 8a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 8 2.5l-.7.7M8 6a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 6 11.5l.7-.7" />
    ),
  },
  copy: {
    ...LINE14,
    d: (
      <path d="M5 4.5V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H9.5M3 5h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    ),
  },
  // two corners pulled apart: edit in the whole window
  expand: {
    ...LINE10,
    d: <path d="M6 1.5h2.5V4M4 8.5H1.5V6M8.5 1.5 5.75 4.25M1.5 8.5l2.75-2.75" />,
  },
  // the ticket's properties: where it lives, its base branch, its workflow, when it opened
  repo: {
    ...LINE14,
    d: (
      <path d="M3 12V3.5A1.5 1.5 0 0 1 4.5 2H11v11.5H4.5A1.5 1.5 0 0 1 3 12a1.5 1.5 0 0 1 1.5-1.5H11" />
    ),
  },
  branch: {
    ...LINE14,
    d: (
      <>
        <circle cx="4" cy="3" r="1.5" />
        <circle cx="4" cy="11" r="1.5" />
        <circle cx="10" cy="3.5" r="1.5" />
        <path d="M4 4.5v5M10 5a4 4 0 0 1-4 4H4" />
      </>
    ),
  },
  workflow: {
    ...LINE14,
    d: (
      <>
        <circle cx="3.5" cy="3" r="1.5" />
        <circle cx="10.5" cy="11" r="1.5" />
        <path d="M3.5 4.5V6A1.5 1.5 0 0 0 5 7.5h4A1.5 1.5 0 0 1 10.5 9v.5" />
      </>
    ),
  },
  clock: {
    ...LINE14,
    d: (
      <>
        <circle cx="7" cy="7" r="5.5" />
        <path d="M7 4.25V7l1.75 1.25" />
      </>
    ),
  },
  // priority as Linear's signal bars: high lights all three, low the first
  high: {
    box: 12,
    cls: s.high,
    d: (
      <>
        <rect x="1.5" y="7" width="2.5" height="3.5" rx="0.75" />
        <rect x="4.75" y="4.5" width="2.5" height="6" rx="0.75" />
        <rect x="8" y="2" width="2.5" height="8.5" rx="0.75" />
      </>
    ),
  },
  low: {
    box: 12,
    cls: s.low,
    d: (
      <>
        <rect x="1.5" y="7" width="2.5" height="3.5" rx="0.75" />
        <rect x="4.75" y="4.5" width="2.5" height="6" rx="0.75" className={s.off} />
        <rect x="8" y="2" width="2.5" height="8.5" rx="0.75" className={s.off} />
      </>
    ),
  },
  // normal: Linear's three grey dashes, so a row without a raised or lowered priority keeps the
  // slot's left edge
  normal: {
    box: 12,
    cls: s.normal,
    d: (
      <>
        <rect x="1.5" y="5.25" width="2.5" height="1.5" rx="0.75" />
        <rect x="4.75" y="5.25" width="2.5" height="1.5" rx="0.75" />
        <rect x="8" y="5.25" width="2.5" height="1.5" rx="0.75" />
      </>
    ),
  },
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
  /** In the quiet ink, under the name beside it (a library row's lead, as Linear's). */
  quiet?: boolean;
}

export function Icon({ name, label, quiet }: IconProps) {
  const g: { box: number; view?: number; cls: string | undefined; d: ReactNode } = GLYPHS[name];
  const view = String(g.view ?? g.box);
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <Tip text={label} said>
      <span className={cx(s.icon, s[name], quiet && s.quiet)} {...a11y}>
        <svg
          aria-hidden="true"
          className={g.cls}
          width={g.box}
          height={g.box}
          viewBox={`0 0 ${view} ${view}`}
        >
          {g.box === 14 && g.cls === s.type ? <rect width="14" height="14" rx="3.5" /> : null}
          {g.d}
        </svg>
      </span>
    </Tip>
  );
}

// Filter chips, Linear's view chips: one row of equal chips (one height and radius), bare words
// but for the pressed one, filled a firm step with no edge. When the bar can't hold them all, the ones that
// don't fit go into a last chip ("+N" and a chevron) that opens the kit's popover (Base UI's
// combobox, as the other pickers: its filter field, then the rows); while the pressed one is
// among them, that chip is the pressed one (filled, its name and the chevron). The popover holds
// only those hidden ones, each with its count right after its name, the pressed one ticked.
import { useLayoutEffect, useRef, useState } from "react";

import { Choice } from "./choice";
import { DescribedBy, useDescribed } from "./described";
import { Icon } from "./Icon";
import { Mark, type MarkKind } from "./Mark";
import p from "./Popover.module.css";
import s from "./Segmented.module.css";

export interface Segment {
  id: string;
  label: string;
  count?: number;
  mark?: MarkKind;
}

export interface SegmentedProps {
  /** The group's accessible name, and the overflow popover's heading. */
  label: string;
  items: readonly Segment[];
  value: string;
  onChange: (id: string) => void;
  /** Hug its chips instead of taking the bar's free room, with no overflow chip: a choice of two
   *  in a form (a stage's Maker | Check), with its next control beside it. */
  fit?: boolean;
}

/** The row's room and its chips' natural widths, read from the hidden ruler. */
interface Room {
  width: number;
  gap: number;
  /** The "+N" chip. */
  more: number;
  /** The overflow chip naming the pressed one (its chip and a chevron). */
  named: number;
  pills: readonly number[];
}

/** The chips that fit in order before a last chip `reserve` wide, leaving out `skip`. */
function fill(room: Room, reserve: number, skip: number): Set<number> {
  const out = new Set<number>();
  let used = reserve;
  if (used > room.width) return out;
  for (const [i, w] of room.pills.entries()) {
    if (i === skip) continue;
    if (used + w + room.gap > room.width) break;
    used += w + room.gap;
    out.add(i);
  }
  return out;
}

/** Which chips the row shows: all if they fit, else as many as fit in order beside the overflow
 *  chip, which names the pressed one when it is among the rest. */
function shownOf(room: Room | null, pressed: number): ReadonlySet<number> {
  const all = new Set(room?.pills.map((_, i) => i) ?? []);
  if (room === null) return all;
  const total = room.pills.reduce((a, w) => a + w + room.gap, -room.gap);
  if (total <= room.width) return all;
  const out = fill(room, room.more, -1);
  return pressed < 0 || out.has(pressed) ? out : fill(room, room.named, pressed);
}

function Body({ it }: { it: Segment }) {
  return (
    <>
      {it.mark ? <Mark kind={it.mark} glyph small name={false} /> : null}
      {it.label}
      {it.count !== undefined ? <em data-zero={it.count === 0}>{it.count}</em> : null}
    </>
  );
}

function Chev() {
  return (
    <span className={s.chev}>
      <Icon name="chevron" />
    </span>
  );
}

/** Measures the row and its chips whenever the bar resizes or the chips change. */
function useRoom(key: string) {
  const track = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  useLayoutEffect(() => {
    const t = track.current;
    const r = ruler.current;
    if (!t || !r) return;
    const measure = () => {
      const widths = [...r.children].map((c) => c.getBoundingClientRect().width);
      const named = widths.pop() ?? 0;
      const more = widths.pop() ?? 0;
      const gap = parseFloat(getComputedStyle(r).columnGap) || 0;
      // the track's inner width: its padding is only room for a focus ring
      const pad = getComputedStyle(t);
      const inner = t.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
      setRoom({ width: inner, gap, more, named, pills: widths });
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(t);
    // and when the chips' own widths change (the ruler holds them at their natural width)
    watch.observe(r);
    return () => {
      watch.disconnect();
    };
  }, [key]);
  return { track, ruler, room };
}

interface MoreProps {
  label: string;
  /** The chips that don't fit: the chip counts them and the popover lists them. */
  items: readonly Segment[];
  value: string;
  /** The pressed one, when it is among the ones that don't fit: the chip names it. */
  current: Segment | undefined;
  onChange: (id: string) => void;
}

function More({ label, items, value, current, onChange }: MoreProps) {
  const marked = items.some((it) => it.mark !== undefined);
  return (
    <Choice
      label={label}
      items={items}
      value={value}
      onChange={onChange}
      sheet={s.sheet}
      trigger={{
        className: s.pill,
        // always named: a combobox's name never comes from its content, which is its value
        name: `${String(items.length)} more filters`,
        current: current !== undefined,
        body: (
          <>
            {current ? <Body it={current} /> : `+${String(items.length)}`}
            <Chev />
          </>
        ),
      }}
      row={(it) => (
        <>
          {/* the glyph's column, kept empty for a filter without one so the names align */}
          {marked ? (
            <span className={s.item}>
              {it.mark ? <Mark kind={it.mark} glyph small name={false} /> : null}
            </span>
          ) : null}
          {it.label}
          {it.count !== undefined ? (
            <span className={p.aside} data-zero={it.count === 0}>
              {it.count}
            </span>
          ) : null}
        </>
      )}
    />
  );
}
/** The pills shown, each a pressed-or-not button. */
function Pills({ items, value, shown, onChange }: PillsProps) {
  return items.map((it, i) =>
    shown(i) ? (
      <button
        key={it.id}
        type="button"
        className={s.pill}
        aria-pressed={it.id === value}
        onClick={() => {
          onChange(it.id);
        }}
      >
        <Body it={it} />
      </button>
    ) : null,
  );
}

interface PillsProps {
  items: readonly Segment[];
  value: string;
  shown: (i: number) => boolean;
  onChange: (id: string) => void;
}

/** Every pill, as wide as the form gives it: nothing to measure. In a FormRow, the group is
 *  described by the row's note and problem, as its overflow trigger is. */
function Fit({ label, items, value, onChange }: SegmentedProps) {
  const described = useDescribed();
  return (
    <div className={s.track} data-fit role="group" aria-label={label} {...described}>
      <Pills items={items} value={value} shown={() => true} onChange={onChange} />
    </div>
  );
}

/** As many pills as fit the bar, measured; the rest behind a "+N" chip. */
function Measured({ label, items, value, onChange }: SegmentedProps) {
  const described = useDescribed();
  // remeasured when anything a chip's width depends on changes: the words, counts and marks, and
  // the pressed one, which names the overflow chip when it is among the rest
  const { track, ruler, room } = useRoom(
    `${items.map((it) => `${it.label}${String(it.count)}${it.mark ?? ""}`).join()}|${value}`,
  );
  const pressed = items.findIndex((it) => it.id === value);
  const shown = shownOf(room, pressed);
  const rest = items.filter((_, i) => !shown.has(i));
  const pick = items[pressed];
  const current = shown.has(pressed) ? undefined : pick;
  return (
    <div
      ref={track}
      className={s.track}
      data-collapsed={shown.size === 0}
      role="group"
      aria-label={label}
      {...described}
    >
      <Pills items={items} value={value} shown={(i) => shown.has(i)} onChange={onChange} />
      {rest.length > 0 ? (
        // the group carries the row's description; its overflow chip doesn't repeat it
        <DescribedBy.Provider value={null}>
          <More label={label} items={rest} value={value} current={current} onChange={onChange} />
        </DescribedBy.Provider>
      ) : null}
      {/* the ruler, unseen: every chip at natural width, then the "+N" chip (with its chevron) and
          the chip naming the pressed one, to measure the fit */}
      <div ref={ruler} className={s.ruler} aria-hidden="true" inert>
        {items.map((it) => (
          <span key={it.id} className={s.pill}>
            <Body it={it} />
          </span>
        ))}
        <span className={s.pill}>
          +{items.length}
          <Chev />
        </span>
        <span className={s.pill}>
          {pick ? <Body it={pick} /> : null}
          <Chev />
        </span>
      </div>
    </div>
  );
}

export function Segmented(props: SegmentedProps) {
  return props.fit ? <Fit {...props} /> : <Measured {...props} />;
}

// A workflow's stages top to bottom, as Cards on a lane whose axis runs through their faces.
// Between two cards a joint: the gate after the stage as a diamond on the axis (the ticket
// stepper's), and, while editing, the + that inserts a stage there. A loop is a bracket round its
// stages, a faint band on a hairline with its foot (up to N rounds) under its last card. Editing,
// the stages reorder on a Sortable (a handle, a drop line, ↑ ↓) that also takes drops between
// cards; the diamond is a toggle. Read only, it is the same lane with none of that.
import type { ReactNode } from "react";

import { Button } from "./Button";
import type { DragPayload } from "./dnd";
import s from "./Lane.module.css";
import { Sortable } from "./Sortable";

export interface LaneStage {
  id: string;
  /** Its name: what its handle, its gate and its + say ("Move Plan", "Add a gate after Plan"). */
  label: string;
  /** The stage's Card (inside a Drop while editing). */
  content: ReactNode;
  /** The gate after it, by name, or none. */
  gate: string | null;
  /** Why no gate can go after it, when none can (the workflow's rule, said by the screen): its
   *  empty diamond is inert and says so. */
  noGate?: string;
}

export interface LaneLoop {
  /** The first and the last stage it repeats, by id. */
  first: string;
  last: string;
  /** Its foot under the last card: its rounds (a number field while editing), what's wrong. */
  foot: ReactNode;
}

export interface LaneEdit {
  /** A stage dragged (or moved by ↑ ↓) from one index to another. */
  onMove: (from: number, to: number) => void;
  /** The diamond after the stage at this index: the gate on or off. */
  onGate: (i: number) => void;
  /** The + after the stage at `at - 1`: a new stage at slot `at`. */
  onInsert: (at: number) => void;
  /** Kinds dropped on the lane between cards (an agent: a new stage with it). */
  accept: readonly string[];
  onDrop: (payload: DragPayload, at: number) => void;
  /** The drop line drawn at this slot: a still of a drag. */
  preview?: number;
}

export interface LaneProps {
  /** The list's accessible name. */
  label: string;
  stages: readonly LaneStage[];
  loops: readonly LaneLoop[];
  /** The editing affordances; none draws the lane read only. */
  edit?: LaneEdit;
}

type Pos = "first" | "mid" | "last" | "only";

/** The place of stage `k` in a loop from `a` to `b`. */
function posIn(k: number, a: number, b: number): Pos {
  if (a === b) return "only";
  if (k === a) return "first";
  return k === b ? "last" : "mid";
}

/** Each stage's place in a loop, if it is in one, and the foot under a loop's last stage. */
function places(stages: readonly LaneStage[], loops: readonly LaneLoop[]) {
  const pos = new Map<number, Pos>();
  const feet = new Map<number, ReactNode>();
  const at = (id: string) => stages.findIndex((st) => st.id === id);
  for (const loop of loops) {
    const [a, b] = [at(loop.first), at(loop.last)];
    if (a < 0 || b < a) continue;
    for (let k = a; k <= b; k++) pos.set(k, posIn(k, a, b));
    feet.set(b, loop.foot);
  }
  return { pos, feet };
}

interface JointProps {
  st: LaneStage;
  i: number;
  last: boolean;
  edit: LaneEdit | undefined;
}

/** The gate's diamond on the axis: a toggle while editing, a mark when read only. Where no gate can
 *  go (`noGate`) an empty slot is inert and says why; one that got there by a reorder stays a
 *  toggle, so it can be taken off. */
function Diamond({ st, i, edit }: Omit<JointProps, "last">) {
  // read only, the gate's name is written beside it: the diamond is drawing alone
  if (!edit) return <span className={s.gate} data-on aria-hidden="true" />;
  const on = st.gate !== null;
  if (st.noGate !== undefined && !on)
    return (
      <span className={s.gate} data-inert role="img" aria-label={st.noGate} title={st.noGate} />
    );
  const say = on
    ? `Gate after ${st.label}: ${st.gate ?? ""}. Click to remove it`
    : `Add a gate after ${st.label}`;
  return (
    <button
      type="button"
      className={s.gate}
      data-on={on || undefined}
      aria-pressed={on}
      aria-label={say}
      title={say}
      onClick={() => {
        edit.onGate(i);
      }}
    />
  );
}

/** The + after a stage: a new stage there. */
function Insert({ st, i, last, edit }: JointProps & { edit: LaneEdit }) {
  return (
    <Button
      variant="quiet"
      size="xs"
      icon="plus"
      title={`${last ? "Add" : "Insert"} a stage after ${st.label}`}
      onClick={() => {
        edit.onInsert(i + 1);
      }}
    />
  );
}

/** Between a card and the next: the axis, the gate's diamond and name, and the + while editing. */
function Joint({ st, i, last, edit }: JointProps) {
  const gated = st.gate !== null;
  if (!edit && !gated && last) return null;
  return (
    <div className={s.joint} data-end={last || undefined}>
      {edit || gated ? <Diamond st={st} i={i} edit={edit} /> : null}
      {gated ? <span className={s.name}>{st.gate}</span> : null}
      {edit ? <Insert st={st} i={i} last={last} edit={edit} /> : null}
    </div>
  );
}

interface RowProps extends JointProps {
  pos: Pos | undefined;
  foot: ReactNode;
}

/** A card and the joint after it; in a loop, its piece of the band (the joint too, unless the
 *  loop ends here, where the loop's foot goes instead). */
function Row({ st, i, last, edit, pos, foot }: RowProps) {
  const inside = pos === "first" || pos === "mid";
  const joint = <Joint st={st} i={i} last={last} edit={edit} />;
  return (
    <div className={s.row}>
      <div className={s.block} data-loop={pos}>
        {pos ? <span className={s.band} data-pos={pos} aria-hidden="true" /> : null}
        <div className={s.card}>{st.content}</div>
        {foot ? <div className={s.foot}>{foot}</div> : null}
        {inside ? joint : null}
      </div>
      {inside ? null : joint}
    </div>
  );
}

export function Lane({ label, stages, loops, edit }: LaneProps) {
  const { pos, feet } = places(stages, loops);
  const rows = stages.map((st, i) => ({
    id: st.id,
    label: st.label,
    content: (
      <Row
        st={st}
        i={i}
        last={i === stages.length - 1}
        edit={edit}
        pos={pos.get(i)}
        foot={feet.get(i)}
      />
    ),
  }));
  return (
    <div className={s.lane} data-edit={edit !== undefined || undefined}>
      {edit ? (
        <Sortable
          label={label}
          gutter={false}
          items={rows}
          onMove={edit.onMove}
          accept={edit.accept}
          onDrop={edit.onDrop}
          {...(edit.preview !== undefined ? { preview: edit.preview } : {})}
        />
      ) : (
        <div role="list" aria-label={label}>
          {rows.map((r) => (
            <div key={r.id} role="listitem">
              {r.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

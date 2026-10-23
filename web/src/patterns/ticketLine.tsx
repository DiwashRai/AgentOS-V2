// The cells a ticket's line shares between the lists (Compact, My queue, All teams), as Linear lists
// an issue: the priority bars and the key; the one coloured status glyph and the title, with what it
// waits on in the title's tooltip; then, at the far end, the line's properties as plain words on
// fixed columns (the stage, the source), the age and the owner's face, so they read down the list
// as a ledger, not a pile of pills. Each screen sets what leads that end (its Now tag, a row's
// buttons).
import type { ReactElement } from "react";

import type { Person, Priority, TicketRow, TicketType } from "../api/types";
import {
  markOf,
  type MarkModel,
  nowLine,
  sourceText,
  STATE_WORD,
  stageModel,
  stageWord,
} from "../domain/board";
import { fromPerson } from "../domain/format";
import { Badge, type Column, Icon, Mark, Stack, Text } from "../kit";
import { TicketAge } from "./age";
import { Who } from "./who";

/** High and low priority are said; normal is the bars' resting form, said by nothing. */
const PRIORITY_SAY: Record<Exclude<Priority, "normal">, string> = {
  high: "High priority",
  low: "Low priority",
};

/** A title glyph's name: on a bookend (Inbox, Done, Closed) the line's stage says the state, so
 *  the glyph is drawing alone; elsewhere it is the state's one sign. */
const said = (kind: MarkModel["kind"]) =>
  kind === "idle" || kind === "done" || kind === "abandoned" ? false : STATE_WORD[kind];

const TYPE_WORD: Record<TicketType, string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
};

/** The right end every line shares, on fixed columns so each ends on one edge in every row and
 *  group: the stage, the source, the age, the face (unlabelled: a face says what it is). What
 *  they leave goes to the title. Each column names its cell, so `lineEnd` draws one per column. */
type EndCell = "stage" | "source" | "age" | "owner";
const END: readonly (readonly [EndCell, Column])[] = [
  ["stage", { label: "Stage", width: "sm" }],
  ["source", { label: "Source", width: "sm" }],
  ["age", { label: "Age", width: "xs", end: true }],
  ["owner", { label: "", width: "face", end: true }],
];
export const LINE_END: readonly Column[] = END.map(([, column]) => column);

/** The priority bars, then the key (its type on hover: a row's one glyph is its status). */
export function KeyCell({ t }: { t: TicketRow }) {
  return (
    <Stack dir="row" gap={4} align="center">
      <Icon
        name={t.priority}
        {...(t.priority === "normal" ? {} : { label: PRIORITY_SAY[t.priority] })}
      />
      <Badge kind="key" title={`${t.key} · ${TYPE_WORD[t.type]}`}>
        {t.key}
      </Badge>
    </Stack>
  );
}

/** The status glyph and the title alone, what it waits on in its tooltip (the row's Now and stage
 *  already say it): one line, cut at its end. A line nothing is at work on recedes a step, its
 *  title in the second ink: a settled one (done, closed) and a queued one (no runner has it yet). */
export function TicketTitle({ t, me }: { t: TicketRow; me: Person | null }) {
  const a = t.attention;
  const kind = markOf(a, me).kind;
  const after = nowLine(t, me).after;
  const recedes = kind === "queued" || kind === "done" || kind === "abandoned";
  return (
    <Stack dir="row" gap={4} align="center">
      <Mark
        kind={kind}
        glyph
        name={said(kind)}
        progress={a.kind === "running" ? a.progress : null}
      />
      <Text
        weight={500}
        tone={recedes ? "2" : "1"}
        truncate
        title={after ? `${t.title} · ${after}` : t.title}
      >
        {t.title}
      </Text>
    </Stack>
  );
}

/** The quiet end of a line, as cells (spread into the Row, one per LINE_END column): the stage
 *  ("Review 2/3", the whole way on hover) and the source in plain words, the age ("now" while it
 *  runs), the owner's face (Linear's dashed ring when nobody owns it). */
export function lineEnd({ t, me, now }: { t: TicketRow; me: Person | null; now: number }) {
  const stage = stageWord(stageModel(t, me));
  const source = sourceText(t);
  const cells: Record<EndCell, ReactElement> = {
    stage: (
      <Text key="stage" variant="meta" tone="2" truncate title={stage.path}>
        {stage.word}
      </Text>
    ),
    source: (
      <Text key="source" variant="meta" tone="3" truncate title={source}>
        {source}
      </Text>
    ),
    age: <TicketAge key="age" t={t} now={now} />,
    owner: <Who key="owner" who={fromPerson(t.owner)} place="face" />,
  };
  return END.map(([cell]) => cells[cell]);
}

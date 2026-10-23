// The cells a ticket's line shares between Compact and My queue, as Linear lists an issue: the
// priority bars and the key; the one coloured status glyph and the title, with what it waits on
// receding after it on the same line; then, at the far end, the line's properties as plain words
// on fixed columns (the stage, the source), the age and the owner's face, so they read down the
// list as a ledger, not a pile of pills. Each screen sets what leads that end (its Now tag, a
// row's buttons).
import type { Person, Priority, TicketRow, TicketType } from "../../api/types";
import { markOf, type MarkModel, STATE_WORD, stageModel } from "../../domain/board";
import { age } from "../../domain/format";
import { Age, Avatar, Badge, type Column, Icon, Mark, Stack, Text } from "../../kit";
import { sourceText, stageWord } from "./model";

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
 *  they leave goes to the title. */
export const LINE_END: readonly Column[] = [
  { label: "Stage", width: "sm" },
  { label: "Source", width: "sm" },
  { label: "Age", width: "xs", end: true },
  { label: "", width: "face", end: true },
];

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

/** The status glyph, the title, and after it the quiet words of what it waits on: one line, cut
 *  at its end, so the words give way before the title does. A settled line (done, closed) recedes
 *  a step: its title in the second ink. */
export function TitleCell({ t, me, after }: { t: TicketRow; me: Person | null; after: string }) {
  const a = t.attention;
  const kind = markOf(a, me).kind;
  const settled = kind === "done" || kind === "abandoned";
  return (
    <Stack dir="row" gap={4} align="center">
      <Mark
        kind={kind}
        glyph
        name={said(kind)}
        progress={a.kind === "running" ? a.progress : null}
      />
      <Text tone="3" truncate title={after ? `${t.title} · ${after}` : t.title}>
        <Text weight={500} tone={settled ? "2" : "1"}>
          {t.title}
        </Text>
        {after ? `\u2002${after}` : null}
      </Text>
    </Stack>
  );
}

/** The quiet end of a line, as cells (spread into the Row, one per LINE_END column): the stage
 *  ("Review 2/3", the whole way on hover) and the source in plain words, the age, the owner's face
 *  (Linear's dashed ring when nobody owns it). */
export function lineEnd({ t, me, now, age: shown }: LineEndProps) {
  const stage = stageWord(stageModel(t, me));
  const source = sourceText(t);
  return [
    <Text key="stage" variant="meta" tone="2" truncate title={stage.path}>
      {stage.word}
    </Text>,
    <Text key="source" variant="meta" tone="3" truncate title={source}>
      {source}
    </Text>,
    <Text key="age" variant="meta" tone="3">
      <Age text={shown ?? age(t.since, now)} />
    </Text>,
    t.owner ? (
      <Avatar key="owner" name={t.owner.name} seed={String(t.owner.id)} />
    ) : (
      <Avatar key="owner" dashed />
    ),
  ];
}

interface LineEndProps {
  t: TicketRow;
  me: Person | null;
  now: number;
  /** In place of the age since it changed ("now" while it runs). */
  age?: string;
}

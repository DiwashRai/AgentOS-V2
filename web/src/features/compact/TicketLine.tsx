// The cells a ticket's line shares between Compact and My queue, as Linear lists an issue: the
// priority bars and the key; the one coloured status glyph and the title, with what it waits on
// receding after it on the same line; then one tight cluster at the far end: the row's label chips
// (the agent and its step, the stage on its state's dot, the source) hugging the age, and last the
// owner's face. The age and the face sit on fixed columns, so they end on one edge row after row.
import type { Person, Priority, TicketRow, TicketType } from "../../api/types";
import { markOf, type MarkModel, STATE_WORD, stageModel } from "../../domain/board";
import { age } from "../../domain/format";
import { Age, Avatar, Badge, Chip, type Column, Icon, Mark, Stack, Text } from "../../kit";
import { chipWords, sourceText, stageDot, stageWord } from "./model";

/** High and low priority are said; normal is the bars' resting form, said by nothing. */
const PRIORITY_SAY: Record<Exclude<Priority, "normal">, string> = {
  high: "High priority",
  low: "Low priority",
};

const TYPE_WORD: Record<TicketType, string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
};

/** The right end every line shares: the chips, as wide as they are and pressed against the age;
 *  the age and the face on fixed columns, so each ends on one edge in every row and group. What
 *  the chips leave goes to the title. */
export const LINE_END: readonly Column[] = [
  { label: "Chips", width: "3xl", hug: true, end: true },
  { label: "Age", width: "xs", end: true },
  { label: "Owner", width: "face", end: true },
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
 *  at its end, so the words give way before the title does. */
export function TitleCell({ t, me, after }: { t: TicketRow; me: Person | null; after: string }) {
  const a = t.attention;
  return (
    <Stack dir="row" gap={4} align="center">
      <Mark
        kind={markOf(a, me).kind}
        glyph
        name={STATE_WORD[markOf(a, me).kind]}
        progress={a.kind === "running" ? a.progress : null}
      />
      <Text tone="3" truncate title={after ? `${t.title} · ${after}` : t.title}>
        <Text weight={500} tone="1">
          {t.title}
        </Text>
        {after ? `\u2002${after}` : null}
      </Text>
    </Stack>
  );
}

/** The quiet end of a line, as cells (spread into the Row, one per LINE_END column): the chips
 *  (the row's Now chip, if it has one; the stage on its state's dot, "Review 2/3", the whole way on
 *  hover; the source on the repo glyph), the age, the owner's face (an empty slot keeps its place). */
export function lineEnd({ t, me, now, age: shown, chip }: LineEndProps) {
  const m = stageModel(t, me);
  const stage = stageWord(m);
  const source = sourceText(t);
  return [
    <Stack key="chips" dir="row" gap={3} align="center" justify="end">
      {chip?.mark ? (
        <Chip
          label={chipWords(chip.mark)}
          title={[chipWords(chip.mark), chip.count].filter(Boolean).join(" · ")}
          {...(chip.count ? { after: { text: chip.count } } : {})}
        />
      ) : null}
      <Chip dot={stageDot(t, me)} label={stage.word} title={stage.path} />
      {source ? <Chip lead="repo" label={source} /> : null}
    </Stack>,
    <Text key="age" variant="meta" tone="3">
      <Age text={shown ?? age(t.since, now)} />
    </Text>,
    t.owner ? (
      <Avatar key="owner" name={t.owner.name} seed={String(t.owner.id)} />
    ) : (
      <Avatar key="owner" />
    ),
  ];
}

interface LineEndProps {
  t: TicketRow;
  me: Person | null;
  now: number;
  /** In place of the age since it changed ("now" while it runs). */
  age?: string;
  /** The row's Now chip (the agent and its step, who it waits on), first in the cluster. */
  chip?: { mark: MarkModel | null; count: string | null };
}

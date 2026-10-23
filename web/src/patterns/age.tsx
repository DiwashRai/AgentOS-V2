// An age in a list's cell, as every list writes it: short ("3h 10m", "2d", "now"), its units a size
// smaller, quiet; the whole of it in full words in its tooltip ("Updated 3 hours 10 minutes ago").
// A ticket's line counts from its state's start, and reads "now" while a run is at work on it.
import type { Iso, TicketRow } from "../api/types";
import { age, agoInWords } from "../domain/format";
import { Age, Text } from "../kit";

/** What the age counts from, for its tooltip. */
type What = "updated" | "started" | "changed";

const WORD: Record<What, string> = { updated: "Updated", started: "Started", changed: "Changed" };

function Cell({ text, title }: { text: string; title: string }) {
  return (
    <Text variant="meta" tone="3">
      <Age text={text} title={title} />
    </Text>
  );
}

export function AgeCell({ since, now, what }: { since: Iso; now: number; what: What }) {
  return <Cell text={age(since, now)} title={`${WORD[what]} ${agoInWords(since, now)}`} />;
}

/** A ticket line's age: how long it has been in its state; "now" while it runs. */
export function TicketAge({ t, now }: { t: TicketRow; now: number }) {
  if (t.attention.kind === "running")
    return <Cell text="now" title={`${WORD.started} ${agoInWords(t.since, now)}`} />;
  return <AgeCell since={t.since} now={now} what="changed" />;
}

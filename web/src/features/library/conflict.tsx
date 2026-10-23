// A save refused because someone else saved first: what happened and what each choice does, then
// both versions side by side, line against line, each side's own changes from the version you both
// started from tinted (lines nobody changed stay plain). Keep mine saves at once as the next
// version: yours, with each of their changes that doesn't touch yours carried over (the button says
// how many of theirs it would drop). Take theirs drops your edit.
import { useNow, useRuntimes } from "../../api/queries";
import { age, plural } from "../../domain/format";
import { Button, Compare, Notice, Stack } from "../../kit";
import type { Draft, Stored } from "./draft";
import { changedFrom, mergeDraft } from "./merge";
import { authorName, draftLines, pairLines, type Side } from "./model";

const v = (n: number) => `v${String(n)}`;
const count = (s: Side) => s.changed.filter(Boolean).length;

/** What Keep mine does, on its button and in the notice. */
function keepWords(who: string, mine: number, theirs: number, dropped: number, next: string) {
  if (dropped > 0)
    return {
      button: `Keep mine, drop ${String(dropped)} of theirs`,
      fix: `Keep mine saves yours as ${next} and drops ${plural(dropped, "line")} ${who} changed where you did. Take theirs drops your edit.`,
    };
  const carried =
    theirs > 0 ? `, with ${who}'s ${plural(theirs, "change")} (none touch yours)` : "";
  return {
    button: `Keep mine, save ${next}`,
    fix: `Keep mine saves your ${plural(mine, "change")} as ${next}${carried}. Take theirs drops your edit.`,
  };
}

export function Conflict({
  base,
  mine,
  theirs,
  onKeepMine,
  onTakeTheirs,
}: {
  /** The version yours was edited from. */
  base: Stored;
  mine: Draft;
  theirs: Stored;
  onKeepMine: () => void;
  onTakeTheirs: () => void;
}) {
  const runtimes = useRuntimes().data ?? [];
  const now = useNow(60_000);
  const who = authorName(theirs.by);
  const when = age(theirs.at, now);
  const lines = (d: Draft) => draftLines(d, runtimes);
  const b = lines(base.draft);
  const side = (d: Draft): Side => ({ lines: lines(d), changed: changedFrom(b, lines(d)) });
  const yours = side(mine);
  const their = side(theirs.draft);
  const { dropped } = mergeDraft(base.draft, mine, theirs.draft);
  const keep = keepWords(who, count(yours), count(their), dropped, v(theirs.version + 1));
  return (
    <Stack gap={8}>
      <Notice
        kind="problem"
        lead={`${who} saved ${v(theirs.version)} ${when} ago, while you were editing ${v(base.version)}`}
        fix={keep.fix}
      >
        Your changes aren&apos;t saved yet.
      </Notice>
      <Compare
        label={`Your version and ${who}'s`}
        sides={[
          {
            title: "Yours",
            note: `${plural(count(yours), "change")} from ${v(base.version)} · not saved`,
            action: (
              <Button size="sm" variant="you" onClick={onKeepMine}>
                {keep.button}
              </Button>
            ),
          },
          {
            title: who,
            note: `${v(theirs.version)} · ${plural(count(their), "change")} from ${v(base.version)} · ${when} ago`,
            action: (
              <Button size="sm" onClick={onTakeTheirs}>
                Take theirs
              </Button>
            ),
          },
        ]}
        rows={pairLines(yours, their)}
      />
    </Stack>
  );
}

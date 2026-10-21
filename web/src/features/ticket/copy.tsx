// What the ticket's copies share wherever they're drawn, so its tabs and its two full-window editors
// (its workflow, ?edit=workflow; an item, ?edit=<name>) can't drift apart: the copy's title, its
// drift from the library in one vocabulary, and the question asked when an editor would close with
// unsaved changes.
import type { Drift } from "../../api/types";
import { Button, Chip, Icon, Stack, Text } from "../../kit";

/** An editor's title over a copy: "NW-17's copy of Standard v3". */
export const copyTitle = (key: string, name: string, version: number): string =>
  `${key}'s copy of ${name} v${String(version)}`;

/** A copy's drift both ways, the same on every surface: the library's newer version in the accent
 *  (there is something to take), the ticket's own change with a pen, in ink. Neither recedes as
 *  "In step"; `null` is the ticket's own item. Never green or orange: those are run states. */
export function DriftChips({ drift, of }: { drift: Drift | null; of: string }) {
  if (drift === null)
    return (
      <Text variant="meta" tone="3" title="The ticket's own: not in the library">
        Ticket only
      </Text>
    );
  const { library, changed } = drift;
  if (library === null && !changed)
    return (
      <Text variant="meta" tone="3" title={`The same as ${of} in the library`}>
        In step
      </Text>
    );
  return (
    <>
      {library !== null ? (
        <Chip
          dot="you"
          label={`Library has v${String(library)}`}
          title={`${of} is at v${String(library)} in the library`}
        />
      ) : null}
      {changed ? (
        <Chip
          lead={<Icon name="compose" />}
          label={"Changed here"}
          title="This ticket changed its copy"
        />
      ) : null}
    </>
  );
}

/** Asked over an editor that would close with unsaved changes: Keep editing first (it takes the
 *  focus, so Enter is safe), Discard plain, Save lit. */
export function SaveAsk({
  what,
  onKeep,
  onDiscard,
  onSave,
}: {
  what: string;
  onKeep: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <Stack gap={3}>
        <Text variant="heading" as="h2">{`Save your changes to ${what}?`}</Text>
        <Text tone="2">Closing now loses them.</Text>
      </Stack>
      <Stack dir="row" gap={4} justify="end">
        <Button onClick={onKeep}>Keep editing</Button>
        <Button onClick={onDiscard}>Discard</Button>
        <Button variant="you" onClick={onSave}>
          Save
        </Button>
      </Stack>
    </>
  );
}

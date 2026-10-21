// Talk's head, the same on the ticket page and in the peek: its name and who is in it on one line,
// what it is for under them.
import type { Person } from "../../api/types";
import { Avatar, Stack, Text } from "../../kit";

export function TalkHead({ people }: { people: readonly Person[] }) {
  return (
    <Stack gap={2}>
      <Stack dir="row" gap={5} align="center">
        <Text variant="heading" as="h2">
          Talk
        </Text>
        <Stack grow />
        <Avatar size="talk" people={people.map((p) => ({ name: p.name, seed: String(p.id) }))} />
      </Stack>
      <Text tone="3">Just people here. Agents don&apos;t read this.</Text>
    </Stack>
  );
}

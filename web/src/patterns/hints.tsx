// The keys a list answers to, as its foot says them (Compact's, the library lists'): each key on a
// keycap, then what it does in quiet words.
import { Badge, Stack, Text } from "../kit";

export function KeyHints({ keys }: { keys: readonly { key: string; does: string }[] }) {
  return (
    <>
      {keys.map(({ key, does }) => (
        <Stack key={key} dir="row" gap={3} align="center">
          <Badge kind="kbd">{key}</Badge>
          <Text variant="meta">{does}</Text>
        </Stack>
      ))}
    </>
  );
}

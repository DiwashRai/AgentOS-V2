// A count in a list's foot (Compact's tickets and repos, All teams' tickets in flight): the figure in
// the first ink and a weight up, its noun quieter after it, by plural's rule.
import { nounFor } from "../domain/format";
import { Text } from "../kit";

export function Tally({ n, one, many }: { n: number; one: string; many?: string }) {
  return (
    <Text variant="meta" tone="2">
      <Text weight={600} tone="1">
        {String(n)}
      </Text>
      {` ${nounFor(n, one, many)}`}
    </Text>
  );
}

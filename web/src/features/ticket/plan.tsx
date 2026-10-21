// The ticket's plan (TASKS.md), the same on the ticket page and in the peek: how much of it is done
// after its name, then its items, or a quiet line while there is none.
import type { PlanItem } from "../../domain/plan";
import { Checklist, type ChecklistProps, Section, Text } from "../../kit";

export function PlanSection({
  plan,
  look,
}: {
  plan: readonly PlanItem[];
  look: ChecklistProps["look"];
}) {
  const done = plan.filter((i) => i.done).length;
  return (
    <Section
      title="Plan"
      {...(plan.length > 0 ? { aside: `${String(done)} of ${String(plan.length)} done` } : {})}
    >
      {plan.length > 0 ? (
        <Checklist items={plan} look={look} />
      ) : (
        <Text tone="3">No plan yet.</Text>
      )}
    </Section>
  );
}

// The ticket's plan (TASKS.md), the same on the ticket page and in the peek: how much of it is done
// after its name (Linear's sub-issues: a pie as far as it is, then the count), then its items, or a
// quiet line while there is none.
import type { PlanItem } from "../../domain/plan";
import { Checklist, type ChecklistProps, Mark, Section, Text } from "../../kit";

export function PlanSection({
  plan,
  look,
}: {
  plan: readonly PlanItem[];
  look: ChecklistProps["look"];
}) {
  const done = plan.filter((i) => i.done).length;
  const aside = (
    <>
      <Mark
        kind={done === plan.length ? "done" : "run"}
        glyph
        small
        name={false}
        progress={{ done, total: plan.length }}
      />
      {`${String(done)}/${String(plan.length)}`}
    </>
  );
  return (
    <Section title="Plan" {...(plan.length > 0 ? { aside } : {})}>
      {plan.length > 0 ? (
        <Checklist items={plan} look={look} />
      ) : (
        <Text tone="3">No plan yet.</Text>
      )}
    </Section>
  );
}

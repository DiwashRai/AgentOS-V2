// A skill's editor (/library/skills/:id): its name and description, its SKILL.md, and where it
// lives, in the shared item editor; the other skills a step or a pick away.
import { useParams } from "react-router";

import { loadOf, useSkill, useSkills } from "../../api/queries";
import { Page, Text } from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { ItemEditor } from "../shared/itemEditor/ItemEditor";

const href = (id: string) => `/library/skills/${id}`;

export function SkillView() {
  const { id = "" } = useParams();
  const q = loadOf(useSkill(id));
  const all = useSkills().data?.items ?? [];
  if (q.kind !== "ready")
    return (
      <Page title={[{ label: "Skills", href: "/library/skills" }, id]}>
        <LoadNotice load={q} noun="skill" id={id} />
      </Page>
    );
  const s = q.data;
  return (
    <ItemEditor
      key={s.id}
      title={[{ label: "Skills", href: "/library/skills" }, s.name]}
      item={{ ...s, body: { kind: "text", text: s.content } }}
      contentTitle="SKILL.md"
      name={{ label: "Name", value: s.name }}
      description={s.description}
      facts={[
        {
          label: "Path",
          value: (
            <Text variant="code" tone="2" truncate title={s.path}>
              {s.path}
            </Text>
          ),
        },
      ]}
      usedBy={s.used_by}
      siblings={{
        noun: "skill",
        items: all.map((x) => ({ id: x.id, label: x.name })),
        current: s.id,
        href,
      }}
    />
  );
}

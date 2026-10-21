// A skill's editor (/library/skills/:id): its name and description, its SKILL.md, and where it
// lives, in the shared item editor; the other skills a step or a pick away.
import { useParams } from "react-router";

import { useSkill, useSkills } from "../../api/queries";
import { Notice, Page, Text } from "../../kit";
import { ItemEditor } from "./ItemEditor";

const href = (id: string) => `/library/skills/${id}`;

export function SkillView() {
  const { id = "" } = useParams();
  const q = useSkill(id);
  const all = useSkills().data?.items ?? [];
  const s = q.data;
  if (!s)
    return (
      <Page title={[{ label: "Skills", href: "/library/skills" }, id]}>
        <Notice kind="status" error={q.isError}>
          {q.isError ? `No skill ${id}` : "Loading"}
        </Notice>
      </Page>
    );
  return (
    <ItemEditor
      key={s.id}
      title={[{ label: "Skills", href: "/library/skills" }, s.name]}
      item={{ ...s, body: { kind: "text", text: s.content } }}
      contentTitle="SKILL.md"
      name={{ label: "Name", value: s.name, mono: false }}
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

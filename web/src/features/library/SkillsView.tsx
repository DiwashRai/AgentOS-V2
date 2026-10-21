// The library's skills (/library/skills): each skill's name and what it is for, and what uses it
// (its workflows, and the tickets on them or that added it). A row opens the skill's editor.
import { useSkills } from "../../api/queries";
import type { Skill } from "../../api/types";
import { matches } from "../../domain/format";
import { type Column, Icon, Text } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { LibraryList, LibraryRow, NameCell } from "./list";
import { usedByText } from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Skill", width: "fill", min: "2xl" },
  { label: "Used by", width: "xl", end: true },
];

export function SkillsView() {
  const all = useSkills().data?.items ?? [];
  const { query, search } = useSearch("Search skills");
  const shown = all.filter((s) => matches([s.name, s.description], query));
  const href = (s: Skill) => `/library/skills/${s.id}`;
  return (
    <LibraryList
      title="Skills"
      noun="skill"
      columns={COLUMNS}
      search={search}
      total={all.length}
      hrefs={shown.map(href)}
      measure
    >
      {shown.map((s) => (
        <LibraryRow key={s.id} name={s.name} href={href(s)}>
          <NameCell lead={<Icon name="skills" />} name={s.name} after={s.description} />
          <Text tone="2">{usedByText(s.used_by)}</Text>
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

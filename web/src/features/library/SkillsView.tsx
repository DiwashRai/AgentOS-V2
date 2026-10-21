// The library's skills (/library/skills): each skill's name and what it is for, and what uses it
// (how many workflows, and tickets on them or that added it). A row opens the skill's editor.
import { useSkills } from "../../api/queries";
import type { Skill } from "../../api/types";
import { matches } from "../../domain/format";
import type { Column } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { AboutCell, LibraryList, LibraryRow, NameCell, USED, usedCells } from "./list";

const COLUMNS: readonly Column[] = [
  { label: "Skill", width: "xl" },
  { label: "Description", width: "fill", min: "2xl" },
  ...USED,
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
    >
      {shown.map((s) => (
        <LibraryRow key={s.id} name={s.name} href={href(s)}>
          <NameCell glyph="skills" name={s.name} />
          <AboutCell text={s.description} />
          {usedCells(s.used_by)}
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

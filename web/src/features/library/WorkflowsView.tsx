// The library's workflows (/library/workflows), a line each: the workflow's name (the default
// marked; what it is for on hover), then in a column of their own its stages as a strip at the
// stepper's scale (a segment a stage in its phase's hue, a diamond a gate, a bracket a loop, a
// turned-off stage dashed; the longer the workflow, the longer the strip), then its version, its
// last change and how many tickets use it, packed at the right. A row opens the workflow editor.
// The columns fit a 1024px window; the stage strip's words give way first.
import { useWorkflows } from "../../api/queries";
import type { Workflow } from "../../api/types";
import { matches, plural } from "../../domain/format";
import { Chip, type Column, Strip } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { ChangedCell, CountCell, LibraryList, LibraryRow, NameCell, VersionCell } from "./list";

const COLUMNS: readonly Column[] = [
  { label: "Workflow", width: "xl" },
  { label: "Stages", width: "fill", min: "2xl" },
  { label: "Version", width: "xs" },
  { label: "Changed", width: "md" },
  { label: "Tickets", width: "sm", end: true },
];

/** "5 stages · loops up to 3 rounds" (with more loops than one, each one's rounds); a stage turned
 *  off is the strip's dashed segment, named in its tooltip. */
function stagesText(w: Workflow): string {
  const loops = w.loops.map((l) => `loops up to ${plural(l.rounds, "round")}`);
  return [plural(w.stages.length, "stage"), ...loops].join(" · ");
}

function StagesCell({ w }: { w: Workflow }) {
  const at = (id: string) => w.stages.findIndex((s) => s.id === id);
  return (
    <Strip
      label={stagesText(w)}
      stages={w.stages.map((s) => ({
        name: s.name,
        phase: s.phase,
        off: !s.enabled,
        gate: s.gate?.label ?? null,
      }))}
      loops={w.loops.map((l) => ({ first: at(l.first), last: at(l.last), rounds: l.rounds }))}
    />
  );
}

export function WorkflowsView() {
  const all = useWorkflows().data?.items ?? [];
  const { query, search } = useSearch("Search workflows");
  const shown = all.filter((w) =>
    matches([w.name, w.description, ...w.stages.map((s) => s.name)], query),
  );
  const href = (w: Workflow) => `/library/workflows/${w.id}`;
  return (
    <LibraryList
      title="Workflows"
      noun="workflow"
      columns={COLUMNS}
      search={search}
      total={all.length}
      hrefs={shown.map(href)}
    >
      {shown.map((w) => (
        <LibraryRow key={w.id} name={w.name} href={href(w)}>
          <NameCell
            glyph="workflows"
            name={w.name}
            title={`${w.name} · ${w.description}`}
            mark={
              w.is_default ? (
                <Chip label={"Default"} title="New tickets start from it" />
              ) : undefined
            }
          />
          <StagesCell w={w} />
          <VersionCell version={w.version} />
          <ChangedCell by={w.updated_by} at={w.updated_at} />
          <CountCell n={w.tickets.length} />
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

// The library's files (/library/files), AGENTS.md first: each file's path beside its opening line (or
// AGENTS.md's block names), its size, and what uses it (how many workflows, and tickets on them or
// that added it). A row opens the file's editor (AGENTS.md as its named blocks).
import { useFiles } from "../../api/queries";
import type { LibraryFile } from "../../api/types";
import { matches } from "../../domain/format";
import { type Column, Text } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { AboutCell, LibraryList, LibraryRow, NameCell, USED, usedCells } from "./list";
import { sizeText } from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Path", width: "3xl" },
  { label: "Contents", width: "fill", min: "md" },
  { label: "Size", width: "md", end: true },
  ...USED,
];

/** The line under a file's path: AGENTS.md's block names, else its first line of text. */
function underOf(f: LibraryFile): string {
  if (f.body.kind === "blocks") return f.body.blocks.map((b) => b.name).join(" · ");
  const first = f.body.text.split("\n").find((l) => l.trim() !== "") ?? "";
  return first.replace(/^#+\s*/, "");
}

export function FilesView() {
  const all = useFiles().data?.items ?? [];
  const { query, search } = useSearch("Search files");
  const shown = all.filter((f) => matches([f.path], query));
  const href = (f: LibraryFile) => `/library/files/${f.id}`;
  return (
    <LibraryList
      title="Files"
      noun="file"
      columns={COLUMNS}
      search={search}
      total={all.length}
      hrefs={shown.map(href)}
    >
      {shown.map((f) => (
        <LibraryRow key={f.id} name={f.path} href={href(f)}>
          <NameCell glyph="files" name={f.path} />
          <AboutCell text={underOf(f)} />
          <Text tone="2" tabular>
            {sizeText(f.size)}
          </Text>
          {usedCells(f.used_by)}
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

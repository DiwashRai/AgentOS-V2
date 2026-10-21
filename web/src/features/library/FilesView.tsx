// The library's files (/library/files), AGENTS.md first: each file's path, its size, and what uses
// it (its workflows, and the tickets on them or that added it). A row opens the file's editor
// (AGENTS.md as its named blocks).
import { useFiles } from "../../api/queries";
import type { LibraryFile } from "../../api/types";
import { matches } from "../../domain/format";
import { type Column, Icon, Text } from "../../kit";
import { useSearch } from "../shared/useSearch";
import { LibraryList, LibraryRow, NameCell } from "./list";
import { sizeText, usedByText } from "./model";

const COLUMNS: readonly Column[] = [
  { label: "Path", width: "fill", min: "2xl" },
  { label: "Size", width: "md", end: true },
  { label: "Used by", width: "xl", end: true },
];

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
      measure
    >
      {shown.map((f) => (
        <LibraryRow key={f.id} name={f.path} href={href(f)}>
          <NameCell
            lead={<Icon name="files" />}
            name={f.path}
            {...(f.body.kind === "blocks"
              ? { after: `${String(f.body.blocks.length)} blocks` }
              : {})}
          />
          <Text tone="2" tabular>
            {sizeText(f.size)}
          </Text>
          <Text tone="2">{usedByText(f.used_by)}</Text>
        </LibraryRow>
      ))}
    </LibraryList>
  );
}

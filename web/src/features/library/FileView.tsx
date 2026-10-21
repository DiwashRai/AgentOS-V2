// A file's editor (/library/files/:id): its path, and its content or AGENTS.md as its named blocks,
// in the shared item editor; the other files a step or a pick away.
import { useParams } from "react-router";

import { useFile, useFiles } from "../../api/queries";
import { Notice, Page, Text } from "../../kit";
import { ItemEditor } from "./ItemEditor";
import { sizeText } from "./model";

const href = (id: string) => `/library/files/${id}`;

export function FileView() {
  const { id = "" } = useParams();
  const q = useFile(id);
  const all = useFiles().data?.items ?? [];
  const f = q.data;
  if (!f)
    return (
      <Page title={[{ label: "Files", href: "/library/files" }, id]}>
        <Notice kind="status" error={q.isError}>
          {q.isError ? `No file ${id}` : "Loading"}
        </Notice>
      </Page>
    );
  return (
    <ItemEditor
      key={f.id}
      title={[{ label: "Files", href: "/library/files" }, f.path]}
      item={f}
      contentTitle={f.body.kind === "blocks" ? "Blocks, in the order agents read them" : "Content"}
      name={{ label: "Path", value: f.path, mono: true }}
      facts={[{ label: "Size", value: <Text tone="2">{sizeText(f.size)}</Text> }]}
      usedBy={f.used_by}
      siblings={{
        noun: "file",
        items: all.map((x) => ({ id: x.id, label: x.path })),
        current: f.id,
        href,
      }}
    />
  );
}

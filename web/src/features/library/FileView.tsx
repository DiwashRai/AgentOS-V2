// A file's editor (/library/files/:id): its path, and its content or AGENTS.md as its named blocks,
// in the shared item editor; the other files a step or a pick away.
import { useParams } from "react-router";

import { loadOf, useFile, useFiles } from "../../api/queries";
import { Page, Text } from "../../kit";
import { LoadNotice } from "../../patterns/load";
import { ItemEditor } from "../shared/itemEditor/ItemEditor";
import { sizeText } from "../shared/itemEditor/model";

const href = (id: string) => `/library/files/${id}`;

export function FileView() {
  const { id = "" } = useParams();
  const q = loadOf(useFile(id));
  const all = useFiles().data?.items ?? [];
  if (q.kind !== "ready")
    return (
      <Page title={[{ label: "Files", href: "/library/files" }, id]}>
        <LoadNotice load={q} noun="file" id={id} />
      </Page>
    );
  const f = q.data;
  return (
    <ItemEditor
      key={f.id}
      title={[{ label: "Files", href: "/library/files" }, f.path]}
      item={f}
      contentTitle={f.body.kind === "blocks" ? "Blocks, in the order agents read them" : "Content"}
      name={{ label: "Path", value: f.path }}
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

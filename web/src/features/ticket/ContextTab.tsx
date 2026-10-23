// The ticket's Context tab (?tab=context): the items its agents read (R16), in the app's list
// style under a column head: each item's glyph and the name a person knows it by (an agent or a
// skill by its library name, a file by its path), with what it is, its version and its last change
// receding under it (AGENTS.md names its blocks there); its drift from the library, in the words
// and colours the Workflow tab uses; whether agents may write it, a switch that saves at once and is
// the same switch as the editor's; and Edit, which opens the shared item editor full window over
// the ticket (?edit=<name>). A click anywhere on the line opens it too.
import { useNavigate } from "react-router";

import { useItem, useItems, useSetWritable } from "../../api/queries";
import type { Author, ItemSummary, Ticket } from "../../api/types";
import { age, firstName, plural } from "../../domain/format";
import { Button, type Column, Icon, Notice, Row, Stack, Table, Text, Toggle } from "../../kit";
import { useBoard } from "../shared/board";
import { DriftChips } from "./copy";
import { KIND, labelOf } from "./items";
import { ticketHref } from "./tabs";

const COLUMNS: readonly Column[] = [
  { label: "Item", width: "fill", min: "xl" },
  { label: "Library", width: "lg" },
  { label: "Agents write", width: "sm", end: true },
  { label: "", width: "xs", end: true, keep: true },
];

const who = (a: Author) =>
  a.kind === "person" ? firstName(a.person.name) : `run #${String(a.run_id)}`;

/** Under the name: what it is, its version and the library version it was copied from, and who
 *  changed it last and when. */
function about(i: ItemSummary, now: number): string {
  const from = i.origin.kind === "copy" ? `, from library v${String(i.origin.version)}` : "";
  return `${KIND[i.kind].word} · v${String(i.version)}${from} · ${who(i.updated_by)}, ${age(i.updated_at, now)} ago`;
}

/** An item's drift, stacked in its column. */
function ItemDrift({ i }: { i: ItemSummary }) {
  return (
    <Stack gap={2} align="start">
      <DriftChips
        drift={i.origin.kind === "copy" ? i.origin.drift : null}
        of={i.origin.kind === "copy" ? i.origin.of.name : i.name}
      />
    </Stack>
  );
}

function ItemLine({ t, i, now }: { t: Ticket; i: ItemSummary; now: number }) {
  const setWritable = useSetWritable(t.key);
  const navigate = useNavigate();
  const href = ticketHref(t.key, "context", i.name);
  const label = labelOf(i);
  // AGENTS.md names its blocks beside its name (they share its version and switch); its content
  // is needed for them
  const body = useItem(t.key, i.name).data?.body;
  const blocks = body?.kind === "blocks" ? body.blocks.map((b) => b.name) : null;
  const line = about(i, now);
  return (
    <Row
      kind="item"
      action={{
        label: `Edit ${label}`,
        run: () => {
          void navigate(href);
        },
      }}
    >
      <Stack dir="row" gap={5} align="center">
        <Icon name={KIND[i.kind].icon} />
        <Stack gap={1} grow>
          <Text tone="3" truncate title={label}>
            <Text weight={500} tone="1">
              {label}
            </Text>
            {blocks ? `\u2002${plural(blocks.length, "block")}: ${blocks.join(", ")}` : null}
          </Text>
          <Text variant="meta" tone="3" truncate title={line}>
            {line}
          </Text>
        </Stack>
      </Stack>
      <ItemDrift i={i} />
      <Toggle
        label={`Agents can write ${label}`}
        on={i.writable}
        onChange={(on) => {
          setWritable(i.name, on);
        }}
      />
      <Button size="sm" href={href}>
        Edit
      </Button>
    </Row>
  );
}

/** The quiet count under the list: how many, how many have drifted each way, how many agents write. */
function summary(items: readonly ItemSummary[]): string {
  const copies = items.flatMap((i) => (i.origin.kind === "copy" ? [i.origin.drift] : []));
  const behind = copies.filter((d) => d.library !== null).length;
  const changed = copies.filter((d) => d.changed).length;
  return [
    plural(items.length, "item"),
    behind > 0 ? `${String(behind)} behind the library` : null,
    changed > 0 ? `${String(changed)} changed here` : null,
    `${String(items.filter((i) => i.writable).length)} writable by agents`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function ContextTab({ t }: { t: Ticket }) {
  const items = useItems(t.key);
  const { now } = useBoard();
  const list = items.data?.items ?? [];
  if (items.isPending) return <Notice kind="status">Loading the context</Notice>;
  return (
    <Table
      columns={COLUMNS}
      scroll={false}
      foot={
        <Text variant="meta" tone="3">
          {summary(list)}
        </Text>
      }
    >
      {list.map((i) => (
        <ItemLine key={i.name} t={t} i={i} now={now} />
      ))}
    </Table>
  );
}

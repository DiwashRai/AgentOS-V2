// The item editor's main column: the content as a sheet, its head strip over monospace markdown
// filling the column (an agent's instructions, a SKILL.md, a file), or AGENTS.md as its named
// blocks: each a sheet of its own, its head the fold, its name to edit as a heading, its length and
// the pair of Move up and Move down (and its handle, to drag it or step it with ↑ ↓).
import { useState } from "react";

import type { Block, ItemBody } from "../../api/types";
import { plural } from "../../domain/format";
import { Button, Field, Sortable, Stack, Text, TextArea } from "../../kit";
import { firstLine } from "./model";

interface BlockCardProps {
  block: Block;
  /** Its place and how many there are, for Move up and Move down. */
  at: number;
  of: number;
  open: boolean;
  onFold: () => void;
  onChange: (b: Block) => void;
  onMove: (to: number) => void;
}

const lines = (text: string) => plural(text.split("\n").length, "line");

/** Move up and Move down, a pair apart from the rest of the head; an end's one faded. */
function Moves({ name, at, of, onMove }: { name: string; at: number; of: number } & MoveTo) {
  const step = (to: number, blocked: string) =>
    to < 0 || to >= of
      ? { blocked }
      : {
          onClick: () => {
            onMove(to);
          },
        };
  return (
    <Stack dir="row" align="center">
      <Button
        variant="quiet"
        size="xs"
        icon="up"
        title={`Move ${name} up`}
        {...step(at - 1, "Already first")}
      />
      <Button
        variant="quiet"
        size="xs"
        icon="chevron"
        title={`Move ${name} down`}
        {...step(at + 1, "Already last")}
      />
    </Stack>
  );
}

interface MoveTo {
  onMove: (to: number) => void;
}

/** A block's head strip: the fold, its name to edit as a heading (folded, its first line after
 *  it), its length, and the click way to reorder it. */
function BlockHead({ block, at, of, open, onFold, onChange, onMove }: BlockCardProps) {
  const name = block.name || "this block";
  return (
    <Stack dir="row" gap={4} align="center" grow>
      <Button
        variant="quiet"
        size="xs"
        icon={open ? "caret" : "right"}
        title={open ? `Fold ${name}` : `Unfold ${name}`}
        onClick={onFold}
      />
      <Stack grow>
        <Field
          look="heading"
          label="Block name"
          value={block.name}
          placeholder="Block name"
          onChange={(v) => {
            onChange({ ...block, name: v });
          }}
        />
      </Stack>
      {open ? null : (
        <Stack grow>
          <Text variant="code" tone="3" truncate>
            {firstLine(block)}
          </Text>
        </Stack>
      )}
      <Text variant="meta" tone="3" tabular>
        {lines(block.text)}
      </Text>
      <Moves name={name} at={at} of={of} onMove={onMove} />
    </Stack>
  );
}

function BlockCard(props: BlockCardProps) {
  const { block, open, onChange } = props;
  return (
    <TextArea
      head={<BlockHead {...props} />}
      folded={!open}
      label={`${block.name} block`}
      value={block.text}
      lines={2}
      onChange={(text) => {
        onChange({ ...block, text });
      }}
    />
  );
}

/** AGENTS.md's blocks in order, keyed by their place (a name can be edited to anything); a fold
 *  is the editor's own, not the file's. */
function Blocks({
  blocks,
  onChange,
}: {
  blocks: readonly Block[];
  onChange: (blocks: readonly Block[]) => void;
}) {
  // the blocks' own keys, kept through edits and moves, so a fold and a focused field stay put
  const [keys, setKeys] = useState(() => blocks.map((_, i) => `b${String(i)}`));
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  const move = (from: number, to: number) => {
    const next = [...blocks];
    next.splice(to, 0, ...next.splice(from, 1));
    const k = [...keys];
    k.splice(to, 0, ...k.splice(from, 1));
    setKeys(k);
    onChange(next);
  };
  return (
    <Sortable
      label="AGENTS.md blocks"
      gap={5}
      // the handles hang in the document's margin, so a sheet's edge is the property rows' left edge
      gutter={false}
      onMove={move}
      items={blocks.map((b, i) => {
        const key = keys[i] ?? b.name;
        return {
          id: key,
          label: b.name,
          content: (
            <BlockCard
              block={b}
              at={i}
              of={blocks.length}
              open={!folded.has(key)}
              onFold={() => {
                setFolded((f) => {
                  const next = new Set(f);
                  if (!next.delete(key)) next.add(key);
                  return next;
                });
              }}
              onChange={(nb) => {
                onChange(blocks.map((x, k) => (k === i ? nb : x)));
              }}
              onMove={(to) => {
                move(i, to);
              }}
            />
          ),
        };
      })}
    />
  );
}

/** A sheet's head over the whole text: what it is (Instructions, the path) and its length. */
function Head({ title, text }: { title: string; text: string }) {
  return (
    <Stack dir="row" gap={4} align="center" grow>
      <Text variant="label">{title}</Text>
      <Text variant="meta" tone="3" tabular>
        {lines(text)}
      </Text>
    </Stack>
  );
}

/** The content editor for a body: its own words over it say what it is (Instructions, the path). */
export function Content({
  body,
  title,
  onChange,
}: {
  body: ItemBody;
  title: string;
  onChange: (body: ItemBody) => void;
}) {
  switch (body.kind) {
    case "blocks":
      return (
        <Stack gap={5}>
          <Text variant="meta" tone="3">
            {title}
          </Text>
          <Blocks
            blocks={body.blocks}
            onChange={(blocks) => {
              onChange({ kind: "blocks", blocks });
            }}
          />
        </Stack>
      );
    case "text":
      return (
        <TextArea
          head={<Head title={title} text={body.text} />}
          label={title}
          value={body.text}
          fill
          onChange={(text) => {
            onChange({ kind: "text", text });
          }}
        />
      );
    case "agent":
      return (
        <TextArea
          head={<Head title={title} text={body.agent.instructions} />}
          label={title}
          value={body.agent.instructions}
          fill
          onChange={(instructions) => {
            onChange({ kind: "agent", agent: { ...body.agent, instructions } });
          }}
        />
      );
  }
}

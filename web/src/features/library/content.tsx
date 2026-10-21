// The item editor's main column: the content, in monospace markdown filling the column (an agent's
// instructions, a SKILL.md, a file), or AGENTS.md as its named blocks: each with its name in a field
// at its head, a fold to its first line, Move up and Move down beside it (and its handle, to drag it
// or step it with ↑ ↓), edited in place.
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

/** A block's head: the fold, its name to edit, its length, and the click way to reorder it. */
function BlockHead({ block, at, of, open, onFold, onChange, onMove }: BlockCardProps) {
  const name = block.name || "this block";
  return (
    <Stack dir="row" gap={3} align="center">
      <Button
        variant="quiet"
        size="xs"
        icon={open ? "chevron" : "right"}
        title={open ? `Fold ${name}` : `Unfold ${name}`}
        onClick={onFold}
      />
      <Stack grow>
        <Field
          label="Block name"
          value={block.name}
          placeholder="Block name"
          onChange={(v) => {
            onChange({ ...block, name: v });
          }}
        />
      </Stack>
      <Text variant="meta" tone="3" tabular>
        {plural(block.text.split("\n").length, "line")}
      </Text>
      <Button
        variant="quiet"
        size="xs"
        icon="up"
        title={`Move ${name} up`}
        {...(at === 0
          ? { blocked: "Already first" }
          : {
              onClick: () => {
                onMove(at - 1);
              },
            })}
      />
      <Button
        variant="quiet"
        size="xs"
        icon="chevron"
        title={`Move ${name} down`}
        {...(at === of - 1
          ? { blocked: "Already last" }
          : {
              onClick: () => {
                onMove(at + 1);
              },
            })}
      />
    </Stack>
  );
}

function BlockCard(props: BlockCardProps) {
  const { block, open, onChange } = props;
  return (
    <Stack gap={3}>
      <BlockHead {...props} />
      {open ? (
        <TextArea
          label={`${block.name} block`}
          value={block.text}
          lines={2}
          onChange={(text) => {
            onChange({ ...block, text });
          }}
        />
      ) : (
        <Text variant="code" tone="3" truncate>
          {firstLine(block)}
        </Text>
      )}
    </Stack>
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
    // the empty first child and the gap leave the handles their gutter at the list's left
    <Stack dir="row" gap={9}>
      <Stack />
      <Stack grow>
        <Sortable
          label="AGENTS.md blocks"
          gap={6}
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
      </Stack>
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
  const head = (
    <Text variant="meta" weight={500}>
      {title}
    </Text>
  );
  switch (body.kind) {
    case "blocks":
      return (
        <Stack gap={5}>
          {head}
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
        <Stack gap={4} grow>
          {head}
          <TextArea
            label={title}
            value={body.text}
            fill
            onChange={(text) => {
              onChange({ kind: "text", text });
            }}
          />
        </Stack>
      );
    case "agent":
      return (
        <Stack gap={4} grow>
          {head}
          <TextArea
            label={title}
            value={body.agent.instructions}
            fill
            onChange={(instructions) => {
              onChange({ kind: "agent", agent: { ...body.agent, instructions } });
            }}
          />
        </Stack>
      );
  }
}

// Twin of Linear's docs shot "Parent and sub-issues": a Sub-issues head (fold caret, name, progress
// 0/7, Display and Add) over seven placeholder rows, with the Display popover open under its button
// (Ordering and Completed issues pickers, the display properties as toggle pills). The kit has no
// floating panel for arbitrary content, so the open popover is laid out as a column between the
// rows' leading cells and their faces, where Linear's covers the rows.
import {
  Avatar,
  Button,
  Chip,
  FormRow,
  Mark,
  Row,
  Segmented,
  Select,
  Stack,
  Surface,
  Table,
  Text,
} from "../../../kit";

const NONE = () => undefined;

/** A placeholder bar as Linear's skeleton rows draw one: a blank tag `n` spaces long. */
const bar = (n: number) => " ".repeat(n);

/** The rows as Linear shows them: each one's status glyph and its placeholder's length. */
const ROWS: readonly { id: string; glyph: "idle" | "half" | "quarter"; n: number }[] = [
  { id: "a", glyph: "idle", n: 51 },
  { id: "b", glyph: "idle", n: 26 },
  { id: "c", glyph: "half", n: 61 },
  { id: "d", glyph: "quarter", n: 13 },
  { id: "e", glyph: "idle", n: 31 },
  { id: "f", glyph: "idle", n: 41 },
  { id: "g", glyph: "idle", n: 28 },
];

/** The display properties, one line of pills each as Linear wraps them, the shown ones pressed. */
const LINES: readonly { on: string; items: readonly string[] }[] = [
  { on: "Status", items: ["Priority", "SLA", "ID", "Status", "Labels"] },
  { on: "", items: ["Milestone", "Cycle", "Due date"] },
  { on: "", items: ["Estimate", "Links", "Customers"] },
  { on: "Assignee", items: ["Assignee", "Pull requests and commits"] },
  { on: "", items: ["Sentry issues"] },
];

function Glyph({ glyph }: { glyph: (typeof ROWS)[number]["glyph"] }) {
  if (glyph === "idle") return <Mark kind="idle" glyph still name={false} />;
  return (
    <Mark
      kind="run"
      glyph
      still
      name={false}
      progress={glyph === "half" ? { done: 1, total: 2 } : { done: 1, total: 4 }}
    />
  );
}

/** The head's start: the fold, the name, and how far the sub-issues are. */
function Head() {
  return (
    <Stack dir="row" gap={8} align="center">
      <Stack dir="row" align="center">
        <Button variant="quiet" size="sm" icon="caret" title="Fold Sub-issues" onClick={NONE} />
        <Text weight={500} tone="2">
          Sub-issues
        </Text>
      </Stack>
      <Stack dir="row" gap={3} align="center">
        <Mark kind="run" glyph small name={false} progress={{ done: 0, total: 7 }} />
        <Text tone="2" tabular>
          0/7
        </Text>
      </Stack>
    </Stack>
  );
}

/** The rows' leading cells: the status glyph and the placeholder, set in past the head's fold as
 *  Linear's are. */
function Rows() {
  return (
    <Stack dir="row" gap={8}>
      <Stack />
      <Stack grow>
        <Table columns={[{ label: "Sub-issue", width: "fill" }]} head={false} scroll={false}>
          {ROWS.map((r) => (
            <Row key={r.id}>
              <Stack dir="row" gap={4} align="center">
                <Glyph glyph={r.glyph} />
                <Chip tone="fill" label={bar(r.n)} />
              </Stack>
            </Row>
          ))}
        </Table>
      </Stack>
    </Stack>
  );
}

/** The open Display popover: the ordering, the completed issues, the display properties. */
function Display() {
  return (
    <Surface level="sheet" pad={8}>
      <Stack gap={10}>
        <Stack gap={9}>
          <FormRow label="Ordering">
            <Select
              label="Ordering"
              value="priority"
              options={[{ id: "priority", label: "Priority" }]}
              onChange={NONE}
            />
            <Button size="sm" icon="up" title="Sort direction" onClick={NONE} />
          </FormRow>
          <FormRow label="Completed issues">
            <Select
              label="Completed issues"
              value="all"
              options={[{ id: "all", label: "All" }]}
              onChange={NONE}
            />
          </FormRow>
        </Stack>
        <Stack gap={6}>
          <Text tone="3">Display properties</Text>
          <Stack gap={1}>
            {LINES.map((line) => (
              <Segmented
                key={line.items[0]}
                fit
                label="Display properties"
                value={line.on}
                onChange={NONE}
                items={line.items.map((label) => ({ id: label, label }))}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Surface>
  );
}

/** The faces at the rows' ends, one per row on the rows' pitch. */
function Faces() {
  return (
    <Stack gap={8} align="center">
      {ROWS.map((r) => (
        <Stack key={r.id} gap={2}>
          <Avatar size="sm" name={"​"} />
          <Stack />
        </Stack>
      ))}
    </Stack>
  );
}

export function Twin() {
  return (
    <Surface level="list" pad={10}>
      <Surface level="list" pad={10}>
        <Stack dir="row" gap={9}>
          <Stack />
          <Stack gap={6} grow>
            <Stack />
            <Stack dir="row" align="start">
              <Stack gap={7} grow>
                <Head />
                <Rows />
              </Stack>
              <Stack gap={2} align="end">
                <Button variant="quiet" size="sm" icon="compact" title="Display" onClick={NONE} />
                <Display />
              </Stack>
              <Stack gap={9} align="center">
                <Button
                  variant="quiet"
                  size="sm"
                  icon="plus"
                  title="Add sub-issue"
                  onClick={NONE}
                />
                <Faces />
              </Stack>
            </Stack>
          </Stack>
          <Stack />
        </Stack>
      </Surface>
    </Surface>
  );
}

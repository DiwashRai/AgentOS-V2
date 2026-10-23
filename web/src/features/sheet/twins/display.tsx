// Twin of Linear's Display options (docs 08): the view's Display button with its popover open, a
// List/Board choice, Grouping and Ordering, three switches, and the display properties as pills.
// Linear's shot cuts through its window, so this is a whole view in the frame (the camera cuts it
// where Linear's crop starts: the sidebar and the view's title fall outside it). The kit has no
// popover for a panel of settings, so the panel is drawn in place under the bar, in the right
// third of the view (Linear's popover is that wide, flush with the button's end).
import type { ReactNode } from "react";

import { Button, Frame, Icon, Page, Select, Stack, Surface, Text, Toggle } from "../../../kit";

const keep = () => undefined;

/** The display properties in Linear's order, and whether each is shown. */
const PROPERTIES: readonly (readonly [string, boolean])[] = [
  ["Priority", true],
  ["ID", true],
  ["Status", true],
  ["Labels", true],
  ["Project", true],
  ["Cycle", true],
  ["Due date", true],
  ["Created", true],
  ["Updated", true],
  ["Estimate", true],
  ["Links", false],
  ["Assignee", true],
];

/** One setting on a line: its words at the start, its switch at the end. */
function Switch({ label, on }: { label: string; on: boolean }) {
  return (
    <Stack dir="row" justify="between" align="center">
      <Text tone="3">{label}</Text>
      <Toggle label={label} on={on} onChange={keep} />
    </Stack>
  );
}

interface PickerProps {
  label: string;
  icon: "compact" | "sort";
  value: string;
  extra?: ReactNode;
}

/** A picker on a line: its glyph and words at the start, the picker (and its extra) at the end. */
function Picker({ label, icon, value, extra }: PickerProps) {
  return (
    <Stack dir="row" justify="between" align="center">
      <Stack dir="row" gap={4} align="center">
        <Icon name={icon} quiet />
        <Text tone="3">{label}</Text>
      </Stack>
      <Stack dir="row" gap={4} align="center">
        <Select
          label={label}
          value={value}
          options={[{ id: value, label: value }]}
          onChange={keep}
        />
        {extra}
      </Stack>
    </Stack>
  );
}

/** The view's kind, then how it groups and orders, and whether it orders completed by recency. */
function View() {
  return (
    <Stack gap={6}>
      <Stack gap={8}>
        <Stack dir="row" gap={4}>
          <Stack grow>
            <Button icon="compact">List</Button>
          </Stack>
          <Stack grow>
            <Button variant="quiet" icon="teams">
              Board
            </Button>
          </Stack>
        </Stack>
        <Stack gap={3}>
          <Picker label="Grouping" icon="compact" value="Status" />
          <Picker
            label="Ordering"
            icon="sort"
            value="Priority"
            extra={<Button size="sm" icon="order" title="Ordering direction" />}
          />
        </Stack>
      </Stack>
      <Switch label="Order completed by recency" on={false} />
    </Stack>
  );
}

/** The list's own options: empty groups, and which properties its rows show. */
function ListOptions() {
  return (
    <Stack gap={6}>
      <Text tone="1">List options</Text>
      <Stack gap={7}>
        <Switch label="Show empty groups" on={false} />
        <Stack gap={6}>
          <Text tone="3">Display properties</Text>
          <Stack dir="row" gap={2} wrap>
            {PROPERTIES.map(([name, shown]) => (
              <Button key={name} size="sm" variant={shown ? "default" : "quiet"}>
                {name}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

export function Twin() {
  return (
    <Frame space="Northwind" nav={[]} sections={[]} foot={[]} me={null}>
      <Page title="Issues" action={<Button icon="display">Display</Button>}>
        <Stack cols={3}>
          <Stack />
          <Stack />
          <Surface level="float" pad={7} parts label="Display options">
            <View />
            <Switch label="Show sub-issues" on />
            <ListOptions />
          </Surface>
        </Stack>
      </Page>
    </Frame>
  );
}

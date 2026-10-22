// Twin of Linear's new project page (docs: projects) with its team picker open: the project's
// icon, title and summary placeholder, its labelled property rows, the first-update card and the
// description, and the teams chip's "Change teams…" list. Linear shows two pickers at once (lead
// team, teams); the kit opens one at a time, so this shows the larger one, Change teams.
import { useState } from "react";

import {
  Avatar,
  Button,
  Chip,
  type Fact,
  Facts,
  Field,
  Mark,
  type Option,
  Select,
  Stack,
  Surface,
  Text,
} from "../../../kit";

// Linear's teams in its list's order, each face standing in for its icon. Each id is picked so the
// face takes the kit hue nearest the icon's colour (blue as blue, green as teal, gold, which the
// kit lacks, as rose); the detail is the team's key, or Lead.
const TEAMS: readonly Option[] = [
  { id: "DS", label: "Data Solutions", face: true, detail: "Lead" },
  { id: "t-epd", label: "EPD", face: true, detail: "EPD" },
  { id: "mar1", label: "Marketing", face: true, detail: "MAR" },
  { id: "eng3", label: "Engineering Development & Delivery", face: true, detail: "ENG" },
  { id: "prise1", label: "Ent", face: true, detail: "PRISE" },
  { id: "FEA", label: "Feature Requests", face: true, detail: "FEA" },
  { id: "GRO", label: "Growth/Startup", face: true, detail: "GRO" },
  { id: "ope", label: "Operations", face: true, detail: "OPE" },
];

const none = () => undefined;

function Teams() {
  const [team, setTeam] = useState("DS");
  return <Select label="Teams" value={team} options={TEAMS} onChange={setTeam} />;
}

const ROWS: readonly { label: string; items: readonly Fact[] }[] = [
  {
    label: "Properties",
    items: [
      {
        label: "Status",
        value: (
          <>
            <Mark kind="queued" glyph name={false} />
            Backlog
          </>
        ),
      },
      { label: "Priority", icon: "normal", value: "No priority" },
      // Linear's lead-team picker hides the next two chips (only their glyphs' tops show over
      // it); they're its default project row's, Lead and Target date, and they bring the teams
      // chip and its picker near Linear's
      {
        label: "Lead",
        value: (
          <>
            <Avatar size="sm" dashed />
            Lead
          </>
        ),
      },
      { label: "Target date", icon: "clock", value: "Target date" },
      { label: "Teams", picker: <Teams /> },
      {
        label: "More properties",
        picker: <Button variant="quiet" size="sm" icon="more" title="More properties" />,
      },
    ],
  },
  {
    label: "Initiatives",
    // Linear's lead-team picker covers the name after "Stra" (the rest is inferred); with that
    // picker not drawn, ours shows it whole
    items: [{ label: "Initiative", icon: "loop", value: "Forge Communication Strategy" }],
  },
  {
    label: "Labels",
    items: [
      // Linear's label is a bordered pill that brings its own padding, so its edge sits left of
      // the values' glyphs: the picker slot places it so
      { label: "Label", picker: <Chip tone="edge" dot="you" label="Wave 1" /> },
      {
        label: "Add label",
        picker: <Button variant="quiet" size="sm" icon="plus" title="Add label" />,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Resources", icon: "plus", value: <Text tone="3">Add document or link…</Text> },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", icon: "plus", value: <Text tone="3">Add customer request</Text> },
    ],
  },
];

export function Twin() {
  return (
    <Surface level="list" pad={10}>
      <Stack gap={10}>
        <Stack gap={8}>
          <Stack gap={6}>
            <Stack gap={5}>
              <Stack dir="row">
                <Button icon="skills" title="Project icon" />
              </Stack>
              <Stack>
                <Field
                  look="title"
                  label="Project name"
                  value="Forge Launch Playbook"
                  placeholder="Project name"
                  onChange={none}
                />
                <Field
                  look="lead"
                  label="Summary"
                  value=""
                  placeholder="Add a short summary…"
                  onChange={none}
                />
              </Stack>
            </Stack>
            <Stack gap={5}>
              {ROWS.map((r) => (
                <Facts key={r.label} label={r.label} items={r.items} />
              ))}
            </Stack>
          </Stack>
          <Surface level="sheet" pad={7}>
            <Stack align="center">
              <Button variant="quiet" icon="compose">
                Write first project update
              </Button>
            </Stack>
          </Surface>
        </Stack>
        {/* Linear's description sits ~47px under the card; a 46px gap puts ours level with its
            rows, past the gaps' largest step (32), so an empty Stack spaces it */}
        <Stack gap={7}>
          <Stack />
          <Stack gap={8}>
            <Text variant="label" weight={400} tone="3">
              Description
            </Text>
            <Field
              look="lead"
              label="Description"
              value=""
              placeholder="Add description…"
              onChange={none}
            />
          </Stack>
        </Stack>
      </Stack>
    </Surface>
  );
}

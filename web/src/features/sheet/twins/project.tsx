// Linear's project page (12-docs-01-projects): the project's icon, title and description, its
// labelled property rows (Properties, Initiatives, Labels, Resources, Customers), then the Latest
// update card. Drawn as our item editor draws a document (Page's doc look); the camera starts under
// the page's bar, as Linear's reference is cut under its own.
import {
  Avatar,
  Button,
  Chip,
  type ChipDot,
  type ChipTint,
  type Fact,
  Facts,
  Icon,
  type IconName,
  Mark,
  Page,
  Stack,
  Surface,
  Text,
} from "../../../kit";

const MEMBERS = [
  { name: "andreas", seed: "andreas" },
  { name: "nan", seed: "nan" },
  { name: "erin", seed: "erin" },
  { name: "karri", seed: "karri" },
  { name: "tuomas", seed: "tuomas" },
  { name: "cristina", seed: "cristina" },
  { name: "paco", seed: "paco" },
];

const CUSTOMERS = [
  { name: "Campbell's Soup Company", seed: "Campbell's Soup Company" },
  { name: "Amazon", seed: "Amazon" },
  { name: "Alphabet", seed: "Alphabet" },
];

const LABELS: readonly { label: string; dot: ChipDot; group: boolean }[] = [
  { label: "Large", dot: "you", group: true },
  { label: "Improvements", dot: "done", group: true },
  { label: "Now", dot: "done", group: true },
  { label: "Hackathon", dot: "live", group: false },
];

// Linear washes each resource in its kind's hue: the launch plans indigo, the spec teal, the approvals
// and the sign-up list amber, the rest its grey
const RESOURCES: readonly { label: string; lead: IconName; tint: ChipTint; out?: boolean }[] = [
  { label: "Key Features", lead: "feature", tint: "indigo" },
  { label: "PRD/Spec", lead: "files", tint: "teal" },
  { label: "Approval Chain", lead: "gate", tint: "amber" },
  { label: "Private Beta Sign Up List", lead: "compact", tint: "amber" },
  { label: "figma.com", lead: "link", tint: "neutral", out: true },
  { label: "Launch Run of Show", lead: "feature", tint: "indigo" },
  { label: "Launch Run of Show", lead: "feature", tint: "indigo" },
  { label: "Launch Run of Show", lead: "feature", tint: "indigo" },
  { label: "Jobs to Be Done", lead: "files", tint: "neutral" },
  { label: "Marketing Comms", lead: "files", tint: "neutral" },
  { label: "Project spec", lead: "files", tint: "neutral" },
  { label: "Project spec", lead: "files", tint: "neutral" },
];

function Add({ what }: { what: string }) {
  return <Button variant="quiet" size="xs" icon="plus" title={`Add ${what}`} />;
}

const add = (what: string): Fact => ({ label: `Add ${what}`, picker: <Add what={what} /> });

const PROPERTIES: Fact[] = [
  {
    label: "Status",
    value: (
      <>
        <Mark kind="run" glyph still name={false} progress={{ done: 1, total: 4 }} />
        In Progress
      </>
    ),
  },
  { label: "Priority", icon: "high", value: "Urgent" },
  {
    label: "Lead",
    value: (
      <>
        <Avatar name="jack" seed="3" beside />
        jack
      </>
    ),
  },
  { label: "Members", value: <Avatar people={MEMBERS} /> },
  {
    label: "Dates",
    icon: "clock",
    value: (
      <>
        {"Mar '25"}
        <Icon name="arrow" quiet />
        {"Mar '26"}
      </>
    ),
  },
  { label: "Teams", icon: "teams", value: "10 teams" },
  {
    label: "More properties",
    picker: <Button variant="quiet" size="xs" icon="more" title="More properties" />,
  },
];

function Rows() {
  return (
    <Stack gap={5}>
      <Facts label="Properties" items={PROPERTIES} />
      <Facts
        label="Initiatives"
        items={[
          {
            label: "Initiative",
            value: (
              <>
                <Mark kind="done" glyph name={false} />
                Mexico & Spain rollout
              </>
            ),
          },
          add("initiative"),
        ]}
      />
      <Facts
        label="Labels"
        items={[
          {
            label: "Labels",
            picker: (
              <Stack dir="row" gap={2} align="center" wrap>
                {LABELS.map((l) =>
                  l.group ? (
                    <Chip
                      key={l.label}
                      tone="edge"
                      dot={l.dot}
                      label={l.label}
                      after={{ text: "▾" }}
                    />
                  ) : (
                    <Chip key={l.label} tone="edge" dot={l.dot} label={l.label} />
                  ),
                )}
                <Add what="label" />
              </Stack>
            ),
          },
        ]}
      />
      <Facts
        label="Resources"
        items={[
          {
            label: "Resources",
            picker: (
              <Stack dir="row" gap={2} align="center" wrap>
                {RESOURCES.map((r, i) =>
                  r.out ? (
                    <Chip
                      key={i}
                      tone={r.tint}
                      lead={r.lead}
                      label={r.label}
                      after={{ text: "↗" }}
                    />
                  ) : (
                    <Chip key={i} tone={r.tint} lead={r.lead} label={r.label} />
                  ),
                )}
                <Add what="resource" />
              </Stack>
            ),
          },
        ]}
      />
      <Facts
        label="Customers"
        items={[
          {
            label: "Customers",
            value: (
              <>
                <Avatar people={CUSTOMERS} />
                Campbell's Soup Company, Amazon, Alphabet and 7 others
              </>
            ),
          },
          add("customer"),
        ]}
      />
    </Stack>
  );
}

function Update() {
  return (
    <Surface level="sheet" pad={8} label="Latest update">
      <Stack gap={8}>
        <Stack dir="row" gap={3} align="center">
          <Text tone="3">Latest update</Text>
          <Icon name="right" quiet />
        </Stack>
        <Stack dir="row" gap={3} align="center">
          <Mark kind="done" glyph name={false} />
          <Text tone="done">On track</Text>
          <Text tone="3">·</Text>
          <Avatar name="dylan" beside />
          <Text tone="3">dylan</Text>
          <Text tone="3">·</Text>
          <Text tone="3">9d ago</Text>
        </Stack>
        <Stack gap={4}>
          <Text variant="body" as="p">
            The Mexico launch project continues to advance, with a focus on expanding service reach,
            enhancing local partnerships, and rolling out region-specific marketing and driver
            onboarding initiatives.
          </Text>
          <Stack dir="row" gap={8} align="start">
            <Text variant="body" tone="3">
              •
            </Text>
            <Text variant="body" tone="3" as="p">
              Strategic partnership development has progressed with the implementation of a
              partnerships system, including models for regions, partners, promotions, and user
              rewards, along with API endpoints and seed data for local
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Surface>
  );
}

export function Twin() {
  return (
    <Page title="Mexico launch" side={{ look: "doc" }}>
      <Stack gap={8}>
        <Stack gap={9}>
          <Stack gap={7}>
            <Stack dir="row">
              <Button size="sm" icon="feature" title="Project icon" />
            </Stack>
            <Stack gap={1}>
              <Text variant="display" as="h1">
                Mexico launch
              </Text>
              <Text variant="body" as="p">
                Roll out our rideshare service in Mexico with localized features and strategic
                partnerships. This will expand our presence in a high-potential market, drive user
                growth, and increase overall revenue and market share.
              </Text>
            </Stack>
          </Stack>
          <Rows />
        </Stack>
        <Update />
      </Stack>
    </Page>
  );
}

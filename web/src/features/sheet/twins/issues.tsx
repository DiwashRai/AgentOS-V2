// Twin of Linear's issue list (06-docs-07-select-issues): the sidebar beside a team's Active
// issues, its view tabs, the filter, the In Review group with three rows selected.
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  type ChipDot,
  type Column,
  Frame,
  type FrameProps,
  Head,
  Icon,
  Mark,
  Page,
  Row,
  type Segment,
  Segmented,
  Stack,
  Table,
  Text,
} from "../../../kit";

const NAV: FrameProps["nav"] = [
  { to: "/inbox", label: "Inbox", icon: "intake", count: 1 },
  { to: "/my-issues", label: "My issues", icon: "queue" },
];

const SECTIONS: FrameProps["sections"] = [
  {
    title: "Workspace",
    items: [
      { to: "/initiatives", label: "Initiatives", icon: "theme" },
      { to: "/projects", label: "Projects", icon: "skills" },
      { to: "/views", label: "Views", icon: "compact" },
      { to: "/more", label: "More", icon: "more" },
    ],
  },
  {
    title: "Your teams",
    items: [
      { to: "/team/eng", label: "Engineering", icon: "settings" },
      { to: "/team/eng/triage", label: "Triage", icon: "loop", count: 39 },
      { to: "/twins/issues", label: "Issues", icon: "copy" },
    ],
  },
];

// the view tabs; Backlog's dashed circle is the queued glyph, the others have none in the kit
const TABS: readonly Segment[] = [
  { id: "all", label: "All issues" },
  { id: "active", label: "Active" },
  { id: "backlog", label: "Backlog", mark: "queued" },
  { id: "recent", label: "Recent" },
];

const COLUMNS: readonly Column[] = [
  { label: "Selected", width: "face" },
  { label: "Ref", width: "sm" },
  { label: "Issue", width: "fill", min: "2xl" },
  // as Linear's: each row's project hugs the row's end, so a row without one keeps the title's room
  { label: "Project", width: "lg", hug: true },
];

interface Issue {
  key: string;
  title: string;
  selected: boolean;
  project?: { label: string; dot: ChipDot };
}

const ISSUES: readonly Issue[] = [
  { key: "ENG-139", title: "Identify Missing Data Points", selected: true },
  { key: "ENG-416", title: "Dropdown menu overlaps with submit button", selected: true },
  { key: "ENG-742", title: "Applications", selected: true },
  {
    key: "ENG-811",
    title: "State Management for Selected Currency",
    selected: false,
    project: { label: "Currency S", dot: "done" },
  },
  {
    key: "ENG-810",
    title: "Localized Currency Formatting",
    selected: false,
    project: { label: "Currency S", dot: "done" },
  },
  {
    key: "ENG-786",
    title: "Integrate internationalization (i18n) supp…",
    selected: false,
    project: { label: "Frontend", dot: "blocked" },
  },
];

/** Linear's In Review glyph, a green ring round a three-quarter pie: the kit's nearest is done's
 *  green disc (its pie forms are orange or grey). */
const IN_REVIEW = <Mark kind="done" glyph name={false} />;

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <Row open={issue.selected}>
      {issue.selected ? <Checkbox label="" checked onChange={() => undefined} /> : <Stack />}
      <Stack dir="row" gap={4} align="center">
        {/* Linear's medium priority (two bars of three lit) has no glyph: high is the nearest */}
        <Icon name={issue.selected ? "high" : "normal"} />
        <Badge kind="key">{issue.key}</Badge>
      </Stack>
      <Stack dir="row" gap={4} align="center">
        {IN_REVIEW}
        <Text weight={500} tone="1" truncate>
          {issue.title}
        </Text>
      </Stack>
      {issue.project ? <Chip label={issue.project.label} dot={issue.project.dot} /> : <Stack />}
    </Row>
  );
}

export function Twin() {
  return (
    <Frame space="Vast.craft" nav={NAV} sections={SECTIONS} foot={[]} me={null}>
      <Page
        title="Engineering"
        middle={<Segmented label="View" items={TABS} value="active" onChange={() => undefined} />}
      >
        {/* the filter's glyph over the list's first column, as Linear's */}
        <Stack dir="row" gap={6} align="center">
          <Stack />
          <Button variant="quiet" size="sm" icon="compact">
            Filter
          </Button>
        </Stack>
        <Table columns={COLUMNS} head={false} edge>
          <Head name="In Review" count={12} icon={IN_REVIEW} />
          {ISSUES.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
        </Table>
      </Page>
    </Frame>
  );
}

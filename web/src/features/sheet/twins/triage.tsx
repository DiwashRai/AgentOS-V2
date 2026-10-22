// Twin of Linear's Triage inbox (08-docs-09-triage): the view's head (its title, the star, who is
// on triage, the filter and the display options), then the inbox's two-line rows: the title and
// its key, under them where it came from (a face and a name) and its age. Drawn as our views are:
// a Page in the Frame's main column (its sidebar lies off the camera's crop), the rows an edge
// Table of roomy items. Linear's fifth row ("Assets are blurry") fades out under its marketing
// page; the crop stops above it, so it isn't drawn.
import {
  Age,
  Avatar,
  Badge,
  Button,
  type Column,
  Frame,
  Icon,
  Page,
  Row,
  Stack,
  Table,
  Text,
} from "../../../kit";

interface Issue {
  title: string;
  key: string;
  /** Where it came from: an integration or a person (its face a small neutral disc, as Linear's
   *  grey photos and logos are). */
  from: string;
  age: string;
}

const ISSUES: readonly Issue[] = [
  { title: "Notifications are not appearing", key: "ENG-619", from: "Intercom", age: "6m ago" },
  {
    title: "Website mobile menu needs improvements",
    key: "ENG-617",
    from: "cristina",
    age: "6m ago",
  },
  {
    title: "UnknownError: Cannot inject key into script ...",
    key: "ENG-615",
    from: "Sentry",
    age: "3h ago",
  },
  { title: "Can’t access settings screen", key: "ENG-610", from: "sarah", age: "2d ago" },
];

const COLUMNS: readonly Column[] = [{ label: "Issue", width: "fill" }];

/** A roomy item, as a ticket's context lists them: its title in the row's weight over a quiet line
 *  (here who it came from, a small face beside the name, as a run says who started it). */
function IssueRow({ issue }: { issue: Issue }) {
  return (
    <Row kind="item">
      <Stack gap={4} grow>
        <Stack dir="row" gap={6} align="baseline" justify="between">
          <Text weight={500} tone="1" truncate title={issue.title}>
            {issue.title}
          </Text>
          <Badge kind="key">{issue.key}</Badge>
        </Stack>
        <Stack dir="row" gap={6} align="center" justify="between">
          <Stack dir="row" gap={3} align="center">
            <Avatar size="sm" name={issue.from} beside />
            <Text tone="3" truncate>
              {issue.from}
            </Text>
          </Stack>
          <Text tone="3" tabular>
            <Age text={issue.age} />
          </Text>
        </Stack>
      </Stack>
    </Row>
  );
}

export function Twin() {
  return (
    <Frame space="Engineering" nav={[]} sections={[]} foot={[]} me={null}>
      <Page
        title="Triage"
        middle={<Button variant="quiet" size="xs" icon="gate" title="Favorite" />}
        action={
          <>
            <Avatar name="Ada Park" seed="1" />
            <Button size="sm" icon="compact" title="Filter" />
            <Button size="sm" icon="compact">
              <Text tone="3">
                <Icon name="chevron" label="Display options" />
              </Text>
            </Button>
          </>
        }
      >
        <Table columns={COLUMNS} head={false} edge scroll={false}>
          {ISSUES.map((issue) => (
            <IssueRow key={issue.key} issue={issue} />
          ))}
        </Table>
      </Page>
    </Frame>
  );
}

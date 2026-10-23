// The twin of Linear's home (05-home-f0): the sidebar, an issue (its bar, its title and
// description, its Activity with two comment threads) and the agent's chat beside it.
import { type ReactNode, useState } from "react";

import {
  Avatar,
  Button,
  Chip,
  Composer,
  Frame,
  Icon,
  Mark,
  Page,
  Row,
  Section,
  Stack,
  Surface,
  Text,
  Thread,
} from "../../../kit";

const HERE = "/twins/home";

/** A strong word in an activity line: the actor, the source, a label. */
function B({ children }: { children: string }) {
  return (
    <Text tone="2" weight={500}>
      {children}
    </Text>
  );
}

/** An event of the issue's activity: its face or glyph, then what happened, quiet. */
function Event({ face, children }: { face: ReactNode; children: ReactNode }) {
  return (
    <Stack dir="row" gap={4} align="center">
      {face}
      <Text tone="3">{children}</Text>
    </Stack>
  );
}

function Issue() {
  return (
    <Stack gap={9}>
      {/* Linear's issue opens a step lower under its bar */}
      <Stack />
      <Stack gap={5}>
        <Text variant="display" as="h1">
          Faster app launch
        </Text>
        <Text variant="body" as="p">
          Render UI before{" "}
          <Text variant="code" tone="1">
            vehicle_state
          </Text>{" "}
          sync when minimum required state is present, instead of blocking on full refresh during
          iOS startup.
        </Text>
      </Stack>
      <Section title="Activity">
        <Stack gap={9}>
          <Stack gap={8}>
            <Event face={<Avatar size="sm" name="Karri" beside />}>
              <B>Linear</B> created the issue via <B>Slack</B> on behalf of <B>Karri</B> · 2min ago
            </Event>
            <Event face={<Icon name="intake" quiet />}>
              <B>Triage Intelligence</B> added the labels <B>Performance</B> and <B>iOS</B> · 2min
              ago
            </Event>
          </Stack>
          <Surface level="sheet" pad={7}>
            <Thread
              messages={[
                {
                  id: 1,
                  name: "karri",
                  seed: "karri",
                  at: "4 min ago",
                  full: "4 min ago",
                  body: "Right now we show a spinner forever, which makes it look like the car disappeared...",
                  mine: false,
                },
                {
                  id: 2,
                  name: "jori",
                  seed: "jori",
                  at: "just now",
                  full: "just now",
                  body: "@Linear can you take a stab at this?",
                  mine: false,
                },
              ]}
            />
          </Surface>
          <Surface level="sheet">
            <Surface level="list">
              <Row kind="item">
                <Event face={<Avatar size="sm" name="Linear" beside />}>
                  <Text variant="label">Linear</Text> connected by <B>Jori</B> · 2 min ago
                </Event>
              </Row>
              <Row kind="item">
                <Event face={<Icon name="grip" quiet />}>
                  <B>Changed 2 files</B> Draft PR awaiting your review · 2 min ago
                </Event>
              </Row>
            </Surface>
          </Surface>
          <Event face={<Mark kind="run" glyph name={false} still />}>
            <B>Linear</B> moved from <B>Todo</B> to <B>In Progress</B> · just now
          </Event>
        </Stack>
      </Section>
    </Stack>
  );
}

/** The agent's chat: its head, your ask, what it did, the change it made, and the reply box. */
function Chat() {
  const [draft, setDraft] = useState("");
  return (
    <Stack gap={9} grow>
      <Stack dir="row" gap={3} justify="end">
        <Button size="sm" icon="link" title="Copy link" />
        <Button size="sm" icon="copy" title="Copy ID" />
        <Button size="sm" icon="workflow" title="Copy branch name" />
        <Button size="sm" icon="arrow" title="Start work" />
        <Button size="sm" icon="chevron" title="More ways to start" />
      </Stack>
      <Stack gap={4}>
        <Text tone="3">Reviews</Text>
        <Stack dir="row" gap={3} align="center">
          <Icon name="workflow" />
          <Text tone="1">Revert</Text>
        </Stack>
      </Stack>
      <Surface level="sheet" pad={8} fill>
        <Stack gap={9} grow>
          <Stack dir="row" gap={4} align="center">
            <Avatar size="sm" name="Linear" beside />
            <Text variant="label">Linear</Text>
            <Chip tone="pill" label="Opus 5.5" />
            <Stack grow />
            <Button variant="quiet" size="sm" icon="minus" title="Minimize" />
            <Button variant="quiet" size="sm" icon="expand" title="Expand" />
            <Button variant="quiet" size="sm" icon="close" title="Close" />
          </Stack>
          <Stack gap={7}>
            <Stack gap={4} align="end">
              <Surface level="sheet" pad={6}>
                <Text variant="label" weight={400}>
                  Fix the dimmed ride rows that never reset and open a PR
                </Text>
              </Surface>
              <Stack dir="row" gap={3} align="center">
                <Icon name="theme" quiet />
                <Text tone="2" weight={500}>
                  DRV-364
                </Text>
                <Text tone="3">added to context</Text>
              </Stack>
            </Stack>
            <Stack gap={4}>
              <Stack dir="row" gap={2} align="center">
                <Text tone="3">Worked for 10 sec</Text>
                <Icon name="right" quiet />
              </Stack>
              <Text variant="label" weight={400}>
                Pushed and opened a draft PR. Removed dimmedIds — isItemDimmed now checks
                waitingStatusById directly.
              </Text>
            </Stack>
            <Surface level="sheet" pad={6}>
              <Stack gap={3}>
                <Stack dir="row" gap={3} align="center">
                  <Text tone="1" weight={600}>
                    Changed
                  </Text>
                  <Text tone="1" weight={500}>
                    2 files
                  </Text>
                  <Text tone="done">+22</Text>
                  <Text tone="blocked">−10</Text>
                  <Stack grow />
                  <Button size="sm" icon="search">
                    Preview
                  </Button>
                </Stack>
                <Stack dir="row" gap={3} align="center">
                  <Icon name="workflow" quiet />
                  <Text tone="1" weight={600}>
                    Draft
                  </Text>
                  <Text tone="1" weight={500}>
                    Reset dimmed ride rows
                  </Text>
                </Stack>
                <Text variant="code">master ← ride/drv-364-reset-dimmed-rows</Text>
              </Stack>
            </Surface>
          </Stack>
          <Composer label="Reply..." value={draft} onChange={setDraft} onSend={() => undefined} />
        </Stack>
        <Stack dir="row" gap={2} align="center">
          <Button variant="quiet" size="sm" icon="skills">
            Skills
          </Button>
          <Icon name="chevron" quiet />
          <Stack grow />
          <Button variant="quiet" size="sm" icon="queue" title="Capture" />
          <Button variant="quiet" size="sm" icon="link" title="Attach" />
        </Stack>
      </Surface>
    </Stack>
  );
}

export function Twin() {
  return (
    <Frame
      space="Linear"
      nav={[
        { to: "/pulse", label: "Pulse", icon: "feature" },
        { to: "/inbox", label: "Inbox", icon: "intake" },
        { to: "/my-issues", label: "My issues", icon: "queue" },
        { to: "/reviews", label: "Reviews", icon: "workflow" },
      ]}
      sections={[
        {
          title: "Workspace",
          items: [
            { to: "/initiatives", label: "Initiatives", icon: "loop" },
            { to: "/projects", label: "Projects", icon: "skills" },
            { to: "/more", label: "More", icon: "more" },
          ],
        },
        {
          title: "Favorites",
          items: [
            { to: HERE, label: "Faster app launch", icon: "theme" },
            { to: "/agent-tasks", label: "Agent tasks", icon: "compose" },
            { to: "/agent-insights", label: "Agent Insights", icon: "high" },
            { to: "/ui-refresh", label: "UI Refresh", icon: "close" },
          ],
        },
      ]}
      foot={[]}
      me={null}
    >
      <Page
        title={[{ label: "DRV-8852", href: HERE }, "Faster app launch"]}
        middle={
          <Stack dir="row" gap={2} align="center">
            <Button variant="quiet" size="sm" icon="gate" title="Favorite" />
            <Button variant="quiet" size="sm" icon="more" title="More" />
          </Stack>
        }
        action={
          <Stack dir="row" gap={2} align="center">
            <Text tone="3" tabular>
              <Text tone="2">1</Text> / 84
            </Text>
            <Button variant="quiet" size="sm" icon="up" title="Previous issue" />
            <Button variant="quiet" size="sm" icon="chevron" title="Next issue" />
          </Stack>
        }
        side={{ content: <Chat /> }}
      >
        <Issue />
      </Page>
    </Frame>
  );
}

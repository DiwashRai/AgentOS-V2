// Talk, the same on the ticket page and in the peek: its name and who is in it on one line, what it
// is for under them, then the conversation.
import type { ReactNode } from "react";

import type { Person } from "../../api/types";
import { Avatar, Section } from "../../kit";

export function TalkSection({
  people,
  children,
}: {
  people: readonly Person[];
  children: ReactNode;
}) {
  return (
    <Section
      title="Talk"
      note="Just people here. Agents don't read this."
      end={
        <Avatar size="talk" people={people.map((p) => ({ name: p.name, seed: String(p.id) }))} />
      }
    >
      {children}
    </Section>
  );
}

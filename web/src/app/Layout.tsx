// The signed-in shell: the frame around every view. W0 has no sign-in; the session is a fixture.
// Each view's count in the sidebar is the number the view itself leads with: My queue's "your
// move", All teams' "need you", Compact's "Everything" and Intake's "to take in".
// A ticket page sits under My queue, its home view, so My queue stays marked there.
import { Outlet } from "react-router";

import { useIntake } from "../api/queries";
import { groupOf } from "../domain/board";
import { toTakeIn } from "../features/intake/model";
import { Peek } from "../features/peek/Peek";
import { zones } from "../features/queue/model";
import { useBoard, useSpace } from "../features/shared/board";
import { Frame, type FrameProps, type NavItem } from "../kit";

// Agents, Skills and Settings have no screens yet: they are entries only, with nowhere to lead.
const SECTIONS: FrameProps["sections"] = [
  {
    title: "Context",
    items: [
      { label: "Agents", icon: "agents" },
      { label: "Skills", icon: "skills" },
    ],
  },
];
const FOOT: FrameProps["foot"] = [{ label: "Settings", icon: "settings" }];

export function Layout() {
  const { rows, me, now } = useBoard();
  const intake = useIntake().data;
  const space = useSpace();
  const nav: readonly NavItem[] = [
    {
      to: "/teams",
      label: "All teams",
      icon: "teams",
      count: rows.filter((t) => groupOf(t, me) === "needs_you").length,
    },
    {
      to: "/",
      label: "My queue",
      icon: "queue",
      count: zones(rows, me, now).yourMove.length,
      under: ["/t/"],
    },
    { to: "/compact", label: "Compact", icon: "compact", count: rows.length },
    { to: "/intake", label: "Intake", icon: "intake", count: intake ? toTakeIn(intake) : 0 },
  ];
  return (
    <Frame
      space={space}
      nav={nav}
      sections={SECTIONS}
      foot={FOOT}
      me={me ? { name: me.name, seed: String(me.id) } : null}
    >
      <Outlet />
      <Peek />
    </Frame>
  );
}

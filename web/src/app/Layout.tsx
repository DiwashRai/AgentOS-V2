// The signed-in shell: the frame around every view. W0 has no sign-in; the session is a fixture.
import { Outlet } from "react-router";

import { useSession } from "../api/queries";
import { Peek } from "../features/peek/Peek";
import { Frame, type NavItem } from "../kit";

const NAV: readonly NavItem[] = [
  { to: "/teams", label: "All teams", icon: "teams" },
  { to: "/", label: "My queue", icon: "queue" },
  { to: "/compact", label: "Compact", icon: "compact" },
  { to: "/intake", label: "Intake", icon: "intake" },
];
const FOOT: readonly NavItem[] = [{ to: "/settings", label: "Settings", icon: "settings" }];

export function Layout() {
  const me = useSession().data?.me ?? null;
  return (
    <Frame nav={NAV} foot={FOOT} me={me ? { name: me.name, seed: String(me.id) } : null}>
      <Outlet />
      <Peek />
    </Frame>
  );
}

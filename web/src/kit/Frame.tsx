// The app's frame: the dark brand rail (logo, views, theme, settings, you) and the main column.
// Labels are native titles plus aria-label; nothing opens on hover.
import { type ReactNode, useState } from "react";
import { NavLink } from "react-router";

import { Avatar } from "./Avatar";
import s from "./Frame.module.css";
import { Icon, type IconName } from "./Icon";
import { Menu } from "./Menu";
import { applyTheme, currentTheme, THEMES, type ThemeId } from "./theme";

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** A dot: something here needs you. */
  badge?: boolean;
}

export interface FrameProps {
  /** The views, top of the rail. */
  nav: readonly NavItem[];
  /** Under the theme menu (Settings). */
  foot: readonly NavItem[];
  me: { name: string; seed: string } | null;
  children: ReactNode;
}

function RailLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={s.link}
      aria-label={item.label}
      title={item.label}
    >
      <Icon name={item.icon} />
      {item.badge ? <span className={s.badge} /> : null}
    </NavLink>
  );
}

/** Each theme's swatches carry that theme, so they read its tokens. */
function Swatches({ theme }: { theme: ThemeId }) {
  return (
    <span className={s.swatches} data-theme={theme} aria-hidden="true">
      <i className={s.swPage} />
      <i className={s.swInk} />
      <i className={s.swAccent} />
      <i className={s.swYou} />
    </span>
  );
}

const THEME_ITEMS = THEMES.map((t) => ({
  id: t.id,
  label: t.name,
  detail: t.mode,
  aside: <Swatches theme={t.id} />,
}));

export function Frame({ nav, foot, me, children }: FrameProps) {
  const [theme, setTheme] = useState<ThemeId>(currentTheme);
  return (
    <div className={s.app}>
      <nav className={s.rail} aria-label="Views">
        <span className={s.logo} aria-hidden="true">
          <i />
        </span>
        {nav.map((item) => (
          <RailLink key={item.to} item={item} />
        ))}
        <span className={s.spacer} />
        <Menu
          label="Theme"
          icon="theme"
          items={THEME_ITEMS}
          value={theme}
          onChange={(id) => {
            const next: ThemeId = id === "dark" ? "dark" : "light";
            applyTheme(next);
            setTheme(next);
          }}
        />
        {foot.map((item) => (
          <RailLink key={item.to} item={item} />
        ))}
        {me ? <Avatar name={me.name} seed={me.seed} size="lg" /> : null}
      </nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}

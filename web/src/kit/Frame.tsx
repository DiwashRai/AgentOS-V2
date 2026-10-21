// The app's frame: the labelled sidebar in three groups under its head (the Space's switcher, which
// opens on who is signed in, then search and new ticket at the row's end, as Linear's): the views,
// the headed sections, and Settings with the theme menu (a row naming the current theme) at the
// foot; and the main column, an inset sheet beside it.
import { Popover } from "@base-ui/react/popover";
import { type ReactNode, useState } from "react";
import { Link, matchPath, useLocation } from "react-router";

import { Avatar } from "./Avatar";
import s from "./Frame.module.css";
import { Icon, type IconName } from "./Icon";
import p from "./Popover.module.css";
import { Select } from "./Select";
import { applyTheme, currentTheme, THEMES, themeOf, type ThemeId } from "./theme";
import { cx, tokenPx } from "./vars";

/** A view: it leads to its screen. */
export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** The number the view leads with, drawn at the item's end; none or 0 draws nothing. */
  count?: number;
  /** Pages under this view, by path prefix, that keep it marked (a ticket under My queue). */
  under?: readonly string[];
}

/** An entry with no screen behind it yet: drawn in the views' ink, it leads nowhere and takes no
 *  hover; its tooltip says so. */
export interface NavStub {
  label: string;
  icon: IconName;
}

export type NavEntry = NavItem | NavStub;

export interface NavSection {
  title: string;
  items: readonly NavEntry[];
}

export interface FrameProps {
  /** The Space's name, at the head of the sidebar. */
  space: string;
  /** The views, under the head. */
  nav: readonly NavItem[];
  /** Headed groups under the views; each folds away under its heading. */
  sections: readonly NavSection[];
  /** Over the theme row at the foot (Settings). */
  foot: readonly NavEntry[];
  me: { name: string; seed: string } | null;
  children: ReactNode;
}

const STUB_NOTE = "Not in this version yet";

function SideLink({ item, path }: { item: NavEntry; path: string }) {
  if (!("to" in item))
    return (
      <span className={cx(s.item, s.stub)} title={`${item.label}: ${STUB_NOTE}`}>
        <Icon name={item.icon} />
        <span className={s.label}>{item.label}</span>
      </span>
    );
  const n = item.count ?? 0;
  const here =
    matchPath({ path: item.to, end: item.to === "/" }, path) !== null ||
    (item.under ?? []).some((p) => path.startsWith(p));
  return (
    <Link to={item.to} className={s.item} aria-current={here ? "page" : undefined}>
      <Icon name={item.icon} />
      <span className={s.label}>{item.label}</span>
      {n > 0 ? <span className={s.count}>{n}</span> : null}
    </Link>
  );
}

/** The Space's switcher (its tile, its name and a chevron) and the signed-in person's face beside
 *  it: two triggers of the head's one menu. W0 has one Space and no sign-in, so it opens on who is
 *  signed in and nothing to switch to. */
function Workspace({ space, me }: { space: string; me: FrameProps["me"] }) {
  return (
    <Popover.Root>
      <Popover.Trigger className={s.switcher}>
        <span className={s.space} aria-hidden="true">
          {space.slice(0, 1)}
        </span>
        <span className={s.spaceName}>{space}</span>
        <Icon name="chevron" />
      </Popover.Trigger>
      {me ? (
        <Popover.Trigger className={s.me} aria-label={`${me.name}, signed in`}>
          <Avatar name={me.name} seed={me.seed} size="talk" />
        </Popover.Trigger>
      ) : null}
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={() => tokenPx("--sp-2")}>
          <Popover.Popup className={cx(p.sheet, s.account)} aria-label={space}>
            <span className={p.head}>{space}</span>
            {me ? (
              <span className={s.who}>
                <Avatar name={me.name} seed={me.seed} size="lg" />
                <span className={s.whoText}>
                  <span className={s.whoName}>{me.name}</span>
                  <span className={s.whoNote}>Signed in</span>
                </span>
              </span>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** The head's search: it takes you to the view's own search field (as "/" does). */
function focusSearch() {
  document.querySelector<HTMLInputElement>('main input[type="search"]')?.focus();
}

function Section({ sec, path }: { sec: NavSection; path: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={s.list} role="group" aria-label={sec.title}>
      <button
        type="button"
        className={s.title}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {sec.title}
        <Icon name="caret" />
      </button>
      {open ? sec.items.map((item) => <SideLink key={item.label} item={item} path={path} />) : null}
    </div>
  );
}

/** Each theme's swatch is a miniature of the frame (the sidebar's ground, the page, a panel with a
 *  line of ink and one of your move) and carries that theme, so it reads its tokens. */
function Swatches({ theme }: { theme: ThemeId }) {
  return (
    <span className={s.swatches} data-theme={theme} aria-hidden="true">
      <i className={s.swPage}>
        <i className={s.swPanel}>
          <i className={s.swInk} />
          <i className={s.swYou} />
        </i>
      </i>
    </span>
  );
}

const THEME_ITEMS = THEMES.map((t) => ({
  id: t.id,
  label: t.name,
  detail: t.mode,
  aside: <Swatches theme={t.id} />,
}));

export function Frame({ space, nav, sections, foot, me, children }: FrameProps) {
  const [theme, setTheme] = useState<ThemeId>(currentTheme);
  const path = useLocation().pathname;
  return (
    <div className={s.app}>
      <nav className={s.side} aria-label="Views">
        <div className={s.head}>
          <Workspace space={space} me={me} />
          {/* search and new ticket, Linear's two icon buttons at the head's end; new ticket is the
              page's own button again, and like it arrives with W4 */}
          <button
            type="button"
            className={s.tool}
            aria-label="Search"
            title="Search  /"
            onClick={focusSearch}
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            className={cx(s.tool, s.create)}
            aria-label="New ticket"
            title={`New ticket: ${STUB_NOTE}`}
          >
            <Icon name="compose" />
          </button>
        </div>
        <div className={s.list}>
          {nav.map((item) => (
            <SideLink key={item.to} item={item} path={path} />
          ))}
        </div>
        {sections.map((sec) => (
          <Section key={sec.title} sec={sec} path={path} />
        ))}
        <span className={s.spacer} />
        <div className={s.list}>
          {foot.map((item) => (
            <SideLink key={item.label} item={item} path={path} />
          ))}
          {/* the theme picker is a sidebar row: its glyph, "Theme", the current theme's name and the
              chevron */}
          <Select
            look="side"
            label="Theme"
            icon="theme"
            options={THEME_ITEMS}
            value={theme}
            onChange={(id) => {
              const next = themeOf(id);
              applyTheme(next);
              setTheme(next);
            }}
          />
        </div>
      </nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}

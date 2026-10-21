// A menu of actions behind a "…" button, as Linear's: the button in the row of buttons it sits in,
// and on a click the kit's one popover under it, each action a row (a link out ends on its arrow),
// "|" a rule between groups. Base UI's menu does the keyboard (arrows, typeahead, Esc), the focus
// and the placement; the look is the kit's.
import { Menu as Base } from "@base-ui/react/menu";

import b from "./Button.module.css";
import { Icon } from "./Icon";
import { useLayer } from "./layer";
import s from "./Menu.module.css";
import p from "./Popover.module.css";
import { Tip } from "./tip";
import { cx, tokenPx } from "./vars";

/** One action: something to run, or a link (a path in the app, or a URL opened in a new tab). */
export type MenuItem = { label: string } & (
  { run: () => void; href?: never } | { href: string; run?: never }
);

export interface MenuProps {
  /** The button's name and tooltip ("More actions on NW-17"), and the menu's. */
  label: string;
  /** The actions, in order; "|" rules off a group. */
  items: readonly (MenuItem | "|")[];
  /** The size of the buttons it sits beside. */
  size?: "sm" | "md";
}

function Row({ item }: { item: MenuItem }) {
  if (item.run) {
    return (
      <Base.Item className={p.row} onClick={item.run}>
        {item.label}
      </Base.Item>
    );
  }
  const out = !item.href.startsWith("/");
  return (
    <Base.LinkItem
      className={p.row}
      href={item.href}
      {...(out ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {item.label}
      {out ? (
        <span className={s.out}>
          <Icon name="out" />
        </span>
      ) : null}
    </Base.LinkItem>
  );
}

export function Menu({ label, items, size = "md" }: MenuProps) {
  const layer = useLayer();
  return (
    <Base.Root>
      <Tip text={label} said>
        <Base.Trigger className={cx(b.btn, b[size], b.square, s.trigger)} aria-label={label}>
          <span className={b.glyph}>
            <Icon name="more" />
          </span>
        </Base.Trigger>
      </Tip>
      <Base.Portal {...layer}>
        <Base.Positioner className={p.layer} align="end" sideOffset={() => tokenPx("--sp-2")}>
          <Base.Popup className={cx(p.sheet, s.sheet)} aria-label={label}>
            {items.map((it, i) =>
              it === "|" ? (
                <Base.Separator key={`rule${String(i)}`} className={s.rule} />
              ) : (
                <Row key={it.label} item={it} />
              ),
            )}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

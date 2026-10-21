// A menu of actions behind a "…" button, as Linear's: the button in the row of buttons it sits in,
// and on a click the kit's one popover under it, each action a row (a link out ends on its arrow),
// a rule between groups. Base UI's menu does the keyboard (arrows, typeahead, Esc), the focus and
// the placement; the look is the kit's.
import { Menu as Base } from "@base-ui/react/menu";
import { useState } from "react";
import { Link } from "react-router";

import { inApp } from "./Button";
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
  /** The button's name and tooltip ("More on NW-17"), and the menu's. */
  label: string;
  /** The actions in groups (none empty), a rule between each group and the next. */
  groups: readonly (readonly [MenuItem, ...MenuItem[]])[];
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
  if (inApp(item.href)) {
    return (
      <Base.LinkItem className={p.row} closeOnClick render={<Link to={item.href} />}>
        {item.label}
      </Base.LinkItem>
    );
  }
  return (
    <Base.LinkItem
      className={p.row}
      closeOnClick
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {item.label}
      <span className={s.out}>
        <Icon name="out" />
      </span>
    </Base.LinkItem>
  );
}

export function Menu({ label, groups, size = "md" }: MenuProps) {
  const layer = useLayer();
  // focus given back as the menu closes doesn't bring its tooltip back (Linear's), until the
  // button is left and come back to
  const [rest, setRest] = useState(false);
  return (
    <Base.Root
      onOpenChange={(open) => {
        setRest(!open);
      }}
    >
      <Tip text={label} said>
        <Base.Trigger
          className={cx(b.btn, b[size], b.square, s.trigger)}
          aria-label={label}
          data-tip-rest={rest || undefined}
          onBlur={() => {
            setRest(false);
          }}
          onPointerLeave={() => {
            setRest(false);
          }}
        >
          <span className={b.glyph}>
            <Icon name="more" />
          </span>
        </Base.Trigger>
      </Tip>
      <Base.Portal {...layer}>
        <Base.Positioner className={p.layer} align="end" sideOffset={() => tokenPx("--sp-2")}>
          <Base.Popup className={p.sheet} aria-label={label}>
            {groups.map((group, g) => (
              <Base.Group key={g}>
                {g > 0 ? <Base.Separator className={s.rule} /> : null}
                {group.map((it, i) => (
                  <Row key={i} item={it} />
                ))}
              </Base.Group>
            ))}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

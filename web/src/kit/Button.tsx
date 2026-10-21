import { type ReactNode, useId } from "react";
import { Link } from "react-router";

import s from "./Button.module.css";
import { Icon, type IconName } from "./Icon";
import { cx } from "./vars";

export type ButtonVariant = "default" | "ink" | "you" | "accent" | "quiet" | "link";

interface Common {
  variant?: ButtonVariant;
  size?: "xs" | "sm" | "md";
}

/** What it does, one of: a click; a link (a path inside the app, "/t/NW-17", or a URL opened in a
 *  new tab); or nothing now, and why (R11): it stays focusable, does nothing, and says why. */
type Does =
  | { onClick?: () => void; href?: never; blocked?: never }
  | { href: string; onClick?: never; blocked?: never }
  | { blocked: string; onClick?: never; href?: never };

export type ButtonProps = Common &
  Does &
  (
    | { children: ReactNode; icon?: IconName; title?: string }
    /** Icon-only: `title` is its name, so it can't be left without one. */
    | { children?: undefined; icon: IconName; title: string }
  );

interface AnchorProps {
  href: string;
  cls: string;
  tip: string | undefined;
  name: string | undefined;
  body: ReactNode;
}

/** A path inside the app is a router link; anything else opens in a new tab. */
function Anchor({ href, cls, tip, name, body }: AnchorProps) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={cls} title={tip} aria-label={name}>
        {body}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      title={tip}
      aria-label={name}
    >
      {body}
    </a>
  );
}

export function Button(props: ButtonProps) {
  const { children, variant = "default", size = "md", icon, title, blocked, onClick, href } = props;
  const why = useId();
  const square = children === undefined;
  const cls = cx(s.btn, s[variant], s[size], square && s.square);
  const name = square ? title : undefined;
  const body = (
    <>
      {icon ? (
        <span className={s.glyph}>
          <Icon name={icon} />
        </span>
      ) : null}
      {children}
      {variant === "accent" ? <Icon name="arrow" /> : null}
    </>
  );
  if (blocked !== undefined) {
    return (
      <button
        type="button"
        className={cls}
        aria-disabled="true"
        aria-label={name}
        aria-describedby={why}
        title={blocked}
      >
        {body}
        {/* the reason as its description, not part of its name (described-by reads hidden text) */}
        <span id={why} hidden>
          {blocked}
        </span>
      </button>
    );
  }
  if (href !== undefined)
    return <Anchor href={href} cls={cls} tip={title} name={name} body={body} />;
  return (
    <button type="button" className={cls} title={title} aria-label={name} onClick={onClick}>
      {body}
    </button>
  );
}

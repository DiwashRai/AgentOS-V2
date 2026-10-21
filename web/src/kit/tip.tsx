// Tooltips (internal): every `title` the kit takes is drawn as Linear's tooltip, a small sheet over
// the thing after a short rest, rather than the browser's own. Base UI's tooltip does the hover,
// focus, delay and placement; one tooltip serves every tip under its frame (a detached trigger
// hands it its words), and a dialog has its own, in the top layer with it. A tooltip is visual
// only, so the words stay in the accessibility tree: as the thing's description, or as its name
// where they already are its name (an icon button's). Outside a frame (a component rendered on its
// own) a tip falls back to the browser's title.
import { Tooltip } from "@base-ui/react/tooltip";
import {
  cloneElement,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react";

import { useLayer } from "./layer";
import p from "./Popover.module.css";
import s from "./Tip.module.css";
import { cx, tokenPx } from "./vars";

const Handle = createContext<Tooltip.Handle<string> | null>(null);

/** An ellipsis is showing on its words, or on a part's (a chip's label): one line run past its
 *  box, or more lines than a clamp shows. */
function cutShort(el: Element): boolean {
  return [el, ...el.querySelectorAll("*")].some((e) => {
    const css = getComputedStyle(e);
    if (css.textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth) return true;
    return css.getPropertyValue("-webkit-line-clamp") !== "none" && e.scrollHeight > e.clientHeight;
  });
}

/** The one tooltip for the tips under it: the frame's, and each dialog's own. */
export function Tips({ children }: { children: ReactNode }) {
  const [handle] = useState(() => Tooltip.createHandle<string>());
  const layer = useLayer();
  return (
    <Handle value={handle}>
      {children}
      <Tooltip.Root
        handle={handle}
        // Esc closes the tooltip and goes on to what it is over (a menu, a dialog), so one Esc
        // still closes them: a tooltip is never something Esc has to get past
        // A tip that repeats words already on screen opens only while they are cut short.
        onOpenChange={(open, details) => {
          if (open) {
            const el = details.trigger;
            const whole = el?.hasAttribute("data-tip-cut") === true && !cutShort(el);
            // a popup's trigger given focus back as it closed (`data-tip-rest`, Menu's)
            const rest = details.reason === "trigger-focus" && el?.hasAttribute("data-tip-rest");
            if (!whole && !rest) return;
            // not this one, and not the one before it either, left over somewhere else
            details.cancel();
            handle.close();
            return;
          }
          if (details.reason !== "escape-key") return;
          details.cancel();
          details.allowPropagation();
          handle.close();
        }}
      >
        {({ payload }) => (
          <Tooltip.Portal {...layer}>
            <Tooltip.Positioner className={p.layer} sideOffset={() => tokenPx("--sp-3")}>
              <Tooltip.Popup className={cx(p.sheet, s.tip)}>{payload}</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Handle>
  );
}

/** Tooltips under it open at once after the first one has shown. */
export function TipDelay({ children }: { children: ReactNode }) {
  return <Tooltip.Provider>{children}</Tooltip.Provider>;
}

interface TipProps {
  /** The words; none draws the element as it is. */
  text: string | undefined;
  /** The words are said already (an icon button's or a face's name, a blocked button's reason):
   *  not given again as its description. */
  said?: boolean;
  /** The words are the element's own, shown in full but for an ellipsis: the tip opens only
   *  while they are cut short. */
  cut?: boolean;
  /** The element the tip is over: one element (a span, a button, a link). */
  children: ReactElement<{ id?: string; title?: string }>;
}

export function Tip({ text, said = false, cut = false, children }: TipProps) {
  const handle = useContext(Handle);
  if (!text) return children;
  if (!handle) return cloneElement(children, { title: text });
  const { id } = children.props;
  return (
    <Tooltip.Trigger
      handle={handle}
      payload={text}
      render={children}
      {...(id ? { id } : {})}
      {...(said || cut ? {} : { "aria-description": text })}
      {...(cut ? { "data-tip-cut": "" } : {})}
    />
  );
}

// How a whole row or card opens something (internal: Row and Card): for the keyboard and assistive
// tech, one real button, unseen over the thing and out of the pointer's way (its owner draws the
// focus ring round itself); for a pointer, a click anywhere on it, but not one on a control inside
// it (its own meaning) nor the end of a text selection, so its lines keep their own tooltips.
import type { MouseEvent } from "react";

/** A click anywhere on the thing opens it, but not on its own controls or ending a selection. */
export function openOnClick(open: () => void) {
  return (e: MouseEvent) => {
    const control = e.target instanceof Element && e.target.closest("a, button, [role=combobox]");
    if (!control && document.getSelection()?.isCollapsed !== false) open();
  };
}

interface OpenerProps {
  /** Its owner's class for it: the thing's whole box, unseen, taking no pointer events. */
  className: string | undefined;
  /** What it opens, or whether it opens or closes ("Peek at NW-17: …", "Edit Implement"). */
  say: string;
  /** Whether what it opens is open, when it opens in place. */
  expanded?: boolean | undefined;
  onOpen: () => void;
}

export function Opener({ className, say, expanded, onOpen }: OpenerProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={say}
      aria-expanded={expanded}
      onClick={onOpen}
    />
  );
}

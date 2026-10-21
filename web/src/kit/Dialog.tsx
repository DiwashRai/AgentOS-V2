// A modal on the browser's own <dialog>: it holds focus, the rest of the page is inert, and focus
// goes back to the opener. Esc and the close button ask the screen to close it (`onClose`); the
// screen closes it by setting `open`, so it can ask first. Two looks:
// - side: the peek, sliding in from the right. Each direct child is one section, ruled off from
//   the next; they scroll inside the panel, over a foot that stays put.
// - full: the whole window, for editing (a ticket's workflow or item): the close at the top left,
//   then the view (a Page, so its top bar and body are the same as on its own screen). `ask`
//   draws a question over it, modal inside it (unsaved changes: Save, Discard, Keep editing).
// It sits in the browser's top layer, so the kit's popovers opened inside it mount inside it.
import { type ReactNode, useEffect, useRef } from "react";

import { Button } from "./Button";
import s from "./Dialog.module.css";
import { Layer } from "./layer";

export interface DialogProps {
  /** Its accessible name. */
  label: string;
  open: boolean;
  /** Esc or the close button: the screen decides (close, or ask first). */
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the scrolling sections (the peek's reply box); the side look only. */
  foot?: ReactNode;
  look?: "side" | "full";
  /** A question over the full look, modal inside it; the view under it is inert. */
  ask?: ReactNode;
}

/** The full look: the close at the top left, the view beside it, and the question over both. */
function Full({
  label,
  onClose,
  children,
  ask,
}: Pick<DialogProps, "label" | "onClose" | "children" | "ask">) {
  const asking = useRef<HTMLDivElement>(null);
  const hasAsk = ask !== undefined && ask !== null;
  useEffect(() => {
    if (hasAsk) asking.current?.querySelector<HTMLElement>("button")?.focus();
  }, [hasAsk]);
  return (
    <>
      <div className={s.frame} inert={hasAsk}>
        <span className={s.close}>
          <Button variant="quiet" icon="close" title="Close  Esc" onClick={onClose} />
        </span>
        <div className={s.view}>{children}</div>
      </div>
      {hasAsk ? (
        <div className={s.scrim}>
          <div
            ref={asking}
            className={s.ask}
            role="alertdialog"
            aria-modal="true"
            aria-label={`Close ${label}?`}
          >
            {ask}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Dialog({ label, open, onClose, children, foot, look = "side", ask }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Whether the screen still wants it open: a close it didn't ask for (the browser's own, when it
  // won't let Esc be held) is the user's, and is reported; a close that follows `open` going false
  // is the screen's own, and isn't. Synced on every render, so a screen that keeps it open after
  // such a close (to ask first) shows it again.
  const wanted = useRef(open);
  useEffect(() => {
    wanted.current = open;
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // the full look opens on itself, not its close; Tab goes on from there
      if (look === "full") d.focus();
    }
    if (!open && d.open) d.close();
  });
  const side = (
    <>
      <div className={s.body}>{open ? children : null}</div>
      {open && foot ? <div className={s.foot}>{foot}</div> : null}
    </>
  );
  return (
    <dialog
      ref={ref}
      className={look === "full" ? s.full : s.side}
      tabIndex={look === "full" ? -1 : undefined}
      aria-label={label}
      onCancel={(e) => {
        if (!e.cancelable) return; // the browser closes it anyway: `onClose` below reports it
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (wanted.current) onClose();
      }}
    >
      <Layer.Provider value={ref}>
        {look === "side" ? (
          side
        ) : open ? (
          <Full label={label} onClose={onClose} ask={ask}>
            {children}
          </Full>
        ) : null}
      </Layer.Provider>
    </dialog>
  );
}

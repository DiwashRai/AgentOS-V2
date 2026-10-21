// A modal on the browser's own <dialog>: it holds focus, the rest of the page is inert, and focus
// goes back to the opener. Esc and the close button ask the screen to close it (`onClose`); the
// screen closes it by setting `open`, so it can ask first. Two looks:
// - side: the peek, sliding in from the right. Its parts are Sections, each padded and ruled off
//   from the next; they scroll inside the panel, over a foot that stays put.
// - full: the whole window, for editing (a ticket's workflow or item): the close at the top left,
//   then the view (a Page, so its top bar and body are the same as on its own screen). `ask`
//   draws a question over it, modal inside it (unsaved changes: Save, Discard, Keep editing).
// It sits in the browser's top layer, so the kit's popovers, tooltips and toasts raised inside it
// mount inside it.
import { type ReactNode, useEffect, useId, useRef } from "react";

import { Button } from "./Button";
import s from "./Dialog.module.css";
import { Layer } from "./layer";
import { InPanel } from "./Section";
import { Tips } from "./tip";
import { Toasts } from "./toast";

export type DialogProps = {
  /** Its accessible name. */
  label: string;
  open: boolean;
  /** Esc or the close button: the screen decides (close, or ask first). */
  onClose: () => void;
  /** Beside the page: its Sections, each one of the panel's parts. Full: the one view. */
  children: ReactNode;
} & (
  | {
      look?: "side";
      /** Pinned under the scrolling sections (the peek's reply box). */
      foot?: ReactNode;
      ask?: never;
    }
  | {
      look: "full";
      /** A question over it, modal inside it; the view under it is inert. */
      ask?: DialogAsk | undefined;
      foot?: never;
    }
);

/** A question the kit draws, so it is always named and described: its words as a heading, a note
 *  under them, and its actions (the first takes the focus, so Enter is safe). */
export interface DialogAsk {
  question: string;
  note?: string;
  actions: ReactNode;
}

/** The question gone: focus back where the person was, else on the dialog. */
function giveBack(was: HTMLElement | null, frame: HTMLElement | null) {
  if (was?.isConnected) was.focus();
  else frame?.closest("dialog")?.focus();
}

/** The full look: the close at the top left, the view beside it, and the question over both. */
function Full({
  onClose,
  children,
  ask,
}: {
  onClose: () => void;
  children: ReactNode;
  ask: DialogAsk | undefined;
}) {
  const asking = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  // where the person was in the view, to go back to when the question is dismissed (the view is
  // inert while it is asked, so its focus is lost)
  const was = useRef<HTMLElement | null>(null);
  const hasAsk = ask !== undefined;
  const said = useId();
  const asked = useRef(false);
  useEffect(() => {
    if (hasAsk) asking.current?.querySelector<HTMLElement>("button")?.focus();
    else if (asked.current) giveBack(was.current, frame.current);
    asked.current = hasAsk;
  }, [hasAsk]);
  return (
    <>
      <div
        ref={frame}
        className={s.frame}
        inert={hasAsk}
        onFocus={(e) => {
          if (e.target instanceof HTMLElement) was.current = e.target;
        }}
        // focus moved on to the dialog itself (where it opens, past the close the browser's
        // showModal lands on first) is no longer where the person was
        onBlur={(e) => {
          if (e.relatedTarget === e.currentTarget.closest("dialog")) was.current = null;
        }}
      >
        <span className={s.close}>
          <Button variant="quiet" icon="close" title="Close (Esc)" onClick={onClose} />
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
            aria-labelledby={`${said}q`}
            aria-describedby={ask.note ? `${said}n` : undefined}
          >
            <div className={s.said}>
              <h2 className={s.question} id={`${said}q`}>
                {ask.question}
              </h2>
              {ask.note ? (
                <p className={s.note} id={`${said}n`}>
                  {ask.note}
                </p>
              ) : null}
            </div>
            <div className={s.actions}>{ask.actions}</div>
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
      // it opens on itself, not on the first thing in it the browser would pick (the full look's
      // close, the toast region); Tab goes on from there (not while it asks: the question has the
      // focus)
      if (ask === undefined) d.focus();
    }
    if (!open && d.open) d.close();
  });
  // the side look's toasts dock above its foot (drawn while closed too, so it is there when the
  // region mounts)
  const dock = useRef<HTMLDivElement>(null);
  const side = (
    <>
      <div className={s.body}>
        <InPanel value>{open ? children : null}</InPanel>
      </div>
      <div ref={dock} className={s.dock} />
      {open && foot ? <div className={s.foot}>{foot}</div> : null}
    </>
  );
  return (
    <dialog
      ref={ref}
      className={look === "full" ? s.full : s.side}
      tabIndex={-1}
      aria-label={label}
      // Esc is the dialog's own, wherever focus is in it (the question too): a keydown it prevents
      // never becomes the browser's close request, which a repeated Esc can't hold. A key a popup
      // or a nested dialog inside has taken already is theirs.
      onKeyDown={(e) => {
        if (e.key !== "Escape" || e.defaultPrevented) return;
        e.preventDefault();
        // a held key asks once (its repeats are still kept from the browser)
        if (!e.repeat) onClose();
      }}
      // React hands a nested dialog's cancel and close to this one too: only its own count
      onCancel={(e) => {
        if (e.target !== e.currentTarget || !e.cancelable) return; // `onClose` below reports it
        e.preventDefault();
        onClose();
      }}
      onClose={(e) => {
        if (e.target === e.currentTarget && wanted.current) onClose();
      }}
    >
      <Layer.Provider value={ref}>
        <Tips>
          {/* keyed by its opening: a closed dialog's toasts (and any still waiting on its
              question) go with it, and don't greet the next one */}
          <Toasts
            key={open ? "open" : "shut"}
            held={ask !== undefined}
            dock={look === "side" ? dock : undefined}
          >
            {look === "side" ? (
              side
            ) : open ? (
              <Full onClose={onClose} ask={ask}>
                {children}
              </Full>
            ) : null}
          </Toasts>
        </Tips>
      </Layer.Provider>
    </dialog>
  );
}

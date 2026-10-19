// A modal panel on the browser's own <dialog>: it holds focus, Esc closes it, the rest of the page
// is inert, and focus goes back to the opener. It slides in from the right (the peek). Each
// direct child is one section, ruled off from the next.
import { type ReactNode, useEffect, useRef } from "react";

import s from "./Dialog.module.css";

export interface DialogProps {
  /** Its accessible name. */
  label: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ label, open, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Whether the screen still wants it open: a close it didn't ask for (Esc) is the user's, and is
  // reported; a close that follows `open` going false is the screen's own, and isn't.
  const wanted = useRef(open);
  useEffect(() => {
    wanted.current = open;
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={s.side}
      aria-label={label}
      onClose={() => {
        if (wanted.current) onClose();
      }}
    >
      <div className={s.body}>{open ? children : null}</div>
    </dialog>
  );
}

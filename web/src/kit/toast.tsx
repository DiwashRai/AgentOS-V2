// Toasts (internal, raised with `useToast`): a short word that something happened, as Linear's,
// in a small sheet at the window's bottom right that goes by itself after a few seconds (the
// pointer over it holds it). Base UI's toast does the timing, the polite announcement, F6 into
// the region and the swipe away; the look is the kit's popover sheet. The frame has the region,
// and each dialog has its own, in the top layer with it, so a toast raised inside one shows over it.
// The kit's quiet language holds: a toast says what was done, never a spinner or a problem a
// screen should say in place.
import { Toast } from "@base-ui/react/toast";
import { type ReactNode, useEffect, useState } from "react";

import { Icon } from "./Icon";
import { useLayer } from "./layer";
import p from "./Popover.module.css";
import s from "./Toast.module.css";
import { cx } from "./vars";

function List() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => (
    <Toast.Root key={t.id} toast={t} className={cx(p.sheet, s.toast)}>
      <Toast.Content className={s.content}>
        <Toast.Title className={s.title} />
        <Toast.Description className={s.note} />
      </Toast.Content>
      <Toast.Close className={s.close} aria-label="Dismiss">
        <Icon name="close" />
      </Toast.Close>
    </Toast.Root>
  ));
}

/** The region the toasts raised under it show in: the frame's, and each dialog's own. */
export function Toasts({ children }: { children: ReactNode }) {
  const layer = useLayer();
  // a dialog's region mounts once the dialog itself is there (its element is set after the things
  // inside it), or it would land in the body, under the dialog
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    setPlaced(true);
  }, []);
  return (
    <Toast.Provider>
      {children}
      {placed ? (
        <Toast.Portal {...layer}>
          <Toast.Viewport className={s.region}>
            <List />
          </Toast.Viewport>
        </Toast.Portal>
      ) : null}
    </Toast.Provider>
  );
}

/** Raise a toast: what was done, and a quiet line under it. */
export function useToast(): (title: string, note?: string) => void {
  const toasts = Toast.useToastManager();
  return (title, note) => {
    toasts.add({ title, ...(note ? { description: note } : {}) });
  };
}

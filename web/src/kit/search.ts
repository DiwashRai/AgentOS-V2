// The kit's one rule for which search a shortcut means: the first search in the top layer (the
// last open dialog, else the main column), so "/" and the sidebar's Search reach the search of the
// view the person is looking at, not one mounted under an overlay.

/** A single-key shortcut never fires while typing or with a modifier held. */
export function isShortcut(e: KeyboardEvent): boolean {
  const t = e.target;
  const typing =
    t instanceof HTMLElement &&
    (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  return !e.metaKey && !e.ctrlKey && !e.altKey && !typing;
}

/** The search input of the top layer, if it has one. */
export function activeSearch(): HTMLInputElement | null {
  const dialogs = document.querySelectorAll("dialog[open]");
  const layer = dialogs.length > 0 ? dialogs[dialogs.length - 1] : document.querySelector("main");
  return layer?.querySelector<HTMLInputElement>('input[type="search"]') ?? null;
}

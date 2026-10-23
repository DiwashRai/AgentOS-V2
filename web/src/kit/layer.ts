// Where the kit's popovers mount. A modal <dialog> sits in the browser's top layer, over anything
// in the body, so a picker opened inside one (the full-window editor's agent, phase and overrides)
// must mount inside it, or it opens hidden behind it. A Dialog provides itself here; outside one
// the popovers mount in the body as usual.
import { createContext, type RefObject, useContext } from "react";

export const Layer = createContext<RefObject<HTMLElement | null> | null>(null);

/** The props for a Base UI Portal: inside the open dialog around it, if there is one. */
export function useLayer(): { container?: RefObject<HTMLElement | null> } {
  const layer = useContext(Layer);
  return layer ? { container: layer } : {};
}

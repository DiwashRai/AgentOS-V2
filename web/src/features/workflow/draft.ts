// The editor's working copy of a workflow: every edit is one step that Undo takes back and Redo
// puts back; it is dirty while it differs from what was last saved. Saving is static in W0: it
// takes the working copy as the saved one.
import { useState } from "react";

import type { WorkflowBody } from "../../api/types";

interface History {
  saved: WorkflowBody;
  past: readonly WorkflowBody[];
  now: WorkflowBody;
  future: readonly WorkflowBody[];
}

export interface Draft {
  body: WorkflowBody;
  change: (f: (b: WorkflowBody) => WorkflowBody) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
  save: () => void;
  discard: () => void;
}

export function useDraft(initial: WorkflowBody): Draft {
  const [h, setH] = useState<History>({ saved: initial, past: [], now: initial, future: [] });
  return {
    body: h.now,
    change: (f) => {
      setH((x) => {
        const now = f(x.now);
        return now === x.now ? x : { ...x, past: [...x.past, x.now], now, future: [] };
      });
    },
    undo: () => {
      setH((x) => {
        const now = x.past.at(-1);
        return now ? { ...x, past: x.past.slice(0, -1), now, future: [x.now, ...x.future] } : x;
      });
    },
    redo: () => {
      setH((x) => {
        const [now, ...future] = x.future;
        return now ? { ...x, past: [...x.past, x.now], now, future } : x;
      });
    },
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
    dirty: h.now !== h.saved,
    save: () => {
      setH((x) => ({ ...x, saved: x.now }));
    },
    discard: () => {
      setH((x) => ({ saved: x.saved, past: [], now: x.saved, future: [] }));
    },
  };
}

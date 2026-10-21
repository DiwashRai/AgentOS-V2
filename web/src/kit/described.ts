// What a FormRow tells the controls it holds (internal): its note and its problem, and the id their
// words are drawn under. A control describes itself from them with `describe`: the words' ids for
// aria-describedby, and aria-invalid while there is a problem. A control that draws its own copy
// of the words (a text area popped out to the whole window, over an inert page) describes itself
// from its own id the same way. A control outside a FormRow gets nothing.
import { createContext, useContext } from "react";

export interface Described {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

export interface Description {
  /** The id the row's words are drawn under: the note at `${id}n`, the problem at `${id}p`. */
  id?: string;
  note?: string;
  problem?: string;
}

/** The one rule: the words' ids, and invalid while there is a problem. */
export function describe(id: string | undefined, note?: string, problem?: string): Described {
  if (id === undefined) return {};
  const ids = [note ? `${id}n` : null, problem ? `${id}p` : null].filter((x) => x !== null);
  return {
    ...(ids.length > 0 ? { "aria-describedby": ids.join(" ") } : {}),
    ...(problem ? { "aria-invalid": true as const } : {}),
  };
}

export const DescribedBy = createContext<Description>({});

/** The description and validity a control takes from the FormRow it is in. */
export function useDescribed(): Described {
  const d = useContext(DescribedBy);
  return describe(d.id, d.note, d.problem);
}

/** The row's words, for a control that draws its own copy of them. */
export function useDescription(): Description {
  return useContext(DescribedBy);
}

// What a FormRow tells the controls it holds (internal): the ids of its note and its problem, for a
// control's aria-describedby; whether its value is wrong, for aria-invalid; and the words
// themselves, for a control that draws its own copy where the row's are out of reach (a text area
// popped out to the whole window, over an inert page). A control outside a FormRow gets nothing.
import { createContext, useContext } from "react";

export interface Described {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

export interface Description {
  attrs: Described;
  note?: string;
  problem?: string;
}

export const DescribedBy = createContext<Description>({ attrs: {} });

/** The description and validity a control takes from the FormRow it is in. */
export function useDescribed(): Described {
  return useContext(DescribedBy).attrs;
}

/** The row's words, for a control that draws its own copy of them. */
export function useDescription(): Description {
  return useContext(DescribedBy);
}

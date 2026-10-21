// What a FormRow tells the controls it holds (internal): the ids of its note and its problem, for a
// control's aria-describedby, and whether its value is wrong, for aria-invalid. A control outside a
// FormRow gets nothing.
import { createContext, useContext } from "react";

export interface Described {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

export const DescribedBy = createContext<Described>({});

/** The description and validity a control takes from the FormRow it is in. */
export function useDescribed(): Described {
  return useContext(DescribedBy);
}

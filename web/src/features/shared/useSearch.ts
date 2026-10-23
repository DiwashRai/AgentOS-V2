// The top-bar search lives in the URL (`?q=`), so it survives a reload and sits beside the peek.
// Typing replaces the history entry: one Back undoes the whole search.
import { useSearchParams } from "react-router";

import { terms } from "../../domain/format";

export function useSearch(placeholder = "Search or jump to a ticket") {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  return {
    query: terms(q),
    search: {
      value: q,
      placeholder,
      onChange: (next: string) => {
        setParams(
          (p) => {
            const out = new URLSearchParams(p);
            if (next === "") out.delete("q");
            else out.set("q", next);
            return out;
          },
          { replace: true, flushSync: true },
        );
      },
    },
  };
}

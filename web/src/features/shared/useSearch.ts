// The top-bar search lives in the URL (`?q=`), so it survives a reload and sits beside the peek.
// Typing replaces the history entry: one Back undoes the whole search.
import { terms } from "../../domain/format";
import { useParam } from "./useParam";

export function useSearch(placeholder = "Search or jump to a ticket") {
  const [asked, set] = useParam("q", { replace: true, flushSync: true });
  const q = asked ?? "";
  return {
    query: terms(q),
    search: {
      value: q,
      placeholder,
      onChange: (next: string) => {
        set(next === "" ? null : next);
      },
    },
  };
}

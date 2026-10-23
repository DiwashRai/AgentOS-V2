// A view's state that lives in its URL, so it survives a reload and a link carries it: a list's
// filter chip (Compact's and All teams' `?f=`, My queue's `?z=`, Intake's `?only=`), Compact's open
// row and repo, the top bar's search (`?q=`), the ticket page's tab and overlay, and the peek
// (`?peek=KEY`) over any list. Each sets its own key and keeps the rest.
import { useSearchParams } from "react-router";

/** How a change is written: `replace` swaps the history entry rather than adding one (a search's
 *  typing, a tab), so one Back undoes the whole of it; `flushSync` renders it at once (an input's
 *  own value). */
interface Write {
  replace?: boolean;
  flushSync?: boolean;
}

/** One key of the URL's query: its value (null while it is absent), and its setter (null takes
 *  it out). */
export function useParam(
  key: string,
  write?: Write,
): [string | null, (value: string | null) => void] {
  const [params, setParams] = useSearchParams();
  const set = (value: string | null) => {
    setParams((p) => {
      const out = new URLSearchParams(p);
      if (value === null) out.delete(key);
      else out.set(key, value);
      return out;
    }, write);
  };
  return [params.get(key), set];
}

/** The peek: the ticket it is open on (an empty `?peek=` is no peek), opening it on one, and
 *  closing it. */
export function usePeek() {
  const [asked, set] = useParam("peek");
  return {
    key: asked === "" ? null : asked,
    open: (key: string) => {
      set(key);
    },
    close: () => {
      set(null);
    },
  };
}

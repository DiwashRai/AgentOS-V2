import { beforeEach, describe, expect, it, vi } from "vitest";

import { useParam, usePeek } from "./useParam";
import { useSearch } from "./useSearch";

// The router faked: the URL's query, and how each write was made.
const router = vi.hoisted(() => ({ url: new URLSearchParams(), writes: [] as unknown[] }));
vi.mock("react-router", () => ({
  useSearchParams: () => [
    router.url,
    (next: (p: URLSearchParams) => URLSearchParams, write?: unknown) => {
      router.url = next(router.url);
      router.writes.push(write);
    },
  ],
}));

/** The URL's hooks as a view calls them (with the router faked, no render is needed). */
function View() {
  return { f: useParam("f"), peek: usePeek(), search: useSearch() };
}

beforeEach(() => {
  router.url = new URLSearchParams("f=blocked&peek=NW-1&q=ada");
  router.writes = [];
});

describe("a view's state in its URL", () => {
  it("sets its own key and keeps the others", () => {
    const [, setF] = View().f;
    setF("needs_you");
    expect(router.url.toString()).toBe("f=needs_you&peek=NW-1&q=ada");
    setF(null);
    expect(router.url.toString()).toBe("peek=NW-1&q=ada");
  });

  it("treats an empty ?peek= as no peek", () => {
    router.url = new URLSearchParams("peek=&f=blocked");
    expect(View().peek.key).toBeNull();
    View().peek.open("NW-2");
    expect(View().peek.key).toBe("NW-2");
    View().peek.close();
    expect(router.url.toString()).toBe("f=blocked");
  });

  it("replaces the history entry as the search is typed, and an empty one goes", () => {
    View().search.search.onChange("ada park");
    expect(View().search.query).toEqual(["ada", "park"]);
    expect(router.writes).toEqual([{ replace: true, flushSync: true }]);
    View().search.search.onChange("");
    expect(router.url.toString()).toBe("f=blocked&peek=NW-1");
  });
});

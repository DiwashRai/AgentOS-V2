// Where a read stands until its data is there: on its way, the server out of reach, or the server's
// answer that there is no such thing (the DataSource's NotFound). Every screen says these three
// the same way (patterns/load.tsx).
export type Load =
  { kind: "pending" } | { kind: "unreachable"; message: string } | { kind: "missing" };

/** A read: its data, or where it stands without it. */
export type Loaded<T> = { kind: "ready"; data: T } | Load;

// The item editor's state: the version stored, the draft over it, the versions saved here, and a
// version someone else saved meanwhile (a conflict), with the still states `?still=edited` and
// `?still=conflict` drawn from the URL. Keep mine saves at once, as the next version after theirs:
// yours, plus each of their changes that doesn't touch yours.
import { useState } from "react";
import { useSearchParams } from "react-router";

import type { Author, Person, Version } from "../../api/types";
import { type Draft, myEdit, sameDraft, type Stored, stillOf, theirEdit } from "./draft";
import { mergeDraft } from "./merge";

export interface Versioned {
  version: number;
  updated_at: string;
  updated_by: Author;
  /** The latest few versions, newest first. */
  history: readonly Version[];
}

const MINUTE = 60_000;

/** The still conflict's other side: the latest of the item's editors who isn't you. */
function someoneElse(item: Versioned, me: Person | null): Author {
  const other = item.history.find((v) => v.by.kind === "person" && v.by.person.id !== me?.id);
  return other?.by ?? item.updated_by;
}

const stamp = (s: Stored): Version => ({ version: s.version, at: s.at, by: s.by });

export function useEditor(item: Versioned, start: Draft, now: number, me: Person | null) {
  const [params] = useSearchParams();
  const still = stillOf(params.get("still"));
  const [stored, setStored] = useState<Stored>(() => ({
    draft: start,
    version: item.version,
    at: item.updated_at,
    by: item.updated_by,
  }));
  const [draft, setDraft] = useState<Draft>(() => (still ? myEdit(start) : start));
  const [pending, setPending] = useState<Omit<Stored, "by"> | null>(() =>
    still === "conflict"
      ? {
          draft: theirEdit(start),
          version: item.version + 1,
          at: new Date(now - 4 * MINUTE).toISOString(),
        }
      : null,
  );
  const [log, setLog] = useState<readonly Version[]>([]);
  const theirs: Stored | null = pending ? { ...pending, by: someoneElse(item, me) } : null;
  /** Your draft stored as a version, by you, now. */
  const mine = (d: Draft, version: number): Stored | null =>
    me
      ? { draft: d, version, at: new Date(now).toISOString(), by: { kind: "person", person: me } }
      : null;
  const keep = (s: Stored, ...older: Stored[]) => {
    setStored(s);
    setDraft(s.draft);
    setLog((l) => [stamp(s), ...older.map(stamp), ...l]);
    setPending(null);
  };
  return {
    stored,
    draft,
    theirs,
    dirty: !sameDraft(draft, stored.draft),
    history: [...log, ...item.history].slice(0, 5),
    edit: (d: Partial<Draft>) => {
      setDraft((old) => ({ ...old, ...d }));
    },
    discard: () => {
      setDraft(stored.draft);
    },
    save: () => {
      const s = mine(draft, stored.version + 1);
      if (s) keep(s);
    },
    keepMine: () => {
      const s =
        theirs && mine(mergeDraft(stored.draft, draft, theirs.draft).value, theirs.version + 1);
      if (theirs && s) keep(s, theirs);
    },
    takeTheirs: () => {
      if (theirs) keep(theirs);
    },
  };
}

export type Editor = ReturnType<typeof useEditor>;

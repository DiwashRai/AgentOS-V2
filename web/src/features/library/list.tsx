// What the four library lists share, in the app's list style (Compact's): the bar (the list's name,
// the Space's Library, search, New), one recessed surface holding a dense table with its column
// head, rows that open the item's editor on a click or Enter, ↑ ↓ (or j k) moving a selection that
// Enter opens, and a foot with those keys and the count. A search that matches nothing says so.
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useNow } from "../../api/queries";
import type { Author, Iso } from "../../api/types";
import { age, firstName, plural } from "../../domain/format";
import {
  Age,
  Avatar,
  Badge,
  Button,
  type Column,
  Notice,
  Page,
  Row,
  type Search,
  Stack,
  Surface,
  Table,
  Text,
} from "../../kit";
import { contextOf, useSpace } from "../shared/board";

interface LibraryListProps {
  /** The list's name: Workflows, Agents, Skills, Files. */
  title: string;
  /** One of them, for the count and New ("agent"). */
  noun: string;
  columns: readonly Column[];
  search: Search;
  /** How many the list holds. */
  total: number;
  /** The rows the search leaves, in order, by the editor each opens. */
  hrefs: readonly string[];
  /** Held to a reading width, for a list of few columns, so a row's far end stays near its name. */
  measure?: boolean;
  children: ReactNode;
}

const HINTS = [
  ["↑↓", "Select"],
  ["↵", "Open"],
  ["/", "Search"],
] as const;

/** The selected row's editor, for the rows to light it. */
const Selected = createContext<string | null>(null);

function Foot({ noun, total, shown }: { noun: string; total: number; shown: number }) {
  return (
    <>
      {HINTS.map(([key, word]) => (
        <Stack key={key} dir="row" gap={3} align="center">
          <Badge kind="kbd">{key}</Badge>
          <Text variant="meta">{word}</Text>
        </Stack>
      ))}
      <Stack grow />
      <Text variant="meta" tone="2">
        {shown === total ? plural(total, noun) : `${String(shown)} of ${plural(total, noun)}`}
      </Text>
    </>
  );
}

const STEP: Record<string, number> = { ArrowDown: 1, j: 1, ArrowUp: -1, k: -1 };

/** ↑ ↓ and j k move the selection through the rows (from none to the first), Enter opens it;
 *  never while typing (the search field keeps its own keys) or with a modifier held. */
function useSelection(hrefs: readonly string[]): string | null {
  const navigate = useNavigate();
  const [at, setAt] = useState(-1);
  // the keys read these between renders: the rows as last drawn, and the selection as just moved
  const list = useRef(hrefs);
  const now = useRef(at);
  useEffect(() => {
    list.current = hrefs;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const step = STEP[e.key];
      const href = list.current[now.current];
      if (step !== undefined) {
        e.preventDefault();
        now.current = Math.min(Math.max(now.current + step, 0), list.current.length - 1);
        setAt(now.current);
      } else if (e.key === "Enter" && href) void navigate(href);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [navigate]);
  return hrefs[at] ?? null;
}

export function LibraryList(props: LibraryListProps) {
  const { title, noun, columns, search, total, hrefs, measure, children } = props;
  const space = useSpace();
  const selected = useSelection(hrefs);
  return (
    <Page
      title={title}
      context={contextOf(space, "Library")}
      search={search}
      action={<Button>{`New ${noun}`}</Button>}
    >
      <Surface fill>
        <Table
          columns={columns}
          measure={measure}
          foot={<Foot noun={noun} total={total} shown={hrefs.length} />}
        >
          {hrefs.length === 0 && total > 0 ? (
            <Notice kind="empty" lead="No match">
              {`nothing in ${title.toLowerCase()} matches this search`}
            </Notice>
          ) : (
            <Selected.Provider value={selected}>{children}</Selected.Provider>
          )}
        </Table>
      </Surface>
    </Page>
  );
}

/** A row that opens its item's editor; lit while the keys have it selected. */
export function LibraryRow({
  name,
  href,
  children,
}: {
  name: string;
  href: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const selected = useContext(Selected);
  return (
    <Row
      open={selected === href}
      action={{
        label: `Open ${name}`,
        run: () => {
          void navigate(href);
        },
      }}
    >
      {children}
    </Row>
  );
}

/** A row's lead: an optional glyph or face, the name, and quiet words after it on the same line
 *  (Compact's title cell), cut at the end so the words give way first. */
export function NameCell({
  lead,
  name,
  after,
  mark,
  title,
}: {
  lead?: ReactNode;
  name: string;
  after?: string;
  /** A chip after the name (the default workflow's). */
  mark?: ReactNode;
  /** On hover, in place of the name and the words (a workflow's description). */
  title?: string;
}) {
  return (
    <Stack dir="row" gap={4} align="center">
      {lead}
      <Text tone="3" truncate title={title ?? (after ? `${name} · ${after}` : name)}>
        <Text weight={500} tone="1">
          {name}
        </Text>
        {mark ? "\u2002" : null}
        {mark}
        {after ? `\u2002${after}` : null}
      </Text>
    </Stack>
  );
}

/** Who changed it last and how long ago: their face and first name, or the run that did. */
export function ChangedCell({ by, at }: { by: Author; at: Iso }) {
  const now = useNow(60_000);
  const who = by.kind === "person" ? firstName(by.person.name) : `Run #${String(by.run_id)}`;
  return (
    <Stack dir="row" gap={3} align="center">
      {by.kind === "person" ? <Avatar name={by.person.name} seed={String(by.person.id)} /> : null}
      <Text tone="2" truncate>
        {who}
      </Text>
      <Text variant="meta" tone="3">
        <Age text={age(at, now)} />
      </Text>
    </Stack>
  );
}

/** "v4", tabular. */
export function VersionCell({ version }: { version: number }) {
  return (
    <Text tone="3" tabular>
      {`v${String(version)}`}
    </Text>
  );
}

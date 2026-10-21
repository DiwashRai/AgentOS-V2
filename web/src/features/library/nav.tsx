// A library item editor's way to its siblings without going back to the list: previous and next
// (k and j, as a list's rows), where it is in the list, and a picker to jump to any of them.
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { Button, Select, Stack, Text } from "../../kit";

export interface Siblings {
  /** One of them (agent), for the buttons' names. */
  noun: string;
  /** The list's items in its order. */
  items: readonly { id: string; label: string }[];
  current: string;
  href: (id: string) => string;
}

/** j and k step to the next and previous item, unless typing or with a modifier held. */
function useStepKeys(step: (by: number) => void) {
  const latest = useRef(step);
  useEffect(() => {
    latest.current = step;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName));
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j") latest.current(1);
      if (e.key === "k") latest.current(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);
}

export function SiblingNav({ s }: { s: Siblings }) {
  const navigate = useNavigate();
  const at = s.items.findIndex((x) => x.id === s.current);
  const prev = s.items[at - 1];
  const next = s.items[at + 1];
  const go = (id: string) => {
    void navigate(s.href(id));
  };
  useStepKeys((by) => {
    const to = s.items[at + by];
    if (to) go(to.id);
  });
  return (
    <Stack dir="row" gap={2} align="center">
      <Button
        variant="quiet"
        size="xs"
        icon="up"
        {...(prev
          ? { title: `Previous ${s.noun}: ${prev.label} (k)`, href: s.href(prev.id) }
          : { title: `Previous ${s.noun}`, blocked: `This is the first ${s.noun}` })}
      />
      <Button
        variant="quiet"
        size="xs"
        icon="chevron"
        {...(next
          ? { title: `Next ${s.noun}: ${next.label} (j)`, href: s.href(next.id) }
          : { title: `Next ${s.noun}`, blocked: `This is the last ${s.noun}` })}
      />
      <Text variant="meta" tone="3" tabular>
        {`${String(at + 1)} / ${String(s.items.length)}`}
      </Text>
      <Select
        label={`Go to ${s.noun}`}
        value={s.current}
        options={s.items.map((x) => ({ id: x.id, label: x.label }))}
        onChange={go}
      />
    </Stack>
  );
}

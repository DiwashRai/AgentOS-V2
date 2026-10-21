import s from "./Avatar.module.css";
import { hueOf, initials } from "./identity";
import { cx } from "./vars";

type Size = "sm" | "md" | "mid" | "lg" | "talk";

/** One of: a person's face; a row of faces; or an empty slot. */
export type AvatarProps = {
  /** sm and mid are a neutral disc (in a pill, on a team); md (rows, pickers), talk and lg keep the
   *  person's hue. */
  size?: Size;
} & (
  | {
      /** Full name: initials on the face, the name as its accessible name. */
      name: string;
      /** Who it is, for a stable hue: a person's id, or a name when there is no id (a Jira
       *  assignee); the name by default. */
      seed?: string;
      dashed?: never;
      people?: never;
    }
  | {
      /** A row of faces, named together (who is on a team, in a conversation). */
      people: readonly { name: string; seed: string }[];
      name?: never;
      seed?: never;
      dashed?: never;
    }
  | {
      /** An empty slot: drawn dashed (Unassigned), else an invisible spacer that keeps a column. */
      dashed?: boolean;
      name?: never;
      seed?: never;
      people?: never;
    }
);
function Face({ name, seed, size }: { name: string; seed: string; size: Size }) {
  return (
    <span
      className={cx(s.av, s[size], s[hueOf(`person:${seed}`)])}
      role="img"
      aria-label={name}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

/** A person's face (a neutral disc in a pill and on a team, their own hue in rows, pickers and the
 *  conversation), a row of faces, or an empty slot. */
export function Avatar({ name, seed, size = "md", dashed, people }: AvatarProps) {
  if (people) {
    const names = people.map((p) => p.name).join(", ");
    return (
      <span className={s.faces} role="group" aria-label={names} title={names}>
        {people.map((p) => (
          <Face key={p.seed} name={p.name} seed={p.seed} size={size} />
        ))}
      </span>
    );
  }
  if (name === undefined)
    return <span className={cx(s.av, s[size], s.slot, dashed && s.dashed)} aria-hidden="true" />;
  return <Face name={name} seed={seed ?? name} size={size} />;
}

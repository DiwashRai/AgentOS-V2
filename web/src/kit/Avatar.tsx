import s from "./Avatar.module.css";
import { hueOf, initials } from "./identity";
import { cx } from "./vars";

export interface AvatarProps {
  /** Full name: initials on the face, the name as its accessible name. Omit for an empty slot. */
  name?: string;
  /** Who it is, for a stable hue: a person's id, or a name when there is no id (a Jira assignee). */
  seed?: string;
  size?: "md" | "lg" | "talk";
  /** An empty face drawn dashed (Unassigned); otherwise an empty slot is an invisible spacer. */
  dashed?: boolean;
  /** A row of faces instead, named together (who is on a team, in a conversation). */
  people?: readonly { name: string; seed: string }[];
}

function Face({ name, seed, size }: { name: string; seed: string; size: "md" | "lg" | "talk" }) {
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

/** A person's face (initials on their identity hue), an empty slot, or a row of faces. */
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

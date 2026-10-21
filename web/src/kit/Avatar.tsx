import s from "./Avatar.module.css";
import { hueOf, initials } from "./identity";
import { Tip } from "./tip";
import { cx } from "./vars";

type Size = "sm" | "md" | "lg" | "talk" | "tile";

/** One of: a person's face; a row of faces; or an empty slot. */
export type AvatarProps = {
  /** sm is a neutral disc (in a pill); md (rows, pickers, a team), talk and lg keep the person's
   *  hue; tile is a rounded square in it (an agent leading a library row). */
  size?: Size;
} & (
  | {
      /** Full name: initials on the face, the name as its accessible name. */
      name: string;
      /** Who it is, for a stable hue: a person's id, or a name when there is no id (a Jira
       *  assignee); the name by default. */
      seed?: string;
      /** Its name is written beside it (a row, an option, a message): the face is drawing alone,
       *  so the name isn't said twice. */
      beside?: boolean;
      dashed?: never;
      people?: never;
    }
  | {
      /** A row of faces, named together (who is on a team, in a conversation). */
      people: readonly { name: string; seed: string }[];
      name?: never;
      seed?: never;
      beside?: never;
      dashed?: never;
    }
  | {
      /** An empty slot: drawn dashed (Unassigned), else an invisible spacer that keeps a column. */
      dashed?: boolean;
      name?: never;
      seed?: never;
      beside?: never;
      people?: never;
    }
);

interface FaceProps {
  name: string;
  seed: string;
  size: Size;
  /** Its name is said by what is beside it: drawing alone. */
  beside: boolean;
}

function Face({ name, seed, size, beside }: FaceProps) {
  const face = (said: object) => (
    <span className={cx(s.av, s[size], s[hueOf(`person:${seed}`)])} {...said}>
      {initials(name)}
    </span>
  );
  if (beside) return face({ "aria-hidden": true });
  return (
    <Tip text={name} said>
      {face({ role: "img", "aria-label": name })}
    </Tip>
  );
}

/** A person's face (a neutral disc in a pill, their own hue in rows, pickers, a team and the
 *  conversation), a row of faces (named together by the row), or an empty slot. */
export function Avatar({ name, seed, size = "md", beside = false, dashed, people }: AvatarProps) {
  if (people) {
    const names = people.map((p) => p.name).join(", ");
    return (
      <Tip text={names} said>
        <span className={s.faces} role="group" aria-label={names}>
          {people.map((p) => (
            <Face key={p.seed} name={p.name} seed={p.seed} size={size} beside />
          ))}
        </span>
      </Tip>
    );
  }
  if (name === undefined)
    return <span className={cx(s.av, s[size], s.slot, dashed && s.dashed)} aria-hidden="true" />;
  return <Face name={name} seed={seed ?? name} size={size} beside={beside} />;
}

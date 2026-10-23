// Someone as every screen draws them: their face (a ticket's run, the agents glyph) with their name
// beside it, so the face draws alone and the name is said once. In a list's cell the first name
// (the full one on hover), and nobody a dashed ring and Unassigned; in a fact the full name, and
// nobody the word alone; a run's starter, leading its sentence, the small face and the full name;
// a face's own column (a ticket line's end) the face alone, its full name on hover, and nobody the
// dashed ring.
import { nameOf, type Someone } from "../domain/format";
import { Avatar, Icon, Stack, Text } from "../kit";

type Place = "cell" | "fact" | "starter" | "face";

/** The face, or the run's glyph; nobody has none. Alone, it says its own name. */
function Face({ who, place }: { who: Someone; place: Place }) {
  const size = place === "starter" ? "sm" : "md";
  const alone = place === "face";
  if (who.kind === "run")
    return <Icon name="agents" {...(alone ? { label: nameOf(who, true) } : {})} />;
  if (who.kind === "person")
    return <Avatar size={size} name={who.name} seed={who.seed} beside={!alone} />;
  return place === "fact" ? null : <Avatar size={size} dashed />;
}

export function Who({ who, place }: { who: Someone; place: Place }) {
  const full = nameOf(who, true);
  if (place === "face") return <Face who={who} place={place} />;
  if (place === "fact")
    return (
      <>
        <Face who={who} place={place} />
        {full}
      </>
    );
  const name = place === "cell" ? nameOf(who, false) : full;
  return (
    <Stack dir="row" gap={4} align="center">
      <Face who={who} place={place} />
      <Text
        tone={place === "starter" ? "1" : who.kind === "nobody" ? "3" : "2"}
        truncate
        {...(name === full ? {} : { title: full })}
      >
        {name}
      </Text>
    </Stack>
  );
}

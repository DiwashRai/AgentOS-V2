// A read's state, said the same way on every screen: "Loading NW-17", "Can't reach the server ·
// …", "No ticket NW-404". A failure is said at once, in the blocked colour.
import type { Load } from "../domain/load";
import { Notice } from "../kit";

/** `noun` names what is read ("ticket", "runs"); `id` the one asked for, when it is one thing. */
export function LoadNotice({ load, noun, id }: { load: Load; noun: string; id?: string }) {
  if (load.kind === "pending") return <Notice kind="status">{`Loading ${id ?? noun}`}</Notice>;
  return (
    <Notice kind="status" error>
      {load.kind === "unreachable"
        ? `Can't reach the server · ${load.message}`
        : `No ${noun}${id === undefined ? "" : ` ${id}`}`}
    </Notice>
  );
}

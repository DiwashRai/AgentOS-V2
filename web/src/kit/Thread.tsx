// The conversation: people only, never agents. Faces and bubbles; mine on the right in ink.
import { Avatar } from "./Avatar";
import s from "./Thread.module.css";
import { cx } from "./vars";

export interface ThreadMessage {
  id: number;
  name: string;
  seed: string;
  /** The time as shown ("09:12"), and in full for its title. */
  at: string;
  full: string;
  body: string;
  mine: boolean;
}

export interface ThreadProps {
  messages: readonly ThreadMessage[];
  /** last: one message, its bubble clamped (an expanded row); full: the whole thread. */
  look?: "last" | "full";
  /** A composer under the thread, with this placeholder. */
  compose?: string;
}

export function Thread({ messages, look = "full", compose }: ThreadProps) {
  const list = (
    <ol className={cx(s.thread, s[look])} aria-label="Conversation">
      {messages.map((m, i) => {
        const same = i > 0 && messages[i - 1]?.seed === m.seed;
        return (
          <li key={m.id} className={cx(s.msg, look === "full" && m.mine && s.mine, same && s.same)}>
            {same ? <span /> : <Avatar name={m.name} seed={m.seed} size="talk" />}
            <span className={s.body}>
              {same ? null : (
                <span className={s.who}>
                  {m.mine && look === "full" ? "You" : m.name}
                  <time title={m.full}>{m.at}</time>
                </span>
              )}
              <span className={s.bubble}>{m.body}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
  if (compose === undefined) return list;
  return (
    <div className={s.talk}>
      {list}
      <label className={s.compose}>
        <textarea rows={1} placeholder={compose} aria-label={compose} />
        <span className={s.send}>Send</span>
      </label>
    </div>
  );
}

// The reply box under a conversation: Linear's, one line of text with Send at its right end,
// growing as you type. In a full-height column it sits at the foot and stays there while the
// thread above it scrolls. The draft and what a send does are the screen's: it holds the text,
// and decides when to clear it.
import { Button } from "./Button";
import s from "./Composer.module.css";

export interface ComposerProps {
  /** Its accessible name and placeholder ("Say something to Bea and Cy"). */
  label: string;
  /** The draft. */
  value: string;
  onChange: (text: string) => void;
  /** Send the draft: the button, or Ctrl/Cmd+Enter. */
  onSend: () => void;
}

export function Composer({ label, value, onChange, onSend }: ComposerProps) {
  return (
    <div className={s.compose}>
      {/* the label wraps the text and the box's padding round it (a click there focuses it); Send
          beside it */}
      <label className={s.text}>
        <textarea
          rows={1}
          placeholder={label}
          aria-label={label}
          value={value}
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
          }}
        />
      </label>
      <span className={s.send}>
        <Button size="sm" onClick={onSend}>
          Send
        </Button>
      </span>
    </div>
  );
}

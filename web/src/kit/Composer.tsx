// The reply box under a conversation: Linear's, one line of text with Send at its right end,
// growing as you type. In a full-height column it sits at the foot and stays there while the
// thread above it scrolls. What a send does is the screen's.
import { useState } from "react";

import { Button } from "./Button";
import s from "./Composer.module.css";

export interface ComposerProps {
  /** Its accessible name and placeholder ("Say something to Bea and Cy"). */
  label: string;
  /** Send the text; none: Send does nothing yet. */
  onSend?: (text: string) => void;
}

export function Composer({ label, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const send = () => {
    if (!onSend || text.trim() === "") return;
    onSend(text);
    setText("");
  };
  return (
    <div className={s.compose}>
      <textarea
        rows={1}
        placeholder={label}
        aria-label={label}
        value={text}
        onChange={(e) => {
          setText(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
        }}
      />
      <Button size="sm" onClick={send}>
        Send
      </Button>
    </div>
  );
}

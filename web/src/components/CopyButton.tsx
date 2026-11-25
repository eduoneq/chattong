import { useState } from "react";
import { copyText } from "../lib/clipboard";

export function CopyButton({ value, label = "복사" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function onClick() {
    await copyText(value);
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      type="button"
      className={done ? "copy done" : "copy"}
      onClick={onClick}
      aria-label={done ? "복사됨" : `${label}: ${value.replace(/\s+/g, " ").slice(0, 80)}`}
    >
      {done ? "복사됨" : label}
    </button>
  );
}

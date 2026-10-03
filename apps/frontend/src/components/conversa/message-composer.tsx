"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitting,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitting?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function submitIfPossible() {
    if (!value.trim() || submitting) return;
    onSubmit();
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitIfPossible();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitIfPossible();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="max-h-[7.5rem] min-h-10 flex-1 resize-none rounded-3xl border border-black/10 bg-black/[.03] px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15 dark:border-white/15 dark:bg-white/[.06] dark:focus:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={submitting || !value.trim()}
        aria-label="Enviar mensagem"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:opacity-90 disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LIMITS } from "@/shared/schemas";
import { cn } from "@/lib/utils";

interface PromptBoxProps {
  disabled?: boolean;
  submitting: boolean;
  error: string;
  onDismissError: () => void;
  /** Resolve true if sent; false to keep the text for retry. */
  onSend: (text: string) => Promise<boolean>;
}

export const PromptBox = ({ disabled, submitting, error, onDismissError, onSend }: PromptBoxProps) => {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const trimmed = text.trim();
  const tooLong = trimmed.length > LIMITS.message.max;
  const canSend = !!trimmed && !tooLong && !submitting && !disabled;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    setText("");
    const ok = await onSend(trimmed);
    if (!ok) setText(trimmed);
    ref.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-4xl space-y-2">
      {error && <Alert onDismiss={onDismissError}>{error}</Alert>}
      <div className={cn("rounded-[1.75rem] border bg-card shadow-xl shadow-primary/10 transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-ring/15", tooLong && "border-destructive")}>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) onDismissError();
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? "Select or create a chat to start" : "Enter your message"}
          aria-label="Message"
          className="block max-h-50 w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className={cn("text-xs", tooLong ? "text-destructive" : "text-muted-foreground")}>
            {tooLong ? `${trimmed.length}/${LIMITS.message.max} — too long` : submitting ? "Waiting for models…" : "Enter to send · Shift+Enter for new line"}
          </span>
          <Button type="submit" size="icon" className="rounded-full" disabled={!canSend} loading={submitting} aria-label="Send message">
            {!submitting && <ArrowUp />}
          </Button>
        </div>
      </div>
    </form>
  );
};

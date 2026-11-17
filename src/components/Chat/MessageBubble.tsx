import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Check, Copy } from "lucide-react";
import type { ChatMessage } from "@/shared/types";
import { cn } from "@/lib/utils";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure context) — silently ignore */
    }
  };
  return (
    <button type="button" onClick={copy} aria-label="Copy message" className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100">
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </button>
  );
};

export const MessageBubble = memo(({ message }: { message: ChatMessage }) => {
  if (message.role === "user")
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-md shadow-primary/20">
          {message.content}
        </div>
      </div>
    );

  return (
    <div className="group flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Bot className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="markdown pt-0.5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}>
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="mt-1 flex"><CopyButton text={message.content} /></div>
      </div>
    </div>
  );
});

export const TypingIndicator = () => (
  <div className="flex gap-3" aria-label="Model is thinking">
    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
      <Bot className="size-4" />
    </div>
    <div className="flex items-center gap-1 rounded-full bg-muted px-4 py-3">
      {[0, 150, 300].map((d) => (
        <span key={d} className={cn("size-1.5 animate-bounce rounded-full bg-primary/60")} style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  </div>
);

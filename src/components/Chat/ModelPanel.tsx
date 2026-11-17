import { useEffect, useRef } from "react";
import { Cpu, MessageCircleDashed } from "lucide-react";
import type { ModelConversation } from "@/shared/types";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageBubble, TypingIndicator } from "./MessageBubble";

export const ModelPanel = ({ conversation, pending }: { conversation: ModelConversation; pending: boolean }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const { model, messages } = conversation;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
      <header className="flex items-center gap-2 border-b px-5 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-primary"><Cpu className="size-4" /></span>
        <h3 className="truncate text-sm font-semibold">{model}</h3>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {messages.filter((m) => m.role === "assistant").length} replies
        </span>
      </header>
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 && !pending ? (
          <EmptyState className="h-full" icon={MessageCircleDashed} title="No messages yet" description={`Ask ${model} anything to get started.`} />
        ) : (
          messages.map((m, i) => <MessageBubble key={i} message={m} />)
        )}
        {pending && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </section>
  );
};

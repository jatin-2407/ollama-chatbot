import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, MessagesSquare, Plus, SearchX } from "lucide-react";
import type { ChatSummary, ModelConversation } from "@/shared/types";
import { Sidebar } from "../Chat/Sidebar";
import { CreateChatDialog } from "../Chat/CreateChatDialog";
import { ModelPanel } from "../Chat/ModelPanel";
import { PromptBox } from "../Chat/PromptBox";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/services";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const appendTo = (convs: ModelConversation[], pick: (i: number) => ModelConversation["messages"][number] | undefined) =>
  convs.map((c, i) => {
    const msg = pick(i);
    return msg ? { ...c, messages: [...c.messages, msg] } : c;
  });

export const Chat = () => {
  const { chat_id: chatId } = useParams<{ chat_id: string }>();
  const navigate = useNavigate();

  const chats = useAsync(api.listChats, [], []);
  const conv = useAsync(chatId ? (s) => api.getChat(chatId, s) : null, [], [chatId]);

  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<ChatSummary | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = chats.data.find((c) => c._id === chatId);

  const handleCreated = (chat: ChatSummary) => {
    setCreating(false);
    chats.setData((prev) => [chat, ...prev.filter((c) => c._id !== chat._id)]);
    navigate(`/chat/${chat._id}`);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await api.deleteChat(toDelete._id);
    chats.setData((prev) => prev.filter((c) => c._id !== toDelete._id));
    if (toDelete._id === chatId) navigate("/chat");
  };

  const handleSend = useCallback(
    async (text: string) => {
      if (!chatId) return false;
      const snapshot = conv.data;
      setSending(true);
      setSendError("");
      conv.setData((prev) => appendTo(prev, () => ({ role: "user", content: text })));
      try {
        const replies = await api.sendMessage({ chatId, message: text });
        conv.setData((prev) => appendTo(prev, (i) => replies[i]));
        return true;
      } catch (e) {
        conv.setData(snapshot); // roll back the optimistic message
        setSendError(errorMessage(e, "Failed to send message."));
        return false;
      } finally {
        setSending(false);
      }
    },
    [chatId, conv],
  );

  const renderMain = () => {
    if (!chatId)
      return (
        <EmptyState
          className="flex-1"
          icon={MessagesSquare}
          title="Start a conversation"
          description="Create a chat and pick one or two local models to get started."
          action={<Button onClick={() => setCreating(true)}><Plus /> New chat</Button>}
        />
      );

    if (conv.loading)
      return (
        <div className="flex flex-1 gap-3 py-3">
          {[0, 1].map((i) => <Skeleton key={i} className="flex-1 rounded-3xl" />)}
        </div>
      );

    if (conv.error)
      return (
        <EmptyState
          className="flex-1"
          icon={SearchX}
          title="Couldn't open this chat"
          description={conv.error}
          action={<div className="flex gap-2"><Button variant="outline" onClick={() => navigate("/chat")}>Back</Button><Button onClick={conv.reload}>Try again</Button></div>}
        />
      );

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 py-3 md:flex-row">
        {conv.data.map((c) => <ModelPanel key={c.model} conversation={c} pending={sending} />)}
      </div>
    );
  };

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/25 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={cn("fixed inset-y-3 left-3 z-40 w-72 shrink-0 transition-transform md:static md:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-[110%]")}>
        <Sidebar
          chats={chats.data}
          loading={chats.loading}
          error={chats.error}
          onRetry={chats.reload}
          onNewChat={() => setCreating(true)}
          onDelete={setToDelete}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass flex h-14 shrink-0 items-center gap-3 rounded-2xl border px-4">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu />
          </Button>
          <h1 className="truncate text-[15px] font-semibold">{current?.title ?? (chatId ? "Chat" : "Welcome")}</h1>
        </header>

        {renderMain()}

        <div className="shrink-0 pb-1">
          <PromptBox
            disabled={!chatId || conv.loading || !!conv.error}
            submitting={sending}
            error={sendError}
            onDismissError={() => setSendError("")}
            onSend={handleSend}
          />
        </div>
      </main>

      <CreateChatDialog open={creating} onClose={() => setCreating(false)} onCreated={handleCreated} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete chat?"
        description={`"${toDelete?.title}" and its messages will be permanently removed.`}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

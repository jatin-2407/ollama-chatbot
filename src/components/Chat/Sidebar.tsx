import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, MessageSquare, MessagesSquare, Plus, Search, SearchX, Trash2, X } from "lucide-react";
import type { ChatSummary } from "@/shared/types";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  chats: ChatSummary[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onNewChat: () => void;
  onDelete: (chat: ChatSummary) => void;
  onNavigate?: () => void;
}

export const Sidebar = ({ chats, loading, error, onRetry, onNewChat, onDelete, onNavigate }: SidebarProps) => {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
  }, [chats, search]);

  const renderList = () => {
    if (loading) return <div className="space-y-2 px-1">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>;

    if (error)
      return (
        <div className="mx-1 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <p className="text-sidebar-foreground">{error}</p>
          <button type="button" onClick={onRetry} className="mt-2 text-xs font-semibold text-primary hover:underline">Try again</button>
        </div>
      );

    if (filtered.length === 0)
      return search ? (
        <EmptyState tone="dark" icon={SearchX} title="No matches" description="Try a different title." />
      ) : (
        <EmptyState tone="dark" icon={MessagesSquare} title="No conversations yet" description="Start a new chat to see it here." />
      );

    return (
      <ul className="space-y-0.5">
        {filtered.map((chat) => (
          <li key={chat._id}>
            <NavLink
              to={`/chat/${chat._id}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-sidebar-muted hover:bg-muted hover:text-sidebar-foreground",
                )
              }
            >
              <MessageSquare className="size-4 shrink-0 opacity-70" />
              <span className="min-w-0 flex-1 truncate">{chat.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(chat);
                }}
                aria-label={`Delete ${chat.title}`}
                className="rounded-md p-1 text-sidebar-muted transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </NavLink>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col rounded-3xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
      <div className="px-4 pt-5">
        <Logo subtitle="Your chat history" />
        <Button onClick={onNewChat} size="lg" className="mt-5 w-full">
          <Plus /> New chat
        </Button>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 ring-primary/30 transition focus-within:ring-2">
          <Search className="size-4 shrink-0 text-sidebar-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="w-full bg-transparent text-sm outline-none placeholder:text-sidebar-muted"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-sidebar-muted hover:text-sidebar-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
        <span>Recent</span>
        {!loading && !error && <span>{chats.length}</span>}
      </div>
      <nav className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 pb-4">{renderList()}</nav>

      <div className="m-2 flex items-center gap-3 rounded-2xl bg-muted px-3 py-2.5">
        <Avatar name={user} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{user}</span>
        <ThemeToggle />
        <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" className="rounded-lg p-2 text-sidebar-muted transition hover:bg-card hover:text-sidebar-foreground">
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
};

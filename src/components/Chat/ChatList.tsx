
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useAuth } from "../Contexts/authContext";
import { useNavigate, useParams } from "react-router-dom";
import CreateChatDialog from "./CreateChatDialog";

interface IChatItem {
    _id: string;
    title: string;
}

interface IChatListResponse {
    message: string;
    data: IChatItem[];
}

const API_URL = "http://localhost:3000/api/v1/chat";

export const ChatList = () => {
    const [chats, setChats] = useState<IChatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const navigate = useNavigate();
    const { authToken } = useAuth();
    const { chat_id: curChat } = useParams<{ chat_id: string }>();

    // Fetch chats
    const fetchChats = async (signal?: AbortSignal) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/list`, {
                headers: {
                    "auth-token": authToken,
                },
                signal,
            });

            if (!res.ok) {
                throw new Error("Unable to load your conversations.");
            }

            const data: IChatListResponse = await res.json();
            setChats(data.data ?? []);

        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchChats(controller.signal);

        return () => controller.abort();
    }, [authToken]);

    // Search filtering
    const filteredChats = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return chats;

        return chats.filter((chat) =>
            chat.title.toLowerCase().includes(query)
        );
    }, [chats, search]);


    const handleDelete = async (
        e: React.MouseEvent<HTMLButtonElement>,
        chatId: string
    ) => {
        e.stopPropagation();

        setDeletingId(chatId);
        setError("");

        try {
            const res = await fetch(`${API_URL}/${chatId}`, {
                method: "DELETE",
                headers: {
                    "auth-token": authToken,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to delete conversation.");
            }

            setChats((prev) =>
                prev.filter((chat) => chat._id !== chatId)
            );

            if (curChat === chatId) {
                navigate("/chat");
            }

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Create chat callback
    const handleCreate = (chatId: string) => {
        setShowDialog(false);

        setChats((prev) => {
            if (prev.some((chat) => chat._id === chatId)) {
                return prev;
            }

            return [
                {
                    _id: chatId,
                    title: "New chat",
                },
                ...prev,
            ];
        });

        navigate(`/chat/${chatId}`);
    };

    return (
        <>
            <aside className="flex h-full w-full flex-col bg-[#171717] text-gray-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-5 pt-6">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-white">
                            Ollama Chat
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Your chat history
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDialog(true)}
                        title="Create new chat"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 bg-[#242424] text-lg text-gray-300 transition hover:border-gray-500 hover:bg-[#333333] hover:text-white"
                    >
                        +
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pt-5">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-[#202020] px-3 py-2.5 transition focus-within:border-gray-600">

                        <svg
                            className="h-4 w-4 shrink-0 text-gray-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="text-gray-500 hover:text-white"
                                aria-label="Clear search"
                            >
                                x
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat List */}
                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-6">

                    <div className="mb-3 flex items-center justify-between px-2">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                            Recent chats
                        </span>

                        <span className="text-xs text-gray-600">
                            {chats.length}
                        </span>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-2 px-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 animate-pulse rounded-xl bg-[#222222]"
                                />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mx-1 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
                            <p className="text-sm text-red-400">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => fetchChats()}
                                className="mt-3 text-xs font-semibold text-white underline underline-offset-4"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filteredChats.length === 0 && (
                        <div className="flex flex-col items-center px-4 py-12 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#252525] text-2xl">
                                {search ? "⌕" : "💬"}
                            </div>

                            <p className="text-sm font-medium text-gray-300">
                                {search
                                    ? "No conversations found"
                                    : "No conversations yet"}
                            </p>

                            <p className="mt-2 text-xs leading-relaxed text-gray-500">
                                {search
                                    ? "Try searching with another title."
                                    : "Start a new chat to see your conversations here."}
                            </p>
                        </div>
                    )}

                    {/* Conversations */}
                    {!loading && !error && filteredChats.length > 0 && (
                        <div className="space-y-1">
                            {filteredChats.map((chat) => {
                                const isActive = curChat === chat._id;
                                const isDeleting = deletingId === chat._id;

                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() =>
                                            navigate(`/chat/${chat._id}`)
                                        }
                                        className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 transition ${
                                            isActive
                                                ? "bg-[#303030] text-white"
                                                : "text-gray-400 hover:bg-[#242424] hover:text-gray-100"
                                        }`}
                                    >
                                        <svg
                                            className="h-4 w-4 shrink-0 opacity-70"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        >
                                            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
                                        </svg>

                                        <span className="min-w-0 flex-1 truncate text-sm">
                                            {chat.title}
                                        </span>

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={(e) =>
                                                handleDelete(e, chat._id)
                                            }
                                            aria-label={`Delete ${chat.title}`}
                                            title="Delete conversation"
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                                        >
                                            {isDeleting ? (
                                                <span className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
                                            ) : (
                                                <svg
                                                    className="h-4 w-4"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path d="M3 6h18" />
                                                    <path d="M8 6V4h8v2" />
                                                    <path d="m19 6-1 14H6L5 6" />
                                                    <path d="M10 11v5M14 11v5" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 px-5 py-4">
                    <p className="text-center text-[11px] text-gray-600">
                        Your conversations, all in one place.
                    </p>
                </div>
            </aside>

            {/* Create Chat Modal */}
            {showDialog && (
                <CreateChatDialog
                    onClose={() => setShowDialog(false)}
                    onCreate={handleCreate}
                />
            )}
        </>
    );
};

export default ChatList;

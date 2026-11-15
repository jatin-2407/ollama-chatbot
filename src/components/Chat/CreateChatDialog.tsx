import {
    useState,
    useEffect,
    useRef,
    type MouseEvent as ReactMouseEvent,
    type SubmitEvent
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/authContext";

interface IProps {
    onClose: () => void;
    onCreate: (chatId: string) => void;
}

interface ChatModel {
    name: string;
}

interface ModelsResponse {
    models: ChatModel[];
}

interface CreateChatResponse {
    data: {
        _id: string;
    };
}

const API_URL = "http://localhost:3000/api/v1/chat";
const MAX_MODELS = 2;

export const CreateChatDialog = ({ onClose, onCreate }: IProps) => {
    const [title, setTitle] = useState("");
    const [models, setModels] = useState<ChatModel[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { authToken } = useAuth();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchModels = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`${API_URL}/models`, {
                    headers: { "auth-token": authToken },
                    signal: controller.signal
                });

                if (!res.ok) throw new Error("Failed to fetch models");

                const data: ModelsResponse = await res.json();
                setModels(data.models ?? []);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                setError("Unable to load available models.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchModels();
        return () => controller.abort();
    }, [authToken]);

    useEffect(() => {
        const handleOutsideClick = (e: globalThis.MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (dropdownOpen) setDropdownOpen(false);
                else if (!submitting) onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [dropdownOpen, submitting, onClose]);

    useEffect(() => {
        if (dropdownOpen) searchRef.current?.focus();
    }, [dropdownOpen]);

    const toggleModel = (name: string) => {
        setSelected((prev) => {
            if (prev.includes(name)) {
                return prev.filter((model) => model !== name);
            }

            if (prev.length >= MAX_MODELS) return prev;
            return [...prev, name];
        });
    };

    const removeModel = (name: string) => {
        setSelected((prev) => prev.filter((model) => model !== name));
    };

    const filteredModels = models.filter((model) =>
        model.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (submitting) return;

        if (!title.trim()) {
            setError("Please enter a chat title.");
            return;
        }

        if (selected.length === 0) {
            setError("Please select at least one model.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": authToken
                },
                body: JSON.stringify({
                    title: title.trim(),
                    model_names: selected
                })
            });

            if (!res.ok) throw new Error("Failed to create chat");

            const result: CreateChatResponse = await res.json();
            const chatId = result.data?._id;

            if (!chatId) throw new Error("Invalid server response");

            onCreate(chatId);
            onClose();
            navigate(`/chat/${chatId}`);
        } catch {
            setError("Something went wrong while creating your chat.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdropClick = (
        e: ReactMouseEvent<HTMLDivElement>
    ) => {
        if (e.target === e.currentTarget && !submitting) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onMouseDown={handleBackdropClick}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-chat-title"
                className="w-full max-w-lg overflow-visible rounded-2xl border border-white/10 bg-[#151515] shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 id="create-chat-title" className="text-xl font-semibold text-white">
                            Create a new chat
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Choose models and start a conversation.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close dialog"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        X
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div>
                        <label htmlFor="chat-title" className="mb-2 block text-sm font-medium text-gray-300">
                            Chat title
                        </label>
                        <input
                            id="chat-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Research assistant"
                            maxLength={100}
                            className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">
                                Select models
                            </label>
                            <span className="text-xs text-gray-500">
                                {selected.length}/{MAX_MODELS} selected
                            </span>
                        </div>

                        <div className="flex min-h-8 flex-wrap gap-2">
                            {selected.map((model) => (
                                <span
                                    key={model}
                                    className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300"
                                >
                                    {model}
                                    <button
                                        type="button"
                                        onClick={() => removeModel(model)}
                                        aria-label={`Remove ${model}`}
                                        className="transition hover:text-white"
                                    >
                                        x
                                    </button>
                                </span>
                            ))}

                            {selected.length === 0 && (
                                <span className="text-xs text-gray-500">
                                    No models selected yet.
                                </span>
                            )}
                        </div>

                        <div ref={dropdownRef} className="relative">
                            <button
                                type="button"
                                disabled={loading || models.length === 0}
                                aria-expanded={dropdownOpen}
                                onClick={() => {
                                    setDropdownOpen((prev) => !prev);
                                    setSearch("");
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-gray-400 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>
                                    {loading ? "Loading models..." : "Add a model"}
                                </span>
                                <span className="text-xs">
                                    {dropdownOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#202020] shadow-2xl">
                                    <div className="border-b border-white/10 p-2">
                                        <input
                                            ref={searchRef}
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search models..."
                                            className="w-full rounded-lg bg-[#151515] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="max-h-52 overflow-y-auto p-1">
                                        {filteredModels.map((model) => {
                                            const isSelected = selected.includes(model.name);
                                            const disabled = !isSelected && selected.length >= MAX_MODELS;

                                            return (
                                                <button
                                                    key={model.name}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => toggleModel(model.name)}
                                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <span>{model.name}</span>
                                                    {isSelected && (
                                                        <span className="text-indigo-400">✓</span>
                                                    )}
                                                    {disabled && (
                                                        <span className="text-xs text-gray-600">
                                                            Limit reached
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {filteredModels.length === 0 && (
                                            <p className="p-4 text-center text-sm text-gray-500">
                                                No models found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-500">
                            You can select up to two models for comparison.
                        </p>
                    </div>

                    {error && (
                        <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || submitting || !title.trim() || selected.length === 0}
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Creating..." : "Create chat →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChatDialog;

import {
    Send,
    Loader2,
    AlertCircle,
} from "lucide-react";

import {
    useState,
    useRef,
    useEffect,
    type ChangeEvent,
    type KeyboardEvent,
    type SubmitEvent,
} from "react";

import { useAuth } from "./Contexts/authContext";

interface IMessage {
    role: "user" | "assistant";
    content: string;
}

interface PromptProps {
    chatId?: string;
    onNewMessage: (message: IMessage) => void;
    onNewResponse: (messages: IMessage[]) => void;
}

interface SendMessageResponse {
    response: IMessage[];
}

const API_URL = "http://localhost:3000/api/v1/message/send";

export const PromptBox = ({
    chatId,
    onNewMessage,
    onNewResponse,
}: PromptProps) => {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { authToken } = useAuth();

    // Auto resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, [text]);

    const handleTextChange = (
        e: ChangeEvent<HTMLTextAreaElement>
    ) => {
        setText(e.target.value);
        setError("");
    };

    const handleSubmit = async (
        e?: SubmitEvent
    ) => {
        e?.preventDefault();

        const message = text.trim();

        if (!message || submitting) return;

        setSubmitting(true);
        setError("");
        setText("");

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        // Optimistically display user message
        onNewMessage({
            role: "user",
            content: message,
        });

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": authToken,
                },
                body: JSON.stringify({
                    chatId,
                    message,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to send message.");
            }

            const result: SendMessageResponse = await res.json();

            onNewResponse(result.response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while sending your message."
            );

            // Restore message so the user can retry
            setText(message);
        } finally {
            setSubmitting(false);
            textareaRef.current?.focus();
        }
    };

    // Enter sends, Shift + Enter creates a new line
    const handleKeyDown = (
        e: KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
        }
    };

    return (
        <div className="w-full px-4 pb-5">

            {/* Error message */}
            {error && (
                <div
                    role="alert"
                    className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                    <AlertCircle size={17} />
                    <span>{error}</span>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-3xl"
            >
                <div className="group relative rounded-3xl border border-gray-300 bg-white shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:shadow-md dark:border-gray-700 dark:bg-[#252525] dark:focus-within:border-gray-500">

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        disabled={submitting}
                        placeholder="Message anything..."
                        rows={1}
                        maxLength={10000}
                        className="block max-h-50 min-h-15 w-full resize-none bg-transparent px-5 pb-2 pt-5 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-gray-100 dark:placeholder:text-gray-500"
                    />

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between px-4 pb-3">

                        <div className="flex items-center gap-2">
                            {submitting ? (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Thinking...
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">
                                    Shift + Enter for a new line
                                </span>
                            )}
                        </div>

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={!text.trim() || submitting}
                            aria-label="Send message"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:scale-105 hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:scale-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                        >
                            {submitting ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Send size={17} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer hint */}
                <p className="mt-3 text-center text-[11px] text-gray-400">
                    AI can make mistakes. Verify important information.
                </p>
            </form>
        </div>
    );
};

export default PromptBox;

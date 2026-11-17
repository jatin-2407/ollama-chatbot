
import { useParams } from "react-router-dom";
import { ChatList } from "../Chat/ChatList";
import { PromptBox, type IMessage } from "../PromptBox";
import MessageList from "../Chat/MessageList";
import { useEffect, useState } from "react";
import { useAuth } from "../Contexts/authContext";

const API_URL = "http://localhost:3000/api/v1/chat";

type TMessagesResponse = Array<{
    model: string;
    messages: IMessage[];
}>;

export const Chat = () => {
    const { chat_id: curChat } = useParams<{ chat_id: string }>();
    const { authToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [chatData, setChatData] = useState<TMessagesResponse>([]);

    const fetchChats = async (signal?: AbortSignal) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/${curChat}`, {
                headers: {
                    "auth-token": authToken,
                },
                signal,
            });

            if (!res.ok) {
                throw new Error("Unable to load your conversations.");
            }

            const data = await res.json();
            setChatData(data.data);

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

        setChatData([]);
        fetchChats(controller.signal);

        return () => controller.abort();
    }, [authToken, curChat]);

    const messages = chatData[0]?.messages || [];

    return (
        <div className="h-screen flex overflow-hidden">

            {/* Sidebar */}
            <aside className="w-[15%] border-r shrink-0">
                <ChatList />
            </aside>

            {/* Main Chat Area */}
            <main className="w-[85%] flex flex-col min-w-0">

                <div className="flex gap-4 flex-1 min-h-0 p-4">
                    {chatData.slice(0, 2).map((chat) => (
                        <div
                            key={chat.model}
                            className="flex-1 min-w-0 border rounded-xl flex flex-col overflow-hidden"
                        >
                            {/* Model name */}
                            <div className="p-3 border-b font-semibold bg-gray-50">
                                {chat.model}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <MessageList messages={chat.messages} />
                            </div>
                        </div>
                    ))}
                </div>


                {/* Prompt Input */}
                <div className="border-t p-4">
                    <PromptBox
                        chatId={curChat}
                        onNewMessage={(message) => {
                            setChatData(prev =>
                                prev.map(chat => ({
                                    ...chat,
                                    messages: [...chat.messages, message]
                                }))
                            );
                        }}
                        onNewResponse={(messages) => {
                            setChatData((prev) => {
                                const curData: TMessagesResponse = [...prev];
                                messages.forEach((msg, index) => {
                                    if (curData[index] && Array.isArray(curData[index].messages)) {
                                        curData[index].messages = [...curData[index].messages, msg];
                                    }

                                })
                                return curData

                            })

                        }}
                    />
                </div>

            </main>
        </div>
    );
};

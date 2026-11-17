/** API contract shared by client and server. */

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
    role: Role;
    content: string;
}

export interface ModelConversation {
    model: string;
    messages: ChatMessage[];
}

export interface ChatSummary {
    _id: string;
    title: string;
}

export interface ModelInfo {
    name: string;
    size?: number;
}

/** Every error response has this shape. */
export interface ApiErrorBody {
    message: string;
    errors?: Record<string, string>;
}

export interface SignInResponse {
    message: string;
    user: string;
    token: string;
}

export interface DataResponse<T> {
    message: string;
    data: T;
}

export interface SendMessageResponse {
    chatId: string;
    response: ChatMessage[];
}

export const AUTH_HEADER = "auth-token";

export const API = {
    signup: "/api/v1/signup",
    signin: "/api/v1/signIn",
    models: "/api/v1/chat/models",
    chatList: "/api/v1/chat/list",
    chatCreate: "/api/v1/chat/create",
    chat: (id = ":chat_id") => `/api/v1/chat/${id}`,
    sendMessage: "/api/v1/message/send",
} as const;

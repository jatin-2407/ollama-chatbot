import { request } from "./api";
import {
    API,
    type ChatSummary,
    type DataResponse,
    type ModelConversation,
    type ModelInfo,
    type SendMessageResponse,
    type SignInResponse,
} from "@/shared/types";
import type { CreateChatRequest, LoginRequest, SendMessageRequest, SignupRequest } from "@/shared/schemas";

/** Typed client for every backend endpoint. */
export const api = {
    signup: (body: SignupRequest) => request<{ message: string }>(API.signup, { method: "POST", body }),
    signin: (body: LoginRequest) => request<SignInResponse>(API.signin, { method: "POST", body }),

    listModels: (signal?: AbortSignal) =>
        request<{ models: ModelInfo[] }>(API.models, { signal }).then((r) => r.models ?? []),
    listChats: (signal?: AbortSignal) =>
        request<DataResponse<ChatSummary[]>>(API.chatList, { signal }).then((r) => r.data ?? []),
    getChat: (id: string, signal?: AbortSignal) =>
        request<DataResponse<ModelConversation[]>>(API.chat(id), { signal }).then((r) => r.data ?? []),
    createChat: (body: CreateChatRequest) =>
        request<DataResponse<ChatSummary>>(API.chatCreate, { method: "POST", body }).then((r) => r.data),
    deleteChat: (id: string) => request<DataResponse<ChatSummary>>(API.chat(id), { method: "DELETE" }),

    sendMessage: (body: SendMessageRequest) =>
        request<SendMessageResponse>(API.sendMessage, { method: "POST", body }).then((r) => r.response ?? []),
};

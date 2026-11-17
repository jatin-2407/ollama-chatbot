import type { Controller } from "./types";
import { allowLoggedIn, validateBody } from "@/middlewares/auth";
import { createChat, deleteChat, findOwnedChat, listChats, loadConversations } from "@/services/ChatService";
import { listModels } from "@/services/MessageService";
import { createChatSchema, type CreateChatRequest } from "@/shared/schemas";
import { API } from "@/shared/types";
import { HttpError, ok } from "@/utils/http";

export const chatController: Controller = {
    get: {
        [API.models]: allowLoggedIn(async (c) => {
            const models = await listModels().catch((e) => {
                console.error("ollama.list failed", e);
                throw new HttpError(503, "Couldn't reach Ollama. Make sure it is running.");
            });
            return c.json({ models }, 200);
        }),

        [API.chatList]: allowLoggedIn(async (c) => ok(c, await listChats(c.get("user")._id), "Chats fetched")),

        [API.chat()]: allowLoggedIn(async (c) => {
            const chat = await findOwnedChat(c.get("user")._id, c.req.param("chat_id"));
            const { conversations } = await loadConversations(chat);
            return ok(c, conversations, "Chat fetched");
        }),
    },
    delete: {
        [API.chat()]: allowLoggedIn(async (c) => {
            const chat = await deleteChat(c.get("user")._id, c.req.param("chat_id"));
            return ok(c, { _id: chat.id, title: chat.title }, "Chat deleted");
        }),
    },
    post: {
        [API.chatCreate]: allowLoggedIn(validateBody(createChatSchema)(async (c) => {
            const { title, model_names } = c.get("body") as CreateChatRequest;
            const chat = await createChat(c.get("user")._id, title, model_names);
            return ok(c, { _id: chat.id, title: chat.title }, "Chat created", 201);
        })),
    },
};

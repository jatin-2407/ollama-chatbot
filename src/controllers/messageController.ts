import type { Controller } from "./types";
import { allowLoggedIn, validateBody } from "@/middlewares/auth";
import { askModel, writeHistory } from "@/services/MessageService";
import { findOwnedChat, loadConversations } from "@/services/ChatService";
import { sendMessageSchema, type SendMessageRequest } from "@/shared/schemas";
import { API, type SendMessageResponse } from "@/shared/types";
import { HttpError } from "@/utils/http";

export const messageController: Controller = {
    post: {
        [API.sendMessage]: allowLoggedIn(validateBody(sendMessageSchema)(async (c) => {
            const { chatId, message } = c.get("body") as SendMessageRequest;

            const chat = await findOwnedChat(c.get("user")._id, chatId);
            const { files, conversations } = await loadConversations(chat);

            const withPrompt = conversations.map((conv) => ({
                ...conv,
                messages: [...conv.messages, { role: "user" as const, content: message }],
            }));

            // ask all models in parallel; nothing is saved unless every model answers
            const response = await Promise.all(
                withPrompt.map((conv) =>
                    askModel(conv).catch((e) => {
                        console.error(`Model ${conv.model} failed`, e);
                        throw new HttpError(502, `Model "${conv.model}" failed to respond. Please try again.`);
                    }),
                ),
            );

            try {
                await Promise.all(withPrompt.map((conv, i) =>
                    writeHistory(files[i]!, { ...conv, messages: [...conv.messages, response[i]!] })));
                await chat.updateOne({ $currentDate: { updatedAt: true } }); // bump to top of the list
            } catch (e) {
                console.error("Failed to persist chat", e);
                throw new HttpError(500, "Failed to save the conversation. Please try again.");
            }

            return c.json<SendMessageResponse>({ response, chatId }, 200);
        })),
    },
};

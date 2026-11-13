import type { Controller } from "./types";
import { allowLoggedIn } from "@/middlewares/auth";
import type { Context } from "hono";
import z, { ZodError } from "zod";
import mongoose from "mongoose";
import { type ChatRequest, type ChatResponse, type Message } from "ollama";
import { sendMessageToLLM, writeJson } from "@/services/MessageService";
import { loadChat } from "@/services/ChatService";

interface IMessageRequest {
    chatId: string,
    message: string,
}
const messageRequestSchema = z.object({
    chatId: z.string()
        .refine((id) => mongoose.Types.ObjectId.isValid(id), {
            message: "invalid chat",
        }),
    message: z.string().nonempty("message can't be empty").max(255, "message is too long"),
});

const validateMessageRequest = async (c: Context): Promise<IMessageRequest | ZodError> => {
    const data = await c.req.json();
    const res = messageRequestSchema.safeParse(data);
    if (res.error) {
        return res.error;
    };
    return data;
}

export const messageController: Controller = {
    post: {
        "/send":
            allowLoggedIn(async (c) => {
                //validae the request
                const res = await validateMessageRequest(c);
                if (res instanceof ZodError) {
                    return c.json({ error: res }, 400);
                }

                const { loadingFails, chats, fileNames } = await loadChat(res.chatId);
                if (loadingFails) {
                    return c.json({ error: 'fail to load chat messages' }, 500);
                }

                let messageFail = false;
                let response: Array<Message & { role: string, content: string }> = []
                for (let i = 0; i < chats.length; i++) {
                    const chat = chats[i];
                    if (chat)
                        try {
                            chat?.messages?.push({ role: 'user', content: res.message });
                            const reply = await sendMessageToLLM(chat);
                            response.push(reply);
                            chat.messages?.push(reply)
                        } catch (e) {
                            console.log("error", e)
                            messageFail = true;
                            break;
                        }

                }


                if (messageFail) {
                    return c.json({ error: 'fail  to get chat response' }, 500);
                }

                for (let i = 0; i < fileNames.length; i++) {
                    try {
                        writeJson(fileNames[i] || "", chats[i]);
                    } catch {
                        return c.json({ error: 'fail  to save chat response,try again' }, 500);
                    }
                }


                return c.json({
                    response,
                    chatId: res.chatId,
                }, 200);

            })
    },
};



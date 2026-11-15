import type { Controller, MiddleWare } from "./types";
import { allowLoggedIn } from "@/middlewares/auth";
import type { Context } from "hono";
import z from "zod";
import { createChat, deleteChat, listChats, loadChat } from "@/services/ChatService";
import ollama from "ollama";

interface IChatRequest {
    title: string,
    model_names: string[],
}
const chatSchema = z.object({
    title: z.string().nonempty("titel is required").min(3, "title should be minimum of 3 chars").max(50, "title should be maximum of 50 chars"),
    model_names: z.array(z.string().nonempty("model name cant be empty")).nonempty("model names are required").min(1, "Model name cant be empty").max(2, "only  two models are allowed at a time"),
});

const validateChatRequest = async (c: Context): Promise<IChatRequest | undefined> => {
    try {
        const data = await c.req.json<IChatRequest>();
        const res = chatSchema.safeParse(data);
        if (res.error) {
            return;
        };
        return data;
    } catch (e) {
        console.log({ error: e });
        return;
    }
}




export const chatController: Controller = {
    get: {
        "/api/v1/chat/models": allowLoggedIn(async (c) => {
            try {
                const { models } = await ollama.list();
                return c.json({
                    models
                }, 200);
            } catch (e) {

                return c.json({
                    models: []
                }, 500);
            }


        }),
        "/api/v1/chat/list":
            allowLoggedIn(async (c) => {
                try {
                    const chats = await listChats();
                    return c.json({
                        message: 'Chat fetched successfully!',
                        data: chats
                    }, 200);

                } catch (e: unknown) {
                    return c.json({
                        message: 'Internal server error',
                    }, 500);
                }
            }),
        "/api/v1/chat/:chat_id":
            allowLoggedIn(async (c) => {
                //todo optimize this for pagination and model wise message selection 
                try {

                    const { loadingFails, chats } = await loadChat(c.req.param("chat_id") || "");

                    if (loadingFails)
                        return c.json({
                            message: 'fail to load chat!',
                        }, 500);


                    return c.json({
                        message: 'Chat fetched successfully!',
                        data: chats
                    }, 200);

                } catch (e: unknown) {
                    return c.json({
                        message: 'Internal server error',
                    }, 500);
                }
            }),
    },
    delete: {
        "/api/v1/chat/:chat_id":
            allowLoggedIn(async (c) => {
                try {
                    const chat = await deleteChat(c.req.param("chat_id") || "");
                    if (!chat)
                        return c.json({
                            message: 'Chat not found!',
                        }, 400);

                    return c.json({
                        message: 'Chat deleted successfully!',
                        data: chat
                    }, 200);

                } catch (e: unknown) {
                    return c.json({
                        message: 'Internal server error',
                    }, 500);
                }
            })
    },
    post: {
        "/api/v1/chat/create":
            allowLoggedIn(async (c: Context) => {

                const res = await validateChatRequest(c);
                if (!res) {
                    return c.json({ error: "Invalid request" }, 400)
                }

                const data = await c.req.json<IChatRequest>();
                const chat = await createChat(data.title, data.model_names);

                return c.json({
                    message: 'Chat created successfully!',
                    data: chat
                }, 201);

            })
    },
};



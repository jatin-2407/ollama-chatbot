import type { Controller, MiddleWare } from "./types";
import { allowLoggedIn } from "@/middlewares/auth";
import type { Context } from "hono";
import z from "zod";
import { createChat, deleteChat, getChat, listChats } from "@/services/ChatService";

interface IChatRequest {
    title: string,
    model_names: string[],
}
const chatSchema = z.object({
    title: z.string().nonempty("titel is required").min(3, "title should be minimum of 3 chars").max(50, "title should be maximum of 50 chars"),
    model_names: z.array(z.string().nonempty("model name cant be empty")).nonempty("model names are required").min(1, "Model name cant be empty").max(2, "only  two models are allowed at a time"),
});

const validateChatRequest: MiddleWare = (handle) => async (c: Context) => {
    const data = await c.req.json();
    const res = chatSchema.safeParse(data);
    if (res.error) {
        return c.json({ error: res.error }, 400);
    };
    return handle(c);
}




export const chatController: Controller = {
    get: {
        "/list":
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
        "/:chat_id":
            allowLoggedIn(async (c) => {
                //todo optimize this for pagination and model wise message selection 
                try {
                    const chat = await getChat(c.req.param("chat_id") || "");
                    if (!chat)
                        return c.json({
                            message: 'Chat not found!',
                        }, 400);

                    return c.json({
                        message: 'Chat fetched successfully!',
                        data: chat
                    }, 200);

                } catch (e: unknown) {
                    return c.json({
                        message: 'Internal server error',
                    }, 500);
                }
            }),
    },
    delete: {
        "/:chat_id":
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
        "/create":
            allowLoggedIn(async (c) => {
                return validateChatRequest(async () => {

                    const data = await c.req.json<IChatRequest>();
                    const chat = await createChat(data.title, data.model_names);

                    return c.json({
                        message: 'Chat created successfully!',
                        data: chat
                    }, 201);

                })(c);
            })
    },
};



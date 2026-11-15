import { Hono } from "hono";
import { dbInit } from "./database";
import { registerController } from "./utils";
import { authController } from "./controllers/auth";
import { chatController } from "./controllers/chatController";
import { messageController } from "./controllers/messageController";

export async function backend(app: Hono) {
    try {
        await dbInit();
        registerController(authController, app);
        registerController(chatController, app);
        registerController(messageController, app);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}


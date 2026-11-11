import { Hono } from "hono";
import { dbInit } from "./database";
import { registerController } from "./utils";
import { authController } from "./controllers/auth";
import { chatController } from "./controllers/chatController";

export async function backend(app: Hono) {
    try {
        await dbInit();
        registerController(authController, app);
        registerController(chatController, app);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}


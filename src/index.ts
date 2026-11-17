import { Hono } from "hono";
import indexHtml from "./index.html";
import { config } from "./config";
import { dbInit } from "./database";
import { registerControllers } from "./utils/router";
import type { AppEnv } from "./controllers/types";
import { authController } from "./controllers/auth";
import { chatController } from "./controllers/chatController";
import { messageController } from "./controllers/messageController";

export async function app() {
    await dbInit();

    const api = new Hono<AppEnv>();
    registerControllers(api, authController, chatController, messageController);

    const server = Bun.serve({
        port: config.port,
        hostname: config.host,
        // client-side routes all serve the SPA
        routes: Object.fromEntries(["/", "/signin", "/signup", "/chat", "/chat/*"].map((r) => [r, indexHtml])),
        fetch: api.fetch,
    });

    if (!config.isTest) console.log(`Server running at ${server.url}`);
    return server;
}

if (!config.isTest) {
    app().catch((e) => {
        console.error("Failed to start server:", e);
        process.exit(1);
    });
}

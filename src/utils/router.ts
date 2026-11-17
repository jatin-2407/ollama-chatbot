import type { Hono } from "hono";
import type { AppEnv, Controller, ControllerMethod } from "@/controllers/types";
import { HttpError, fail } from "./http";

/** Maps HttpError to its status; anything else is logged and returned as a 500. */
const withErrorBoundary = (handler: ControllerMethod): ControllerMethod => async (c) => {
    try {
        return await handler(c);
    } catch (e) {
        if (e instanceof HttpError) return fail(c, e.status, e.message, e.errors);
        console.error(`[${c.req.method} ${c.req.path}]`, e);
        return fail(c, 500, "Internal server error");
    }
};

export const registerControllers = (app: Hono<AppEnv>, ...controllers: Controller[]) => {
    for (const controller of controllers) {
        for (const method of Object.keys(controller) as Array<keyof Controller>) {
            for (const [path, handler] of Object.entries(controller[method] ?? {})) {
                app[method](path, withErrorBoundary(handler));
            }
        }
    }
};

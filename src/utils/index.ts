import type { Controller } from "@/controllers/types";
import type { Hono } from "hono";
import type { HonoRequest } from "hono/request";

export const getRequestBody = async <T>(req: HonoRequest): Promise<T | null> => {
    try {
        return await req.json<T>();
    } catch {
        // empty or malformed JSON body; let schema validation report it as a 400
        return null;
    }
};

export const registerController = (controller: Controller, router: Hono) => {

    const methods = Object.keys(controller) as Array<"get" | "post">;

    methods.forEach((method) => {

        const routes = controller[method];

        if (!routes) return;

        Object.entries(routes).forEach(([path, handle]) => {

            if (typeof router[method] === 'function') {

                router[method](path, handle);

            }

        });

    });

}
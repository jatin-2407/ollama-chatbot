import JWT from "jsonwebtoken";
import type z from "zod";
import type { HonoRequest } from "hono";
import type { MiddleWare } from "@/controllers/types";
import { User, type UserDoc } from "@/database/models";
import { config } from "@/config";
import { validate } from "@/shared/schemas";
import { AUTH_HEADER } from "@/shared/types";
import { fail } from "@/utils/http";

const getAuthUser = async (req: HonoRequest): Promise<UserDoc | null> => {
    const token = req.header(AUTH_HEADER);
    if (!token) return null;
    try {
        const payload = JWT.verify(token, config.jwtSecret);
        if (typeof payload !== "object" || !payload.user) return null;
        return await User.findById(payload.user);
    } catch {
        return null; // expired / tampered token
    }
};

export const blockLoggedIn: MiddleWare = (handler) => async (c) => {
    if (await getAuthUser(c.req)) return fail(c, 400, "You are already signed in");
    return handler(c);
};

export const allowLoggedIn: MiddleWare = (handler) => async (c) => {
    const user = await getAuthUser(c.req);
    if (!user) return fail(c, 401, "Your session has expired. Please sign in again.");
    c.set("user", user);
    return handler(c);
};

/** Validates the JSON body against a shared schema; parsed data is available via `c.get("body")`. */
export const validateBody = (schema: z.ZodType): MiddleWare => (handler) => async (c) => {
    const body = await c.req.json().catch(() => null); // empty/malformed JSON → schema reports 400
    const result = validate(schema, body);
    if (!result.success) {
        return fail(c, 400, Object.values(result.errors)[0] ?? "Validation failed", result.errors);
    }
    c.set("body", result.data);
    return handler(c);
};

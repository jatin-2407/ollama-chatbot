import type { MiddleWare, LoginRequest, ISignUpRequest } from "@/controllers/types";
import { User, type IUser } from "@/database/models";
import { getRequestBody } from "@/utils";
import { loginRequestValidationSchema, signupRequestValidationSchema } from "@/validations/schemas";
import type { Context, HonoRequest } from "hono";
import JWT from 'jsonwebtoken'
import type { ZodError } from "zod";

const isLoggedin = async (req: HonoRequest): Promise<false | IUser> => {
    const authToken = req.header("auth-token") || "";
    try {
        const payload: any = JWT.verify(authToken, process.env.APP_PASSWORD_CODE || "");
        if (!payload || !payload.user) {
            return false;
        }
        const authUser = await User.findOne(payload.user);
        if (!authUser) {
            return false;
        }
        return authUser
    } catch (e: unknown) {
        return false;
    }
}

export const blockLoggedIn: MiddleWare = (handler) => async (c: Context) => {
    const res = await isLoggedin(c.req);
    if (res) {
        return c.json({ error: "Invalid request" }, 400);
    }
    return handler(c)
}

export const allowLoggedIn: MiddleWare = (handler) => async (c: Context) => {
    const res = await isLoggedin(c.req);
    if (res === false) {
        return c.json({ error: "Invalid request" }, 400);
    }
    //set the user for further use
    c.set("user", res as IUser);
    return handler(c)
}


const formatValidationError = (error: ZodError) => {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
        const field = issue.path.join(".") || "body";
        // keep the first message per field
        errors[field] ??= issue.message;
    }
    return {
        error: "Validation failed",
        message: Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join("; "),
        errors,
    };
};

export const validateLoginRequest: MiddleWare = (handler) => async (c) => {

    const body = await getRequestBody<LoginRequest>(c.req);
    const result = loginRequestValidationSchema.safeParse(body);

    if (!result.success) {
        return c.json(formatValidationError(result.error), 400);
    }
    c.set("body", result.data);
    return handler(c);
};


export const validateSignUpRequest: MiddleWare = (handler) => async (c) => {

    const body = await getRequestBody<ISignUpRequest>(c.req);
    const result = signupRequestValidationSchema.safeParse(body);

    if (!result.success) {
        return c.json(formatValidationError(result.error), 400);
    }
    c.set("body", result.data);
    return handler(c);
};
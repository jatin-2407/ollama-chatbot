import type { ILoginRequest, MiddleWare, SignUpRequest } from "@/controllers/types";
import { getRequestBody } from "@/utils";
import { loginRequestValidationSchema, signupRequestValidationSchema } from "@/validations/schemas";

export const authenticateUser: MiddleWare = (handler) => async (c) => {

    const authHeader =
        c.req.header("Authorization");

    if (!authHeader) {
        return c.json({
            message: "Unauthorized",
        }, 401);
    }

    // Your JWT verification would go here

    return handler(c);
};


export const validateLoginRequest: MiddleWare = (handler) => async (c) => {

    const body = await getRequestBody<ILoginRequest>(c.req);
    const result = loginRequestValidationSchema.safeParse(body);

    if (!result.success) {
        return c.json(result.error, 400);
    }
    c.set("body", result.data);
    return handler(c);
};


export const validateSignUpRequest: MiddleWare = (handler) => async (c) => {

    const body = await getRequestBody<SignUpRequest>(c.req);
    const result = signupRequestValidationSchema.safeParse(body);

    if (!result.success) {
        return c.json(result.error, 400);
    }
    c.set("body", result.data);
    return handler(c);
};
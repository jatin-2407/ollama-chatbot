import type { Context } from "hono";
export interface ISignUpRequest {
    name: string,
    email: string;
    password: string;
}

export type LoginRequest = Omit<ISignUpRequest, "name">

export type Variables = { body: LoginRequest | ISignUpRequest; };

export type AppContext = Context<{ Variables: Variables; }>;

export type ControllerMethod = (c: AppContext) => Promise<Response>;

export type MiddleWare = (handler: ControllerMethod) => ControllerMethod;

export type Controller = {
    [key in "get" | "post"]?: {
        [path: string]: ControllerMethod;
    };
};

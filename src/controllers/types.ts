import type { Context } from "hono";
import type { UserDoc } from "@/database/models";

export type AppEnv = { Variables: { body: unknown; user: UserDoc } };

export type AppContext = Context<AppEnv>;

export type ControllerMethod = (c: AppContext) => Promise<Response>;

export type MiddleWare = (handler: ControllerMethod) => ControllerMethod;

export type Controller = Partial<Record<"get" | "post" | "delete", Record<string, ControllerMethod>>>;

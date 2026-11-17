import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiErrorBody } from "@/shared/types";

/** Throw from anywhere in a request; the router turns it into `{ message, errors? }` with this status. */
export class HttpError extends Error {
    constructor(
        public status: ContentfulStatusCode,
        message: string,
        public errors?: Record<string, string>,
    ) {
        super(message);
    }
}

export const fail = (c: Context, status: ContentfulStatusCode, message: string, errors?: Record<string, string>) =>
    c.json<ApiErrorBody>(errors ? { message, errors } : { message }, status);

export const ok = <T>(c: Context, data: T, message = "Success", status: ContentfulStatusCode = 200) =>
    c.json({ message, data }, status);

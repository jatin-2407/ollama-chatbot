import { AUTH_HEADER, type ApiErrorBody } from "@/shared/types";
import { authStorage } from "./authStorage";

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors: Record<string, string> = {},
    ) {
        super(message);
        this.name = "ApiError";
    }
}

const FALLBACK: Record<number, string> = {
    400: "The request was invalid.",
    401: "Your session has expired. Please sign in again.",
    403: "You don't have permission to do that.",
    404: "We couldn't find what you were looking for.",
    500: "Something went wrong on our side. Please try again.",
    502: "The model failed to respond. Please try again.",
    503: "The service is temporarily unavailable.",
};

interface RequestOptions {
    method?: "GET" | "POST" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
}

/** Single fetch wrapper: attaches auth, parses JSON, normalises every failure into ApiError. */
export async function request<T>(path: string, { method = "GET", body, signal }: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    const token = authStorage.get().token;
    if (token) headers[AUTH_HEADER] = token;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let res: Response;
    try {
        res = await fetch(path, { method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) {
        if (isAbort(e)) throw e;
        throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
    }

    const payload = await res.json().catch(() => null) as (T & Partial<ApiErrorBody>) | null;

    if (!res.ok) {
        if (res.status === 401 && token) authStorage.clear();
        throw new ApiError(res.status, payload?.message || FALLBACK[res.status] || `Request failed (${res.status})`, payload?.errors);
    }
    if (payload === null) throw new ApiError(res.status, "The server returned an invalid response.");
    return payload;
}

export const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

export const errorMessage = (e: unknown, fallback = "Something went wrong.") =>
    e instanceof Error && e.message ? e.message : fallback;

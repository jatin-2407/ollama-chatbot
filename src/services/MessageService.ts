import path from "node:path";
import { rm } from "node:fs/promises";
import ollama, { type ChatRequest } from "ollama";
import { config } from "@/config";
import type { ChatMessage } from "@/shared/types";

export type StoredChat = ChatRequest & { messages: ChatMessage[] };

/** Model names can contain "/" (e.g. hf.co/user/model) — keep each history a single file. */
const safe = (name: string) => name.replace(/[\\/]/g, "_");

export const historyFiles = (chatId: string, modelNames: string[]) =>
    modelNames.map((name) => path.join(config.chatDataDir, `${chatId}.${safe(name)}.json`));

/** Returns undefined if the file doesn't exist yet; throws if it's corrupt. */
export const readHistory = async (file: string): Promise<StoredChat | undefined> => {
    const f = Bun.file(file);
    if (!(await f.exists())) return undefined;
    try {
        return await f.json();
    } catch (e) {
        throw new Error(`Invalid JSON in chat history file: ${file}`, { cause: e });
    }
};

export const writeHistory = (file: string, chat: StoredChat) => Bun.write(file, JSON.stringify(chat));

/** Missing files are ignored. */
export const deleteHistory = (files: string[]) => Promise.all(files.map((f) => rm(f, { force: true })));

export const askModel = async ({ model, messages }: StoredChat): Promise<ChatMessage> => {
    const res = await ollama.chat({ model, messages, stream: false });
    return { role: "assistant", content: res.message.content };
};

export const listModels = async () => (await ollama.list()).models.map(({ name, size }) => ({ name, size }));

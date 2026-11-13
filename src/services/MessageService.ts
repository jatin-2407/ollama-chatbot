import type { IChat } from '@/database/models';
import fs from 'node:fs'
import { type ChatRequest, type ChatResponse } from 'ollama';
import ollama from 'ollama'

export const writeJson = (file: string, obj: any) => {
    const content = JSON.stringify(obj);
    fs.writeFileSync(file, content);
}

const loadJson = <T = unknown>(filePath: string): T => {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return JSON.parse(content) as T;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in file: ${filePath}`, {
                cause: error
            });
        }

        throw new Error(`Failed to read file: ${filePath}`, {
            cause: error
        });
    }
};



export const loadChatMessages = (chatMessageFile: string) => {
    try {
        return loadJson<ChatRequest & { stream?: boolean }>(chatMessageFile);
    } catch (error) {
        //todo correct this  
        if (
            error instanceof Error &&
            error.message.startsWith("Failed to read file:")
        ) {
            return;
        }
        throw error;
    }
};


export const sendMessageToLLM = async (c: ChatRequest & { stream?: boolean }) => {
    const res = await ollama.chat({
        model:c.model,
        messages:c.messages,
        stream:false
    });
    return { role: 'assistant', content: res.message.content };
}

export const getMessageFilesName = (chat_id: string, model_names: string[]) => {
    return model_names.map(model_name => `${chat_id}.${model_name}.json`);
}

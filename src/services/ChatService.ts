import { Chat } from "@/database/models";
import { getMessageFilesName, loadChatMessages } from "./MessageService";
import type { ChatRequest } from "ollama";

export const createChat = async (title: string, models: string[]) => {
    return await Chat.create({
        title,
        model_names: models,
    });
};

export const listChats = async () => {
    return await Chat.find()
        .select("_id title")
        .sort({ updatedAt: -1 })
        .lean();
};

export const deleteChat = async (id: string) => {
    return await Chat.findByIdAndDelete(id);
};

export const getChat = async (id: string) => {
    return await Chat.findById(id);
};

interface ILoadChatResult {
    loadingFails: boolean,
    chats: Array<ChatRequest & { stream?: boolean }>,
    fileNames: string[]
}

export const loadChat = async (chatId: string): Promise<ILoadChatResult> => {
    const failResponse: ILoadChatResult = {
        loadingFails: true,
        chats: [],
        fileNames: []
    }
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return failResponse
        //load the chat to know the selected models 
        const messageFilesNames = getMessageFilesName(chat._id, chat?.model_names);
        let loadingFails = false;
        const chats: Array<ChatRequest & { stream?: boolean }> = [];
        messageFilesNames.some((file, index) => {
            try {
                const res = loadChatMessages(file);
                if (!res) {
                    chats.push({
                        model: chat.model_names[index] || "",
                        messages: [],
                    });
                } else {
                    chats.push(res);
                }
            } catch (e) {
                loadingFails = true;
                return true;
            };
        });

        if (loadingFails) return failResponse;

        return {
            loadingFails,
            chats,
            fileNames: messageFilesNames
        }

    } catch {
        return failResponse;
    }

}
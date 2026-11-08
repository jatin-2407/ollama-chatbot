import { Chat } from "@/database/models";

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
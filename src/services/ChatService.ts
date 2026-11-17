import type { Types } from "mongoose";
import { Chat, type ChatDoc } from "@/database/models";
import { objectIdSchema } from "@/shared/schemas";
import { HttpError } from "@/utils/http";
import { deleteHistory, historyFiles, readHistory, type StoredChat } from "./MessageService";

type UserId = Types.ObjectId;

export const createChat = (user: UserId, title: string, model_names: string[]) =>
    Chat.create({ user, title, model_names });

export const listChats = (user: UserId) =>
    Chat.find({ user }).select("_id title").sort({ updatedAt: -1 }).lean();

/** Finds a chat owned by `user`, or throws 400/404. Other users' chats are reported as not found. */
export const findOwnedChat = async (user: UserId, id: string | undefined): Promise<ChatDoc> => {
    if (!objectIdSchema.safeParse(id).success) throw new HttpError(400, "Invalid chat id");
    const chat = await Chat.findOne({ _id: id, user });
    if (!chat) throw new HttpError(404, "Chat not found");
    return chat;
};

/** Deletes the chat record, then its history files. File cleanup failure is logged, not surfaced. */
export const deleteChat = async (user: UserId, id: string | undefined) => {
    const chat = await findOwnedChat(user, id);
    await chat.deleteOne();
    await deleteHistory(historyFiles(chat.id, chat.model_names)).catch((e) =>
        console.error(`Failed to remove history files for chat ${chat.id}`, e),
    );
    return chat;
};

/** One conversation per model, in the chat's model order. */
export const loadConversations = async (chat: ChatDoc): Promise<{ files: string[]; conversations: StoredChat[] }> => {
    const files = historyFiles(chat.id, chat.model_names);
    try {
        const loaded = await Promise.all(files.map(readHistory));
        const conversations = loaded.map((c, i) => c ?? { model: chat.model_names[i]!, messages: [] });
        return { files, conversations };
    } catch (e) {
        console.error(e);
        throw new HttpError(500, "This chat's history is corrupted and couldn't be loaded");
    }
};

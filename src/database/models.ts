import mongoose from "mongoose";
import { chatSchema, userSchema } from "./schemas";

export interface IUser {
    _id: string,
    name: string;
    email: string;
    password: string;
}
export const User = mongoose.model<IUser>("users", userSchema);


export interface IChat {
    _id: string,
    title: string;
    model_names: string[];
    user_input: string[],
    model_responses: {
        [index: number]: string[]
    },
    createdAt: Date,
    updatedAt: Date,
}
export const Chat = mongoose.model<IChat>("chats", chatSchema);
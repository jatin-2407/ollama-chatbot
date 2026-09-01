import mongoose from "mongoose";
import { userSchema } from "./schemas";

export interface IUser {
    name: string;
    email: string;
    password: string;
}
export const User = mongoose.model<IUser>("users", userSchema);
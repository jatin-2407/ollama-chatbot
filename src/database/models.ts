import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { LIMITS } from "@/shared/schemas";

const userSchema = new Schema(
    {
        name: { type: String, required: true, minLength: LIMITS.name.min, maxLength: LIMITS.name.max },
        email: { type: String, required: true, unique: true, minLength: LIMITS.email.min, maxLength: LIMITS.email.max },
        password: { type: String, required: true },
    },
    { timestamps: true },
);

const chatSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
        title: { type: String, required: true, minLength: LIMITS.chatTitle.min, maxLength: LIMITS.chatTitle.max },
        model_names: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length >= 1 && v.length <= LIMITS.maxModels,
                message: `A chat needs 1 to ${LIMITS.maxModels} models`,
            },
        },
    },
    { timestamps: true },
);

export const User = model("users", userSchema);
export const Chat = model("chats", chatSchema);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export type ChatDoc = HydratedDocument<InferSchemaType<typeof chatSchema>>;

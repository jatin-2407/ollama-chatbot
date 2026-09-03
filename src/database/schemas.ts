import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
    },
    email: {
        type: String,
        minLength: 10,
        maxLength: 50,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        maxLength: 255,
        required: true,
    },
}, {
    timestamps: true,
});
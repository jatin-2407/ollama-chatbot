import mongoose from "mongoose";
import { maxLength, minLength } from "zod";
import { required } from "zod/mini";


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


export const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
    },
    model_names: {
        type: [String],
        minLength: 1,
        maxLength: 2,
        required: true
    },
    user_input: {
        type: [String],
        minLength: 0,
        maxLength: 100,
        required: false,
    },
    model_responses: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
}, {
    timestamps: true,
});
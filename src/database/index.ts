import mongoose from "mongoose";

export const dbInit = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI || "");
    } catch (e: unknown) {
        console.error("Failed to  connect to database");
    }
}
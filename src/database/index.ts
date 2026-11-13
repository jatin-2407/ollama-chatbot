import mongoose from "mongoose";

export const dbInit = async () => {
    try {
        if (Bun.env.NODE_ENV === 'test') {
            await mongoose.connect(process.env.TEST_DATABASE_URI || "");
        } else {
            await mongoose.connect(process.env.DATABASE_URI || "");
        }
    } catch (e: unknown) {
        console.error("Failed to  connect to database");
    }
}
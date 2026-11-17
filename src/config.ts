import path from "node:path";

const isTest = Bun.env.NODE_ENV === "test";

const required = (key: string) => {
    const value = Bun.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

/** All environment-driven settings in one place. Required values are checked at startup. */
export const config = {
    isTest,
    port: Number(Bun.env.PORT) || 3000,
    host: Bun.env.HOST || "0.0.0.0",
    databaseUri: required(isTest ? "TEST_DATABASE_URI" : "DATABASE_URI"),
    jwtSecret: required("APP_PASSWORD_CODE"),
    jwtExpiresIn: "7d",
    bcryptRounds: Number(Bun.env.APP_BCRYPT_SALT_ROUNDS) || 10,
    chatDataDir: Bun.env.CHAT_DATA_DIR || path.join(process.cwd(), "data", "chats"),
} as const;

import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import type { Controller } from "./types";
import { blockLoggedIn, validateBody } from "@/middlewares/auth";
import { User } from "@/database/models";
import { loginSchema, signupSchema, type LoginRequest, type SignupRequest } from "@/shared/schemas";
import { API, type SignInResponse } from "@/shared/types";
import { fail } from "@/utils/http";

export const authController: Controller = {
    post: {
        [API.signup]: blockLoggedIn(validateBody(signupSchema)(async (c) => {
            const body = c.get("body") as SignupRequest;

            if (await User.exists({ email: body.email })) {
                return fail(c, 400, "An account with this email already exists", { email: "Email is already registered" });
            }

            await User.create({
                name: body.name,
                email: body.email,
                password: await bcrypt.hash(body.password, Number(process.env.APP_BCRYPT_SALT_ROUNDS) || 10),
            });

            return c.json({ message: "Account created!" }, 201);
        })),

        [API.signin]: blockLoggedIn(validateBody(loginSchema)(async (c) => {
            const body = c.get("body") as LoginRequest;

            const user = await User.findOne({ email: body.email });
            if (!user || !(await bcrypt.compare(body.password, user.password))) {
                return fail(c, 401, "Invalid email or password");
            }

            const jwtSecret = process.env.APP_PASSWORD_CODE;
            if (!jwtSecret) throw new Error("APP_PASSWORD_CODE is not configured");

            return c.json<SignInResponse>({
                message: "Welcome",
                user: user.name,
                token: JWT.sign({ user: user._id.toString() }, jwtSecret, { expiresIn: "7d" }),
            }, 200);
        })),
    },
};

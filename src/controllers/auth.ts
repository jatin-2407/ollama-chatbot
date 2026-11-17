import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import type { Controller } from "./types";
import { blockLoggedIn, validateBody } from "@/middlewares/auth";
import { User } from "@/database/models";
import { config } from "@/config";
import { loginSchema, signupSchema, type LoginRequest, type SignupRequest } from "@/shared/schemas";
import { API, type SignInResponse } from "@/shared/types";
import { HttpError } from "@/utils/http";

export const authController: Controller = {
    post: {
        [API.signup]: blockLoggedIn(validateBody(signupSchema)(async (c) => {
            const { name, email, password } = c.get("body") as SignupRequest;

            if (await User.exists({ email })) {
                throw new HttpError(400, "An account with this email already exists", { email: "Email is already registered" });
            }

            await User.create({ name, email, password: await bcrypt.hash(password, config.bcryptRounds) });
            return c.json({ message: "Account created!" }, 201);
        })),

        [API.signin]: blockLoggedIn(validateBody(loginSchema)(async (c) => {
            const { email, password } = c.get("body") as LoginRequest;

            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                throw new HttpError(401, "Invalid email or password");
            }

            const token = JWT.sign({ user: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
            return c.json<SignInResponse>({ message: "Welcome", user: user.name, token }, 200);
        })),
    },
};

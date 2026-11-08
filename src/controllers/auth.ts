import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import type { Controller, ISignUpRequest, LoginRequest } from "./types";
import { blockLoggedIn, validateLoginRequest, validateSignUpRequest } from "@/middlewares/auth";
import { User } from "@/database/models";

export const authController: Controller = {
    post: {
        "/signup":
            blockLoggedIn(validateSignUpRequest(async (c) => {

                const body = c.get("body") as ISignUpRequest;
                const user = await User.findOne({
                    email: body.email
                })

                if (user) {
                    return c.json({ message: 'user already exists' }, 400);

                }

                const newUser = new User();
                newUser.email = body.email;
                newUser.name = body.name;
                newUser.password = await bcrypt.hash(body.password, Number(process.env.APP_BCRYPT_SALT_ROUNDS) || 10);
                await newUser.save();

                return c.json({ message: "User created!" }, 201);
            })),
        //todo: Prevent  loggedin user from relogin
        "/login":
            blockLoggedIn(validateLoginRequest(async (c) => {

                const body: LoginRequest = c.get("body");

                const user = await User.findOne({ email: body.email });
                if (!user) return c.json({ message: "Invalid login!" }, 401);

                const passwordOkay = await bcrypt.compare(body.password, user.password);
                if (!passwordOkay) return c.json({ message: "Invalid login!" }, 401);


                const jwtSecret = process.env.APP_PASSWORD_CODE;
                if (!jwtSecret) throw new Error("APP_PASSWORD_CODE is not configured");
                const jwt = JWT.sign({ user: user._id.toString() }, jwtSecret, { expiresIn: "7d" });

                return c.json({
                    message: "Welcome",
                    token: jwt,
                }, 200);
            })),

    },
};





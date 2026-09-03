import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { app } from '..'
import jwt from 'jsonwebtoken'
import { User } from '@/database/models'

function postJSON(url: string, body: unknown) {
    return new Request(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });
}

describe("AuthController:Signup", () => {
    let server: Bun.Server<undefined> | null = null;
    let signupUrl = "";
    const createdEmails: string[] = [];

    beforeAll(async () => {
        server = await app();
        signupUrl = server.url + "signup";
    })

    afterAll(async () => {
        if (createdEmails.length) {
            await User.deleteMany({ email: { $in: createdEmails } });
        }
        await server?.stop()
    })

    it("should give 400 when request repeats an existing email", async () => {
        const existingUser = {
            name: "user",
            email: `signup-duplicate-${Date.now()}@test.com`,
            password: "test@123"
        };
        createdEmails.push(existingUser.email);

        // seed the user this test expects to already exist
        const seedRes = await server?.fetch(postJSON(signupUrl, existingUser));
        expect(seedRes?.status).toBe(201);

        const res = await server?.fetch(postJSON(signupUrl, existingUser));
        expect(res?.status).toBe(400);
        const data = await res?.json();
        expect(data).toHaveProperty("message");
    })

    it("should give 201 when request is valid", async () => {
        const email = `test1123${Math.random()}@test.com`;
        createdEmails.push(email);

        const res = await server?.fetch(postJSON(signupUrl, {
            name: "test-user 123",
            email,
            password: "test@123"
        }));
        expect(res?.status).toBe(201);
    })

    it("should give 400 when request is invalid", async () => {
        const res = await server?.fetch(postJSON(signupUrl, {
            name: "",
            password: ""
        }));
        expect(res?.status).toBe(400);
    });

})

describe("AuthController:login", () => {

    let server: Bun.Server<undefined> | null = null;
    let loginUrl = "";
    let signupUrl = "";
    const testUser = {
        name: "login-test-user",
        email: `login-test-${Date.now()}@test.com`,
        password: "test@123"
    };

    beforeAll(async () => {
        server = await app();
        loginUrl = server.url + "login";
        signupUrl = server.url + "signup";

        // seed the user this suite logs in as
        const seedRes = await server.fetch(postJSON(signupUrl, testUser));
        expect(seedRes.status).toBe(201);
    })

    afterAll(async () => {
        await User.deleteMany({ email: testUser.email });
        await server?.stop()
    })

    it("should give 200 and a valid JWT token when login is successful", async () => {
        const res = await server?.fetch(postJSON(loginUrl, {
            email: testUser.email,
            password: testUser.password
        }));
        expect(res?.status).toBe(200);

        const data = await res?.json();
        expect(data).toHaveProperty("token");

        const jwtSecret = process.env.APP_PASSWORD_CODE;
        expect(jwtSecret).toBeTruthy();
        const decoded = jwt.verify(data.token, jwtSecret as string);
        expect(decoded).toHaveProperty("user");
    })

    it("should give 401 when password is incorrect", async () => {
        const res = await server?.fetch(postJSON(loginUrl, {
            email: testUser.email,
            password: "wrong-password"
        }));
        expect(res?.status).toBe(401);
    })

    it("should give 400 when request is invalid", async () => {
        const res = await server?.fetch(postJSON(loginUrl, {
            email: "",
            password: ""
        }));
        expect(res?.status).toBe(400);
    });

})

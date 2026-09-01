import z from 'zod'

export const loginRequestValidationSchema = z.object({
    name:z.email().min(3).max(50),
    email: z.email().min(10).max(50),
    password: z.string().min(8).max(50),
});

export const signupRequestValidationSchema = z.object({
    email: z.email().min(10).max(50),
    password: z.string().min(8).max(50),
});
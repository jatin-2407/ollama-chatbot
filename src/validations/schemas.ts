import z from 'zod'

export const signupRequestValidationSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.email().min(10).max(50),
    password: z.string().min(8).max(50),
});




export const loginRequestValidationSchema = z.object({
    email: z.email().min(10).max(50),
    password: z.string().min(8).max(50),
});
import z from 'zod'

const strongPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be at most 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const signupRequestValidationSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.email().min(10).max(50),
    password: strongPassword,
});




export const loginRequestValidationSchema = z.object({
    email: z.email().min(10).max(50),
    password: z.string().min(8).max(50),
});
import z from "zod";

/** Single source of truth for validation rules — used by both the API and the UI. */
export const LIMITS = {
    name: { min: 3, max: 50 },
    email: { min: 10, max: 50 },
    password: { min: 8, max: 50 },
    chatTitle: { min: 3, max: 50 },
    message: { max: 4000 },
    maxModels: 2,
} as const;

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid chat id");

const email = z
    .email("Enter a valid email address")
    .min(LIMITS.email.min, `Email must be at least ${LIMITS.email.min} characters`)
    .max(LIMITS.email.max, `Email must be at most ${LIMITS.email.max} characters`);

const strongPassword = z
    .string()
    .min(LIMITS.password.min, `Password must be at least ${LIMITS.password.min} characters`)
    .max(LIMITS.password.max, `Password must be at most ${LIMITS.password.max} characters`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const signupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(LIMITS.name.min, `Name must be at least ${LIMITS.name.min} characters`)
        .max(LIMITS.name.max, `Name must be at most ${LIMITS.name.max} characters`),
    email,
    password: strongPassword,
});

/** UI-only extension: confirm password must match. */
export const signupFormSchema = signupSchema
    .extend({ confirmPassword: z.string().min(1, "Please confirm your password") })
    .refine((d) => d.password === d.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export const loginSchema = z.object({
    email,
    password: z
        .string()
        .min(LIMITS.password.min, `Password must be at least ${LIMITS.password.min} characters`)
        .max(LIMITS.password.max, `Password must be at most ${LIMITS.password.max} characters`),
});

export const createChatSchema = z.object({
    title: z
        .string()
        .trim()
        .min(LIMITS.chatTitle.min, `Title must be at least ${LIMITS.chatTitle.min} characters`)
        .max(LIMITS.chatTitle.max, `Title must be at most ${LIMITS.chatTitle.max} characters`),
    model_names: z
        .array(z.string().min(1, "Model name can't be empty"))
        .min(1, "Select at least one model")
        .max(LIMITS.maxModels, `Select at most ${LIMITS.maxModels} models`),
});

export const sendMessageSchema = z.object({
    chatId: objectIdSchema,
    message: z
        .string()
        .trim()
        .min(1, "Message can't be empty")
        .max(LIMITS.message.max, `Message must be at most ${LIMITS.message.max} characters`),
});

export type SignupRequest = z.infer<typeof signupSchema>;
export type SignupForm = z.infer<typeof signupFormSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type CreateChatRequest = z.infer<typeof createChatSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

export type FieldErrors = Record<string, string>;

/** Flattens Zod issues into `{ field: firstMessage }`. */
export const toFieldErrors = (error: z.ZodError): FieldErrors => {
    const errors: FieldErrors = {};
    for (const issue of error.issues) {
        errors[issue.path.join(".") || "body"] ??= issue.message;
    }
    return errors;
};

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: FieldErrors };

export const validate = <T>(schema: z.ZodType<T, any>, input: unknown): ValidationResult<T> => {
    const res = schema.safeParse(input);
    return res.success ? { success: true, data: res.data } : { success: false, errors: toFieldErrors(res.error) };
};

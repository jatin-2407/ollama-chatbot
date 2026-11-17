import { useState, type ChangeEvent, type FormEvent } from "react";
import type z from "zod";
import { validate, type FieldErrors } from "@/shared/schemas";
import { ApiError, errorMessage } from "@/lib/api";

/**
 * Generic form state: values, per-field errors (client + server), a form-level error and submitting flag.
 * Validation uses the same Zod schema the API uses.
 */
export function useForm<Values extends Record<string, unknown>, Out>(schema: z.ZodType<Out, Values>, initial: Values) {
    const [values, setValues] = useState<Values>(initial);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const field = (name: keyof Values & string) => ({
        name,
        id: name,
        value: (values[name] as string) ?? "",
        error: errors[name],
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
            setValues((v) => ({ ...v, [name]: e.target.value }));
            if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
            setFormError("");
        },
    });

    const handleSubmit = (onValid: (data: Out) => Promise<void> | void) => async (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        const result = validate(schema, values);
        if (!result.success) {
            setErrors(result.errors);
            return;
        }
        setErrors({});
        setFormError("");
        setSubmitting(true);
        try {
            await onValid(result.data);
        } catch (err) {
            if (err instanceof ApiError && Object.keys(err.errors).length) setErrors(err.errors);
            setFormError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return { values, setValues, errors, formError, setFormError, submitting, field, handleSubmit };
}

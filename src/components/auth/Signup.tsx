import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useForm } from "@/hooks/useForm";
import { api } from "@/lib/services";
import { LIMITS, signupFormSchema } from "@/shared/schemas";

export const Signup = () => {
  const navigate = useNavigate();
  const { field, handleSubmit, formError, submitting } = useForm(signupFormSchema, {
    name: "", email: "", password: "", confirmPassword: "",
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...data }) => {
    await api.signup(data);
    navigate("/signin", { state: { flash: "Account created! Please sign in." } });
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start chatting with your local models in seconds."
      footer={<>Already have an account? <Link to="/signin" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <FormField label="Name" autoComplete="name" placeholder="Ada Lovelace" autoFocus {...field("name")} />
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" {...field("email")} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`${LIMITS.password.min}+ chars with upper, lower, number & symbol`}
          {...field("password")}
        />
        <FormField label="Confirm password" type="password" autoComplete="new-password" {...field("confirmPassword")} />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>Create account</Button>
      </form>
    </AuthLayout>
  );
};

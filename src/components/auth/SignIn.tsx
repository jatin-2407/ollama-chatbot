import { Link, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/services";
import { loginSchema } from "@/shared/schemas";

export const SignIn = () => {
  const { login } = useAuth();
  const flash = (useLocation().state as { flash?: string } | null)?.flash;
  const { field, handleSubmit, formError, submitting } = useForm(loginSchema, { email: "", password: "" });

  const onSubmit = handleSubmit(async (data) => {
    const { token, user } = await api.signin(data);
    login({ token, user });
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your conversations."
      footer={<>New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {flash && !formError && <Alert variant="success">{flash}</Alert>}
        {formError && <Alert>{formError}</Alert>}
        <FormField label="Email" type="email" autoComplete="email" placeholder="you@example.com" autoFocus {...field("email")} />
        <FormField label="Password" type="password" autoComplete="current-password" placeholder="••••••••" {...field("password")} />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>Sign in</Button>
      </form>
    </AuthLayout>
  );
};

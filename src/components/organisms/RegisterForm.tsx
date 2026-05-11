"use client";

/**
 * GARBO — Registration form (Supabase Auth signUp).
 * Styled to match LoginForm / SDD login screen patterns.
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth.schema";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils/cn";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterSchema>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterSchema, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterSchema, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterSchema;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { success, error, needsEmailConfirmation } = await register(result.data);
    setIsLoading(false);

    if (!success) {
      setServerError(error ?? "Registration failed.");
      return;
    }

    if (needsEmailConfirmation) {
      setAwaitingEmail(true);
      return;
    }

    const next = searchParams.get("next") ?? "/home";
    router.push(next);
    router.refresh();
  }

  if (awaitingEmail) {
    return (
      <div className="w-full max-w-sm text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
            "bg-[var(--color-primary)] shadow-md"
          )}
          aria-hidden="true"
        >
          <Trash2 className="text-[var(--color-text-on-primary)]" size={32} />
        </div>
        <h1
          className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text-primary)] mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Check your email
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          We sent a confirmation link to{" "}
          <span className="font-medium text-[var(--color-text-primary)]">{formData.email}</span>.
          After you confirm, you can sign in on the login page.
        </p>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
            "bg-[var(--color-primary)] shadow-md"
          )}
          aria-hidden="true"
        >
          <Trash2 className="text-[var(--color-text-on-primary)]" size={32} />
        </div>

        <h1
          className="font-[var(--font-heading)] text-3xl font-bold text-[var(--color-text-primary)] text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Create your{" "}
          <span className="text-[var(--color-primary)]">GARBO</span> account
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
          For barangay sanitation staff and authorized personnel. Use a work email if possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormGroup label="Full name" htmlFor="fullName" error={errors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="OPTIONAL — YOUR NAME"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Email" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="YOUR EMAIL"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            aria-required="true"
          />
        </FormGroup>

        <FormGroup label="Password" htmlFor="password" required error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="MIN 8 CHARS, UPPERCASE + NUMBER"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
            showPasswordToggle
            aria-required="true"
          />
        </FormGroup>

        <FormGroup
          label="Confirm password"
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="REPEAT PASSWORD"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isLoading}
            showPasswordToggle
            aria-required="true"
          />
        </FormGroup>

        {serverError && (
          <div
            role="alert"
            className={cn("alert-bar alert-bar--danger", "animate-fade-in")}
          >
            <span aria-hidden="true" className="text-base leading-none">
              ✕
            </span>
            <span className="text-sm">{serverError}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-6 tracking-widest font-semibold"
        >
          CREATE ACCOUNT
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-primary)] font-medium hover:underline focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

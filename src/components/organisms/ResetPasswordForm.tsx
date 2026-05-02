"use client";

/**
 * GARBO — ResetPasswordForm Organism
 * SRS §3.4.1.2 — Password reset functionality.
 * Two-step: (1) enter email → (2) enter new password from link.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  resetPasswordSchema,
  updatePasswordSchema,
  type ResetPasswordSchema,
  type UpdatePasswordSchema,
} from "@/lib/validations/auth.schema";
import { Button }    from "@/components/atoms/Button";
import { Input }     from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Request reset email
// ─────────────────────────────────────────────────────────────────────────────
export function RequestResetForm() {
  const { resetPassword } = useAuth();

  const [email,      setEmail     ] = useState("");
  const [error,      setError     ] = useState<string | null>(null);
  const [isLoading,  setIsLoading ] = useState(false);
  const [isSuccess,  setIsSuccess ] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid email.");
      return;
    }

    setIsLoading(true);
    const { success, error: apiError } = await resetPassword(result.data);
    setIsLoading(false);

    if (!success) {
      setError(apiError ?? "Something went wrong. Please try again.");
      return;
    }

    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center animate-fade-in">
        <CheckCircle2
          className="mx-auto mb-4 text-[var(--color-success)]"
          size={48}
        />
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Check your email
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          We sent a password reset link to{" "}
          <strong className="text-[var(--color-text-primary)]">{email}</strong>.
          The link expires in 1 hour.
        </p>
        <Link href="/login">
          <Button variant="outline" fullWidth leftIcon={<ArrowLeft size={16} />}>
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[var(--color-primary)] shadow-md"
          aria-hidden="true"
        >
          <Trash2 className="text-[var(--color-text-on-primary)]" size={32} />
        </div>
        <h1
          className="text-3xl font-bold text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center">
          Enter your registered email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormGroup label="Email Address" htmlFor="email" required error={error ?? undefined}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@banilad.gov.ph"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            error={error ?? undefined}
            disabled={isLoading}
          />
        </FormGroup>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Set new password (after clicking reset link)
// ─────────────────────────────────────────────────────────────────────────────
export function UpdatePasswordForm() {
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState<UpdatePasswordSchema>({
    password:        "",
    confirmPassword: "",
  });
  const [errors,    setErrors   ] = useState<Partial<Record<keyof UpdatePasswordSchema, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev)   => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const result = updatePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof UpdatePasswordSchema;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { success, error } = await updatePassword(result.data);
    setIsLoading(false);

    if (!success) {
      setServerError(error ?? "Something went wrong. Please try again.");
      return;
    }

    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center animate-fade-in">
        <CheckCircle2 className="mx-auto mb-4 text-[var(--color-success)]" size={48} />
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Password Updated
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Your password has been changed successfully.
        </p>
        <Link href="/login">
          <Button variant="primary" fullWidth>
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[var(--color-primary)] shadow-md" aria-hidden="true">
          <Trash2 className="text-[var(--color-text-on-primary)]" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-center" style={{ fontFamily: "var(--font-heading)" }}>
          New Password
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center">
          Choose a strong password with at least 8 characters, one uppercase letter, and one number.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormGroup label="New Password" htmlFor="password" required error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
            showPasswordToggle
          />
        </FormGroup>

        <FormGroup label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isLoading}
            showPasswordToggle
          />
        </FormGroup>

        {serverError && (
          <div role="alert" className={cn("alert-bar alert-bar--danger animate-fade-in")}>
            <span aria-hidden="true">✕</span>
            <span className="text-sm">{serverError}</span>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} className="mt-6">
          Update Password
        </Button>
      </form>
    </div>
  );
}
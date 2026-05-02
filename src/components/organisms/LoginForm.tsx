"use client";

/**
 * GARBO — LoginForm Organism
 * SDD §3.2.2 FR-2.1 — Login Form Group
 * SDD §4.2.1 FR-1.7 — Screen 1: Login Page
 *
 * Matches the design in Image 8:
 * - GARBO logo (trash can icon + wordmark)
 * - "Welcome to GARBO" heading (Besley)
 * - Tagline copy
 * - Username + Password inputs
 * - SIGN IN button (full-width, primary olive)
 * - Forgot password link
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth.schema";
import { Button } from "@/components/atoms/Button";
import { Input }  from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LoginForm() {
  const router      = useRouter();
  const searchParams= useSearchParams();
  const { login }   = useAuth();

  const [formData, setFormData] = useState<LoginSchema>({
    email:    "",
    password: "",
  });
  const [errors,     setErrors    ] = useState<Partial<LoginSchema>>({});
  const [serverError,setServerError] = useState<string | null>(null);
  const [isLoading,  setIsLoading ] = useState(false);

  // ── Field change handler ─────────────────────────────────────────────────
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    // Client-side validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<LoginSchema> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginSchema;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { success, error } = await login(result.data);
    setIsLoading(false);

    if (!success) {
      setServerError(error ?? "An unexpected error occurred.");
      return;
    }

    // Redirect to intended destination or dashboard home
    const next = searchParams.get("next") ?? "/home";
    router.push(next);
    router.refresh();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm">
      {/* ── Logo + Heading ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center mb-8">
        {/* Trash can icon — matches SDD iconography */}
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
          Welcome to{" "}
          <span className="text-[var(--color-primary)]">"GARBO"</span>
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
          Where smarter waste management helps create more sustainable communities.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Username / Email */}
        <FormGroup
          label="Username"
          htmlFor="email"
          required
          error={errors.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username email"
            placeholder="ENTER USERNAME"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            aria-required="true"
          />
        </FormGroup>

        {/* Password */}
        <FormGroup
          label="Password"
          htmlFor="password"
          required
          error={errors.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="ENTER PASSWORD"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
            showPasswordToggle
            aria-required="true"
          />
        </FormGroup>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className={cn(
              "alert-bar alert-bar--danger",
              "animate-fade-in"
            )}
          >
            <span aria-hidden="true" className="text-base leading-none">✕</span>
            <span className="text-sm">{serverError}</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-6 tracking-widest font-semibold"
        >
          SIGN IN
        </Button>
      </form>

      {/* ── Forgot password ─────────────────────────────────────────────── */}
      <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
        Forgot your password?{" "}
        <Link
          href="/reset-password"
          className="text-[var(--color-primary)] font-medium hover:underline focus-visible:underline"
        >
          Reset it here
        </Link>
      </p>
    </div>
  );
}
"use client";

/**
 * GARBO — LoginForm Organism (Redesigned)
 * SDD §3.2.2 FR-2.1 — Login Form Group
 * SDD §4.2.1 FR-1.7 — Screen 1: Login Page
 *
 * Two-column split layout — no vertical scrolling.
 * Left panel: branding + feature highlights
 * Right panel: login form
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Calendar, BarChart2, Megaphone, FileDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth.schema";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormGroup } from "@/components/molecules/FormGroup";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Feature bullet data
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Calendar,   text: "Schedule & track daily collections" },
  { icon: BarChart2,  text: "Monitor KPIs in real time" },
  { icon: Megaphone,  text: "Generate public announcements" },
  { icon: FileDown,   text: "Export monthly reports (CSV / PDF)" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login }    = useAuth();

  const [formData, setFormData] = useState<LoginSchema>({ email: "", password: "" });
  const [errors,      setErrors     ] = useState<Partial<LoginSchema>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading,   setIsLoading  ] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev)    => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

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

    const next = searchParams.get("next") ?? "/home";
    router.push(next);
    router.refresh();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    /*
     * Root: full-viewport, two-column grid.
     * On mobile (<lg) the left panel collapses and only the form shows.
     */
    <div className="min-h-full w-full grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL — Branding & Features
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "hidden lg:flex flex-col justify-between",
          "bg-[var(--color-primary)] px-12 py-10",
          "relative overflow-hidden"
        )}
      >
        {/* Decorative background circles */}
        <span
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-black/10 translate-x-1/3 translate-y-1/3 pointer-events-none"
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Trash2 className="text-white" size={22} />
          </div>
          <span
            className="text-white text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            GARBO
          </span>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2
              className="text-white text-4xl xl:text-5xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Smarter Waste.<br />
              Better Barangay.
            </h2>
            <p className="mt-3 text-white/75 text-base leading-relaxed max-w-sm">
              GARBO transforms manual recording into a real-time digital solution
              that improves transparency, accountability, and operational control.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="text-white" size={16} />
                </span>
                <span className="text-white/90 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer tagline */}
        <p className="relative z-10 text-white/50 text-xs tracking-widest uppercase">
          Manage Waste · Monitor Better · Serve Smarter
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "bg-[var(--color-surface)] px-8 py-10",
          "min-h-full lg:min-h-0"           /* full-height on mobile */
        )}
      >
        {/* Mobile-only logo (hidden on lg+) */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <Trash2 className="text-[var(--color-text-on-primary)]" size={18} />
          </div>
          <span
            className="text-[var(--color-primary)] text-xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            GARBO
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Sign in to your GARBO account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormGroup label="Username" htmlFor="email" required error={errors.email}>
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

            <FormGroup label="Password" htmlFor="password" required error={errors.password}>
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

            {/* Forgot password — inline, above submit */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/reset-password"
                className="text-xs text-[var(--color-primary)] hover:underline focus-visible:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className={cn("alert-bar alert-bar--danger", "animate-fade-in")}
              >
                <span aria-hidden="true" className="text-base leading-none">✕</span>
                <span className="text-sm">{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2 tracking-widest font-semibold"
            >
              SIGN IN
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
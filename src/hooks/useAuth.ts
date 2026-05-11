"use client";

/**
 * GARBO — useAuth Hook
 *
 * Provides:
 * - Current user state (loading, user, error)
 * - login()         → email/password sign-in via Supabase
 * - register()      → email/password sign-up (optional email confirm per project settings)
 * - logout()        → sign-out and redirect to /login
 * - resetPassword() → sends password reset email
 * - updatePassword()→ sets new password from reset link
 *
 * SRS §3.4.1 — Secure login via Supabase Auth.
 * SRS §3.4.1.3 — Session timeout enforced by Supabase JWT expiry (8h).
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import getSupabaseBrowserClient from "../../supabase/client";
import type {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
} from "@/lib/validations/auth.schema";
import type { LoadingState } from "@/types/app.types";

interface AuthState {
  user:    User | null;
  loading: boolean;
  error:   string | null;
}

interface UseAuthReturn extends AuthState {
  login:          (data: LoginSchema)         => Promise<{ success: boolean; error?: string }>;
  register:       (data: RegisterSchema)      => Promise<{
    success: boolean;
    error?: string;
    needsEmailConfirmation?: boolean;
  }>;
  logout:         ()                          => Promise<void>;
  resetPassword:  (data: ResetPasswordSchema) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (data: UpdatePasswordSchema)=> Promise<{ success: boolean; error?: string }>;
  clearError:     ()                          => void;
}

export function useAuth(): UseAuthReturn {
  const supabase = getSupabaseBrowserClient();
  const router   = useRouter();

  const [state, setState] = useState<AuthState>({
    user:    null,
    loading: true,
    error:   null,
  });

  // ── Subscribe to auth state changes ───────────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user, loading: false, error: null });
    });

    // Listen for auth events (login, logout, token refresh, password reset)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((prev) => ({
          ...prev,
          user:    session?.user ?? null,
          loading: false,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (data: LoginSchema): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      });

      if (error) {
        const message = mapAuthError(error.message);
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { success: true };
    },
    [supabase]
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      data: RegisterSchema
    ): Promise<{
      success: boolean;
      error?: string;
      needsEmailConfirmation?: boolean;
    }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
      const { error, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          ...(appUrl ? { emailRedirectTo: `${appUrl}/login` } : {}),
          data: {
            full_name: data.fullName || undefined,
          },
        },
      });

      if (error) {
        const message = mapAuthError(error.message);
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }

      const session = signUpData.session;
      const needsEmailConfirmation = Boolean(signUpData.user && !session);

      setState((prev) => ({ ...prev, loading: false }));
      return { success: true, needsEmailConfirmation };
    },
    [supabase]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setState({ user: null, loading: false, error: null });
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  // ── Reset password (send email) ───────────────────────────────────────────
  const resetPassword = useCallback(
    async (data: ResetPasswordSchema): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?type=recovery`,
      });

      if (error) {
        const message = mapAuthError(error.message);
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { success: true };
    },
    [supabase]
  );

  // ── Update password (from reset link) ────────────────────────────────────
  const updatePassword = useCallback(
    async (data: UpdatePasswordSchema): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        const message = mapAuthError(error.message);
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { success: true };
    },
    [supabase]
  );

  // ── Clear error ────────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    clearError,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — map Supabase error codes to friendly messages
// ─────────────────────────────────────────────────────────────────────────────
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials"))
    return "Incorrect email or password. Please try again.";
  if (lower.includes("email not confirmed"))
    return "Please verify your email address before logging in.";
  if (lower.includes("too many requests"))
    return "Too many login attempts. Please wait a moment and try again.";
  if (lower.includes("user not found"))
    return "No account found with this email address.";
  if (
    lower.includes("already registered") ||
    lower.includes("user already registered") ||
    lower.includes("email address is already registered")
  )
    return "An account with this email already exists. Try signing in instead.";
  if (lower.includes("network"))
    return "Network error. Please check your connection and try again.";

  // Fallback — return original message sanitised
  return message.charAt(0).toUpperCase() + message.slice(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed loading state helper (used by form buttons)
// ─────────────────────────────────────────────────────────────────────────────
export function useLoadingState(initial: LoadingState = "idle") {
  const [state, setState] = useState<LoadingState>(initial);
  return {
    state,
    isIdle:    state === "idle",
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError:   state === "error",
    setIdle:    () => setState("idle"),
    setLoading: () => setState("loading"),
    setSuccess: () => setState("success"),
    setError:   () => setState("error"),
  };
}
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/organisms/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the GARBO Waste Management Dashboard for Barangay Banilad.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Login Page
// Layout matches Image 8:
//   Left panel  — login card (sand background)
//   Right panel — about/branding section (olive background)
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-6 py-12" style={{ background: "var(--color-bg-page)" }}>
      <section className="w-full max-w-6xl">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        {/* Footer links */}
        <footer className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-[var(--color-text-muted)]">
          <span>© {new Date().getFullYear()} GARBO</span>
          <a href="#" className="hover:text-[var(--color-primary)]">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-primary)]">Terms of Service</a>
          <a href="#" className="hover:text-[var(--color-primary)]">Contact Us</a>
        </footer>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton shown while LoginForm loads (Suspense boundary)
// ─────────────────────────────────────────────────────────────────────────────
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-4 animate-pulse" aria-hidden="true">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-border)] mx-auto" />
      <div className="h-8 w-3/4 rounded bg-[var(--color-border)] mx-auto" />
      <div className="h-4 w-1/2 rounded bg-[var(--color-border)] mx-auto" />
      <div className="h-11 w-full rounded-md bg-[var(--color-border)]" />
      <div className="h-11 w-full rounded-md bg-[var(--color-border)]" />
      <div className="h-12 w-full rounded-md bg-[var(--color-border)]" />
    </div>
  );
}
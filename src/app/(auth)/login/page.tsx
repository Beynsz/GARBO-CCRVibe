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
    <main className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* ── Left: Login form panel ────────────────────────────────────── */}
      <section
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12"
        style={{ background: "var(--color-bg-page)" }}
        aria-label="Login"
      >
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        {/* Footer links */}
        <footer className="mt-auto pt-8 flex gap-6 text-xs text-[var(--color-text-muted)]">
          <span>© {new Date().getFullYear()} GARBO</span>
          <a href="#" className="hover:text-[var(--color-primary)]">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-primary)]">Terms of Service</a>
          <a href="#" className="hover:text-[var(--color-primary)]">Contact Us</a>
        </footer>
      </section>

      {/* ── Right: About / branding panel ────────────────────────────── */}
      <aside
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col items-center justify-center px-12 py-16 text-center"
        style={{ background: "var(--color-bg-sidebar)" }}
        aria-hidden="true"
      >
        {/* GARBO wordmark */}
        <h2
          className="text-5xl font-bold text-[var(--color-text-on-primary)] mb-6 tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          GARBO
        </h2>

        {/* About copy — mirrors SRS §1.1 purpose */}
        <p className="text-sm leading-relaxed text-[rgba(253,250,244,0.80)] max-w-xs mb-10">
          GARBO is a smart Waste Management and Monitoring System designed to help barangay
          officials manage collection, inventory, and reporting more efficiently. Our platform
          transforms traditional manual recording into a sustainable, real-time digital solution
          that improves transparency, accountability, and operational control.
        </p>

        {/* Feature taglines */}
        <div className="space-y-3 w-full max-w-xs">
          {[
            { icon: "📅", text: "Schedule & track daily collections" },
            { icon: "📊", text: "Monitor KPIs in real time" },
            { icon: "📢", text: "Generate public announcements" },
            { icon: "📁", text: "Export monthly reports (CSV / PDF)" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-left"
              style={{ background: "rgba(253,250,244,0.08)" }}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-sm text-[rgba(253,250,244,0.85)]">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p
          className="mt-12 text-2xl font-bold leading-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text-on-primary)",
          }}
        >
          Manage Waste.{" "}
          <span style={{ color: "var(--color-accent)" }}>Monitor Better.</span>
          <br />
          Serve{" "}
          <span
            style={{
              color: "var(--color-accent)",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            Smarter.
          </span>
        </p>
      </aside>
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
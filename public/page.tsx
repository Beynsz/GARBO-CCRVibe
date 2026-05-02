/**
 * GARBO — Public Landing Page
 * Matches Image 1 (Main2 screenshot):
 * - Public top nav: LOG IN | ABOUT US | HOME
 * - Hero section with "NO DUMPIN" imagery aesthetic
 * - "Our Approach" section
 * - Feature cards grid
 * - "Manage Waste. Monitor Better. Serve Smarter." tagline
 * - Image gallery row
 * - Footer
 *
 * This page is publicly accessible (no auth required).
 */

import type { Metadata } from "next";
import Link   from "next/link";
import Image  from "next/image";
import { Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "GARBO — Manage Waste. Monitor Better. Serve Smarter.",
  description:
    "GARBO is a smart Waste Management and Monitoring System designed to help " +
    "barangay officials manage collection, inventory, and reporting more efficiently.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Nav link
// ─────────────────────────────────────────────────────────────────────────────
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature card
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, description,
}: { icon: string; title: string; description: string }) {
  return (
    <div
      className="card p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200"
    >
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <h3
        className="text-base font-bold text-[var(--color-text-primary)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-page)" }}
    >
      {/* ── Top Navigation ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--color-border)]"
        style={{ background: "rgba(245,236,213,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md px-1"
            aria-label="GARBO home"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-primary)" }}
            >
              <Trash2 size={14} className="text-white" aria-hidden="true" />
            </div>
            <span
              className="text-base font-bold text-[var(--color-primary)] tracking-wide"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              GARBO
            </span>
          </Link>

          {/* Nav links — matches Image 1 */}
          <nav className="flex items-center gap-6" aria-label="Main">
            <NavLink href="/login">LOG IN</NavLink>
            <NavLink href="#about">ABOUT US</NavLink>
            <NavLink href="/">HOME</NavLink>
          </nav>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
          minHeight: "420px",
        }}
        aria-label="Hero"
      >
        {/* Background texture pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.05) 0px,
              rgba(255,255,255,0.05) 1px,
              transparent 1px,
              transparent 12px
            )`,
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-soft" />
              Barangay Banilad · Digital Waste Management
            </div>

            <h1
              className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              GARBO
            </h1>

            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.80)" }}>
              GARBO is a smart Waste Management and Monitoring System designed to help
              barangay officials manage collection, inventory, and reporting more efficiently.
              Our platform transforms traditional manual recording into a sustainable,
              real-time digital solution that improves transparency, accountability,
              and operational control.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
              style={{
                background:  "var(--color-accent)",
                color:       "var(--color-primary-dark)",
              }}
            >
              Access Dashboard →
            </Link>
          </div>

          {/* "NO DUMPIN" card — visual from Image 1 */}
          <div className="hidden lg:flex justify-center">
            <div
              className="w-72 h-52 rounded-2xl flex flex-col items-center justify-center shadow-[var(--shadow-modal)] relative overflow-hidden"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
              aria-label="No dumping sign illustration"
              role="img"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(40,30,20,0.6) 0%, rgba(20,40,10,0.8) 100%)`,
                }}
              />
              <p
                className="relative text-5xl font-black text-white text-center leading-none"
                style={{ fontFamily: "var(--font-heading)", textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
                aria-hidden="true"
              >
                NO<br />DUMPIN
              </p>
              <p className="relative mt-3 text-xs text-[rgba(255,255,255,0.6)] uppercase tracking-widest">
                Keep Banilad Clean
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Approach ─────────────────────────────────────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2
          className="text-3xl font-bold text-[var(--color-text-primary)] mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Our Approach
        </h2>
        <p className="max-w-2xl mx-auto text-[var(--color-text-muted)] leading-relaxed text-base mb-6">
          To support local government units in building cleaner, more organised, and
          environmentally responsible communities. By digitising waste monitoring and
          streamlining workflows, GARBO empowers barangays to make informed decisions
          and deliver better public service.
        </p>
        <div
          className="w-16 h-1 rounded-full mx-auto"
          style={{ background: "var(--color-secondary)" }}
          aria-hidden="true"
        />
      </section>

      {/* ── Challenge / Context Block ─────────────────────────────────── */}
      <section
        className="py-12"
        style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm text-[var(--color-text-muted)] leading-loose max-w-4xl mx-auto text-center">
            We understand the daily challenges faced by barangay officials — from tracking
            waste collection schedules to monitoring disposal sites and generating accurate
            reports. GARBO simplifies these processes through an intuitive dashboard,
            structured data management, and reliable reporting tools.
          </p>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon="📅"
            title="Schedule Management"
            description="Create and manage recurring collection routes per Sitio. Auto-generate daily task lists at midnight from the Master Schedule."
          />
          <FeatureCard
            icon="📊"
            title="Real-Time KPI Dashboard"
            description="Monitor daily completion rates, pending routes, and incident counts at a glance with a centralized operational overview."
          />
          <FeatureCard
            icon="📢"
            title="Public Announcements"
            description="Generate public-ready announcement text for delays, cancellations, and reminders — ready to post on social media or notice boards."
          />
          <FeatureCard
            icon="⚠️"
            title="Incident Logging"
            description="Record missed collections with reason tags, log illegal dumping reports with location descriptions, and filter logs by date or Sitio."
          />
          <FeatureCard
            icon="📁"
            title="Reports & Export"
            description="Export monthly performance reports as CSV or PDF. Track completion rates, waste volume, and fuel consumption month-over-month."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Reliable"
            description="Row-level security restricts write access to authenticated Barangay Admins. 99.9% uptime via Vercel and Supabase cloud infrastructure."
          />
        </div>
      </section>

      {/* ── Tagline ──────────────────────────────────────────────────── */}
      <section
        className="py-20 text-center"
        style={{ background: "var(--color-primary)" }}
        aria-label="Tagline"
      >
        <h2
          className="text-3xl lg:text-4xl font-bold text-white leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Manage Waste.{" "}
          <span style={{ color: "var(--color-accent)" }}>Monitor Better.</span>
          <br />
          Serve{" "}
          <span
            style={{
              color:              "var(--color-accent)",
              textDecoration:     "underline",
              textUnderlineOffset:"6px",
            }}
          >
            Smarter.
          </span>
        </h2>
        <p className="mt-6 text-sm text-[rgba(255,255,255,0.7)]">
          Built for Barangay Banilad by CCRVibe Tech
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ background: "var(--color-accent)", color: "var(--color-primary-dark)" }}
        >
          Get Started →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="border-t border-[var(--color-border)] py-6"
        style={{ background: "var(--color-bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} GARBO. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
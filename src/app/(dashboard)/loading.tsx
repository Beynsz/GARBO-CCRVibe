/**
 * GARBO — Dashboard Loading UI
 * Next.js automatically shows this file while the page and its data stream in.
 * Matches Image 2: centered spinner with "Please wait..." text.
 */

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      {/* Spinner — matches Image 2 loading screen */}
      <div className="relative w-12 h-12">
        {/* Outer track */}
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: "var(--color-border)" }}
          aria-hidden="true"
        />
        {/* Spinning arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: "var(--color-accent)" }}
          aria-hidden="true"
        />
      </div>

      <p
        className="text-sm text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        Please wait...
      </p>
    </div>
  );
}
/**
 * Auth route group layout — no sidebar, no topbar.
 * Just a minimal wrapper with the page background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
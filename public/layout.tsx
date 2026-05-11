/**
 * (public) route group layout
 * No sidebar, no auth guard. Accessible to everyone.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
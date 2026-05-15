/**
 * Browser-safe Supabase URL + public API key for createClient / createBrowserClient.
 * Supports the legacy anon JWT or the newer publishable key from Dashboard → API.
 */
export function resolvePublicSupabaseKeys(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

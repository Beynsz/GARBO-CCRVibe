/**
 * GARBO — Supabase Browser Client
 *
 * Use this client in "use client" components and React hooks.
 * Singleton pattern ensures only one client instance exists per browser tab.
 *
 * SRS §3.4.1 — Supabase Auth for secure email/password login.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { resolvePublicSupabaseKeys } from "@/lib/supabase/public-env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const cfg = resolvePublicSupabaseKeys();
  if (!cfg) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local. See Dashboard → Settings → API."
    );
  }

  client = createBrowserClient<Database>(cfg.url, cfg.anonKey);

  return client;
}

// Default export for convenience
export default getSupabaseBrowserClient;
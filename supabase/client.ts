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

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and set values from Supabase Dashboard → Settings → API."
    );
  }

  client = createBrowserClient<Database>(url, anonKey);

  return client;
}

// Default export for convenience
export default getSupabaseBrowserClient;
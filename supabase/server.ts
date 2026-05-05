/**
 * GARBO — Supabase Server Client
 *
 * Use this in:
 * - Server Components (RSC)
 * - API Route Handlers (app/api/*)
 * - Server Actions
 *
 * NEVER use this in "use client" components — it requires next/headers.
 *
 * Two exports:
 * - createSupabaseServerClient()       → read + write (Route Handlers, Server Actions)
 * - createSupabaseServerClientReadOnly()→ read-only  (Server Components, safe for RSC)
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and set values from Supabase Dashboard → Settings → API."
    );
  }
  return { url, anonKey };
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (required for the service client only). Set it in .env.local — never expose this key to the browser."
    );
  }
  return key;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read + write — for Route Handlers and Server Actions
// ─────────────────────────────────────────────────────────────────────────────
export async function createSupabaseServerClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called from a Server Component — cookies cannot be set.
          // This is fine; the middleware will handle session refresh.
        }
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Read-only — for Server Components (cannot set cookies)
// ─────────────────────────────────────────────────────────────────────────────
export async function createSupabaseServerClientReadOnly() {
  const { url, anonKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service-role client — for privileged server-side operations only.
// Uses SERVICE_ROLE_KEY — never expose to browser.
// ─────────────────────────────────────────────────────────────────────────────
export async function createSupabaseServiceClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceKey = getServiceRoleKey();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard: if Supabase env vars are missing, skip auth checks entirely.
  // This lets the dev server start and show pages even before .env.local exists.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "https://your-project-ref.supabase.co"
  ) {
    // No Supabase configured - pass all requests through unguarded.
    // Dashboard pages may show empty states, but the app won't white-screen.
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Use getUser(), not getSession(), here (getSession is insecure on the server).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/announcements") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/logbook");

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/reset-password");

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../supabase/server";

/**
 * GARBO — Auth Callback Route
 *
 * Supabase redirects here after:
 *   1. Email confirmation
 *   2. Password reset (type=recovery)
 *   3. OAuth provider callback (if added in future)
 *
 * Exchanges the PKCE code for a session and redirects the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const type = searchParams.get("type");

  // Determine where to send the user after successful exchange
  const next =
    type === "recovery"
      ? "/reset-password?type=recovery"
      : searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv    = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Exchange failed — redirect to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
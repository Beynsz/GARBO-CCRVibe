/**
 * Root page (/).
 * - Authenticated users  ? middleware redirects to /home (before this renders)
 * - Unauthenticated users ? shows the public landing page
 *
 * We render the landing content directly here instead of re-exporting
 * from (public)/page.tsx to avoid Next.js App Router re-export edge cases.
 */
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import LandingPage from "./(public)/page";

export { metadata } from "./(public)/page";

export default async function RootPage() {
  const cookieStore = cookies();

  // Secondary safety check in case middleware is bypassed
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/home");
  } catch (error) {
    // If Supabase isn't configured yet, we still show the landing page 
    // so the UI can be previewed during development.
    console.warn("Supabase check skipped in RootPage:", error);
  }

  return <LandingPage />;
}

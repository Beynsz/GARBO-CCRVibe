import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { RealtimeShell } from "@/components/organisms/RealtimeShell";
import { resolvePublicSupabaseKeys } from "@/lib/supabase/public-env";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const publicCfg = resolvePublicSupabaseKeys();
  const hasSupabase =
    publicCfg && publicCfg.url !== "https://your-project-ref.supabase.co";

  let alertCount = 0;

  if (hasSupabase && publicCfg) {
    try {
      const supabase = createServerClient(
        publicCfg.url,
        publicCfg.anonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();

      // If we have Supabase but no user, redirect to login
      if (!user) redirect("/login");

      // Fetch incident count for the sidebar badge (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .gte("incident_date", sevenDaysAgo);

      alertCount = count ?? 0;
    } catch (err) {
      console.warn("[DashboardLayout] Supabase error or missing tables:", err);
      // Fail gracefully: app stays up, alert badge just stays at 0.
    }
  }

  return (
    <DashboardLayout alertCount={alertCount}>
      <RealtimeShell initialCount={alertCount}>
        {children}
      </RealtimeShell>
    </DashboardLayout>
  );
}

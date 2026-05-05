"use client";

/**
 * GARBO — useRealtimeAlerts Hook
 * Subscribes to Supabase Realtime on the `incidents` table.
 * Drives the sidebar alert badge count without a full page refresh.
 *
 * Usage: call in a layout or shell component that mounts once.
 * SDD §4.1.2 — Dashboard updates automatically when new data is entered.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter }           from "next/navigation";
import getSupabaseBrowserClient from "../../supabase/client";
import type { Toast }           from "@/types/app.types";

// ─────────────────────────────────────────────────────────────────────────────
// Realtime alerts hook
// ─────────────────────────────────────────────────────────────────────────────
interface UseRealtimeAlertsReturn {
  liveCount:    number;        // incidents in the last 7 days (live)
  toasts:       Toast[];       // pending in-app toasts to display
  dismissToast: (id: string) => void;
}

export function useRealtimeAlerts(initialCount: number = 0): UseRealtimeAlertsReturn {
  const supabase           = getSupabaseBrowserClient();
  const router             = useRouter();
  const [liveCount, setLiveCount] = useState(initialCount);
  const [toasts,    setToasts   ] = useState<Toast[]>([]);
  const channelRef             = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Push a toast ───────────────────────────────────────────────────────────
  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // max 5 toasts
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  // ── Dismiss a toast manually ───────────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Subscribe to incidents table ───────────────────────────────────────────
  useEffect(() => {
    // Fetch initial count
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .gte(
        "incident_date",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]!
      )
      .then(({ count }) => {
        if (count !== null) setLiveCount(count);
      });

    // Open realtime channel
    const channel = supabase
      .channel("garbo-incidents-realtime")
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "incidents",
        },
        (payload) => {
          // Bump count
          setLiveCount((prev) => prev + 1);

          // Push toast notification
          const record = payload.new as {
            incident_type: string;
            reason_tag:    string;
            incident_date: string;
          };

          pushToast({
            type:    "warning",
            title:   `New Incident: ${record.incident_type}`,
            message: `${record.reason_tag} — ${record.incident_date}`,
          });

          // Soft-refresh page data so tables update
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event:  "DELETE",
          schema: "public",
          table:  "incidents",
        },
        () => {
          setLiveCount((prev) => Math.max(0, prev - 1));
          router.refresh();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [supabase, router, pushToast]);

  return { liveCount, toasts, dismissToast };
}

// ─────────────────────────────────────────────────────────────────────────────
// useRealtimeOperations — optional: refreshes page when any operation is updated
// Useful on the Logbook and Home pages so status changes from other sessions
// appear without manual refresh.
// ─────────────────────────────────────────────────────────────────────────────
export function useRealtimeOperations() {
  const supabase = getSupabaseBrowserClient();
  const router   = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("garbo-ops-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_operations" },
        () => { router.refresh(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, router]);
}   
"use client";

/**
 * GARBO — RealtimeShell
 * Client component mounted once inside the dashboard layout.
 * Activates the realtime incident subscription and renders the toast stack.
 * Keeps the DashboardLayout template itself as a simple presentational component.
 *
 * Usage: wrap {children} in the (dashboard)/layout.tsx with this shell.
 */

import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { ToastContainer }    from "@/components/organisms/ToastContainer";

interface RealtimeShellProps {
  children:     React.ReactNode;
  initialCount: number;
}

export function RealtimeShell({ children, initialCount }: RealtimeShellProps) {
  const { toasts, dismissToast } = useRealtimeAlerts(initialCount);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
"use client";

import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar } from "@/components/organisms/TopBar";
import { cn } from "@/lib/utils/cn";

interface DashboardLayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  className?: string;
}

export function DashboardLayout({
  children,
  alertCount = 0,
  className,
}: DashboardLayoutProps) {
  return (
    <div 
      className="flex min-h-screen" 
      style={{ backgroundColor: '#F5ECD5' }} // Fixed hex to prevent CSS var mismatch
    >
      <Sidebar alertCount={alertCount} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar />

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "px-4 md:px-8 py-6", // Using standard spacing to avoid missing CSS vars
            "animate-fade-in",
            className
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        <footer
          className={cn(
            "shrink-0 flex items-center justify-between",
            "px-4 md:px-8 py-3",
            "border-t border-black/10",
            "bg-white/50 backdrop-blur-sm"
          )}
        >
          <span className="text-xs text-gray-500">
            © 2026 GARBO. All rights reserved.
          </span>
          <div className="flex gap-4 text-xs text-gray-500">
            <button className="hover:text-green-800 transition-colors">Privacy Policy</button>
            <button className="hover:text-green-800 transition-colors">Terms of Service</button>
            <button className="hover:text-green-800 transition-colors">Contact Us</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
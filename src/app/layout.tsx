import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "GARBO - Barangay Banilad",
    template: "%s | GARBO",
  },
  description:
    "Waste Management and Monitoring System for Barangay Banilad. " +
    "Manage garbage collection schedules, track daily operations, " +
    "and report incidents efficiently.",
  keywords: ["waste management", "barangay", "Banilad", "GARBO", "garbage collection"],
  authors: [{ name: "CCRVibe Tech" }],
  robots: "noindex, nofollow",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
  themeColor: "#F5ECD5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      {/*
          Fonts load via globals.css @import.
          Inline style sets BG color before CSS variables resolve.
      */}
      <body
        style={{ minHeight: "100vh", backgroundColor: "#F5ECD5" }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}

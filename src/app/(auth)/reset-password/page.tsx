import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestResetForm, UpdatePasswordForm } from "@/components/organisms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your GARBO administrator password.",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  // Supabase appends ?type=recovery when the user clicks the reset link
  const isRecovery = params.type === "recovery";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--color-bg-page)" }}
    >
      <Suspense fallback={null}>
        {isRecovery ? <UpdatePasswordForm /> : <RequestResetForm />}
      </Suspense>
    </main>
  );
}
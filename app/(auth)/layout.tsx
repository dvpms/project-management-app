import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { getSessionUserId } from "@/lib/auth-guard";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await getSessionUserId();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-ink">
      <PageTransition className="flex w-full justify-center">
        {children}
      </PageTransition>
    </div>
  );
}

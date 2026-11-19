import { redirect } from "next/navigation";
import type { ReactNode } from "react";
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
      {children}
    </div>
  );
}

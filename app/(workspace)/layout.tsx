import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { WorkspaceProviders } from "@/components/layout/WorkspaceProviders";
import { requireWorkspaceUser } from "@/lib/auth-guard";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireWorkspaceUser();

  return (
    <WorkspaceProviders initialTheme={user.theme}>
      <div className="min-h-screen bg-surface text-ink transition-colors duration-150">
        <Navbar user={user} />
        <main className="mx-auto max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10">
          <PageTransition className="flex flex-col gap-10">
            {children}
          </PageTransition>
        </main>
      </div>
    </WorkspaceProviders>
  );
}

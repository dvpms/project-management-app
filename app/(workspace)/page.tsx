import type { Metadata } from "next";
import { WorkspaceClient } from "@/components/workspace/WorkspaceClient";
import { requireWorkspaceUser } from "@/lib/auth-guard";
import { getDashboardWorkspaceData } from "@/services/workspace-service";

export const metadata: Metadata = {
  title: "Dashboard — Space Kanban",
};

export default async function DashboardPage() {
  const user = await requireWorkspaceUser();
  const data = await getDashboardWorkspaceData(user.id);

  return <WorkspaceClient data={data} />;
}

import type { Metadata } from "next";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";
import { requireWorkspaceUser } from "@/lib/auth-guard";
import { listUserProjectsWithCounts } from "@/services/project-service";

export const metadata: Metadata = {
  title: "Daftar Proyek — Space Kanban",
};

export default async function ProjectsPage() {
  const user = await requireWorkspaceUser();
  const projects = await listUserProjectsWithCounts(user.id);

  return <ProjectsListClient projects={projects} />;
}

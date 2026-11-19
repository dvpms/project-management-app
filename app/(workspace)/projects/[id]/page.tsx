import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { requireWorkspaceUser } from "@/lib/auth-guard";
import {
  getProjectDetailById,
  listUserProjectsWithCounts,
} from "@/services/project-service";

export const metadata: Metadata = {
  title: "Detail Proyek — Space Kanban",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireWorkspaceUser();
  const { id } = await params;

  const [project, allProjects] = await Promise.all([
    getProjectDetailById(user.id, id),
    listUserProjectsWithCounts(user.id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <ProjectDetailClient
      project={project}
      allProjects={allProjects.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}

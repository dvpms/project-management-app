import type { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";
import {
  resolveProjectTone,
  type ProjectColorTone,
} from "@/lib/project-constants";
import { prisma } from "@/lib/prisma";

export interface DashboardActiveProject {
  id: string;
  name: string;
  color: ProjectColorTone;
}

export interface DashboardTaskItem {
  id: string;
  projectId: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  order: number;
  isArchived: boolean;
}

export interface DashboardWorkspaceData {
  activeProjects: DashboardActiveProject[];
  allProjects: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; projectId: string; title: string }>;
  tasks: DashboardTaskItem[];
}

export async function getDashboardWorkspaceData(
  userId: string
): Promise<DashboardWorkspaceData> {
  const [projects, milestones, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, name: true, status: true, color: true },
    }),
    prisma.milestone.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, projectId: true, title: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        isArchived: false,
        project: { status: "ACTIVE" },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        milestone: { select: { title: true } },
      },
    }),
  ]);

  const activeProjects = projects
    .filter((p) => p.status === "ACTIVE")
    .map((p) => ({
      id: p.id,
      name: p.name,
      color: resolveProjectTone(p.color),
    }));

  return {
    activeProjects,
    allProjects: projects.map((p) => ({ id: p.id, name: p.name })),
    milestones,
    tasks: tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      milestoneId: t.milestoneId,
      milestoneTitle: t.milestone?.title ?? null,
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
      order: t.order,
      isArchived: t.isArchived,
    })),
  };
}

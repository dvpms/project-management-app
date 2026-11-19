import type { ProjectStatus } from "@/app/generated/prisma/enums";
import type { Prisma } from "@/app/generated/prisma/client";
import {
  parseProjectAttributes,
  resolveProjectTone,
  type ProjectAttribute,
  type ProjectColorTone,
} from "@/lib/project-constants";
import { prisma } from "@/lib/prisma";
import type {
  CreateProjectInput,
  UpdateProjectConfigInput,
  UpdateProjectNotesInput,
  UpdateProjectStatusInput,
} from "@/lib/validations/project";

export interface ProjectSummaryItem {
  id: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  color: ProjectColorTone;
  totalTasks: number;
  doneTasks: number;
  updatedAt: string;
}

export interface ProjectDetailData {
  id: string;
  name: string;
  summary: string;
  notes: string;
  status: ProjectStatus;
  color: ProjectColorTone;
  attributes: ProjectAttribute[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string | null;
    totalTasks: number;
    doneTasks: number;
  }>;
  tasks: Array<{
    id: string;
    projectId: string;
    milestoneId: string | null;
    milestoneTitle: string | null;
    parentId: string | null;
    parentTitle: string | null;
    title: string;
    description: string;
    status: "BACKLOG" | "ON_PROGRESS" | "REVIEW" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate: string | null;
    order: number;
    isArchived: boolean;
  }>;
}

export async function listUserProjectsWithCounts(
  userId: string
): Promise<ProjectSummaryItem[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      tasks: {
        select: { id: true, status: true, parentId: true },
      },
    },
  });

  return projects.map((project) => {
    const parentIds = new Set(
      project.tasks
        .map((t) => t.parentId)
        .filter((id): id is string => Boolean(id))
    );
    const leafTasks = project.tasks.filter((t) => !parentIds.has(t.id));

    return {
      id: project.id,
      name: project.name,
      summary: project.summary ?? "",
      status: project.status,
      color: resolveProjectTone(project.color),
      totalTasks: leafTasks.length,
      doneTasks: leafTasks.filter((t) => t.status === "DONE").length,
      updatedAt: project.updatedAt.toISOString(),
    };
  });
}

export async function getProjectDetailById(
  userId: string,
  projectId: string
): Promise<ProjectDetailData | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      milestones: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      tasks: {
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          milestone: { select: { title: true } },
          parent: { select: { title: true } },
        },
      },
    },
  });

  if (!project) return null;

  const parentIds = new Set(
    project.tasks
      .map((t) => t.parentId)
      .filter((id): id is string => Boolean(id))
  );

  return {
    id: project.id,
    name: project.name,
    summary: project.summary ?? "",
    notes: project.notes ?? "",
    status: project.status,
    color: resolveProjectTone(project.color),
    attributes: parseProjectAttributes(project.attributes),
    milestones: project.milestones.map((m) => {
      const linked = project.tasks.filter(
        (t) => t.milestoneId === m.id && !parentIds.has(t.id)
      );
      return {
        id: m.id,
        title: m.title,
        description: m.description ?? "",
        targetDate: m.targetDate ? m.targetDate.toISOString().slice(0, 10) : null,
        totalTasks: linked.length,
        doneTasks: linked.filter((t) => t.status === "DONE").length,
      };
    }),
    tasks: project.tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      milestoneId: t.milestoneId,
      milestoneTitle: t.milestone?.title ?? null,
      parentId: t.parentId,
      parentTitle: t.parent?.title ?? null,
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

export async function createProject(userId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      userId,
      name: input.name,
      summary: input.summary ?? "",
      status: input.status,
      color: input.color,
      attributes: [],
    },
    select: { id: true, name: true },
  });
}

export async function updateProjectConfig(
  userId: string,
  input: UpdateProjectConfigInput
) {
  const existing = await prisma.project.findFirst({
    where: { id: input.projectId, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Proyek tidak ditemukan.");
  }

  return prisma.project.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      summary: input.summary ?? "",
      status: input.status,
      color: input.color,
      attributes: input.attributes as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });
}

export async function updateProjectNotes(
  userId: string,
  input: UpdateProjectNotesInput
) {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId, userId },
    data: { notes: input.notes },
  });
  if (result.count === 0) {
    throw new Error("Proyek tidak ditemukan.");
  }
}

export async function updateProjectStatus(
  userId: string,
  input: UpdateProjectStatusInput
) {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId, userId },
    data: { status: input.status },
  });
  if (result.count === 0) {
    throw new Error("Proyek tidak ditemukan.");
  }
}

export async function deleteProject(userId: string, projectId: string) {
  const result = await prisma.project.deleteMany({
    where: { id: projectId, userId },
  });
  if (result.count === 0) {
    throw new Error("Proyek tidak ditemukan.");
  }
}

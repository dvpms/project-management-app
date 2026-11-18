import { prisma } from "@/lib/prisma";
import type {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "@/lib/validations/task";

function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function resolveValidMilestoneId(
  userId: string,
  projectId: string,
  milestoneId?: string | null
): Promise<string | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Proyek tidak ditemukan.");
  }

  if (!milestoneId) return null;

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, projectId, userId },
    select: { id: true },
  });
  return milestone ? milestone.id : null;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const milestoneId = await resolveValidMilestoneId(
    userId,
    input.projectId,
    input.milestoneId
  );

  const count = await prisma.task.count({
    where: { userId, status: input.status, isArchived: false },
  });

  return prisma.task.create({
    data: {
      userId,
      projectId: input.projectId,
      milestoneId,
      title: input.title,
      description: input.description ?? "",
      status: input.status,
      priority: input.priority,
      dueDate: parseOptionalDate(input.dueDate),
      order: count,
    },
    select: { id: true, projectId: true },
  });
}

export async function updateTask(userId: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({
    where: { id: input.taskId, userId },
    select: { id: true, projectId: true },
  });
  if (!existing) {
    throw new Error("Tugas tidak ditemukan.");
  }

  const milestoneId = await resolveValidMilestoneId(
    userId,
    input.projectId,
    input.milestoneId
  );

  return prisma.task.update({
    where: { id: existing.id },
    data: {
      projectId: input.projectId,
      milestoneId,
      title: input.title,
      description: input.description ?? "",
      status: input.status,
      priority: input.priority,
      dueDate: parseOptionalDate(input.dueDate),
    },
    select: { id: true, projectId: true },
  });
}

export async function moveTask(userId: string, input: MoveTaskInput) {
  const existing = await prisma.task.findFirst({
    where: { id: input.taskId, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Tugas tidak ditemukan.");
  }

  const uniqueIds = Array.from(new Set(input.orderedTaskIds));
  if (!uniqueIds.includes(input.taskId)) {
    uniqueIds.push(input.taskId);
  }

  await prisma.$transaction(
    uniqueIds.map((id, index) =>
      prisma.task.updateMany({
        where: { id, userId },
        data: {
          status: input.targetStatus,
          order: index,
        },
      })
    )
  );
}

export async function archiveDoneTasks(
  userId: string,
  projectId?: string | null
) {
  const whereClause = projectId
    ? { userId, projectId, status: "DONE" as const, isArchived: false }
    : {
        userId,
        status: "DONE" as const,
        isArchived: false,
        project: { status: "ACTIVE" as const },
      };

  const result = await prisma.task.updateMany({
    where: whereClause,
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });
  return result.count;
}

export async function archiveSingleTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, projectId: true },
  });
  if (!existing) {
    throw new Error("Tugas tidak ditemukan.");
  }

  await prisma.task.update({
    where: { id: existing.id },
    data: { isArchived: true, archivedAt: new Date() },
  });
  return existing.projectId;
}

export async function restoreTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, projectId: true },
  });
  if (!existing) {
    throw new Error("Tugas tidak ditemukan.");
  }

  await prisma.task.update({
    where: { id: existing.id },
    data: { isArchived: false, archivedAt: null },
  });
  return existing.projectId;
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, projectId: true },
  });
  if (!existing) {
    throw new Error("Tugas tidak ditemukan.");
  }

  await prisma.task.delete({ where: { id: existing.id } });
  return existing.projectId;
}

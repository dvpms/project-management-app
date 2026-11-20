import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveParentStatus } from "@/lib/task-helpers";
import type {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "@/lib/validations/task";

type TaskDbClient = Prisma.TransactionClient | typeof prisma;

function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function resolveValidMilestoneId(
  db: TaskDbClient,
  userId: string,
  projectId: string,
  milestoneId?: string | null
): Promise<string | null> {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Proyek tidak ditemukan.");
  }

  if (!milestoneId) return null;

  const milestone = await db.milestone.findFirst({
    where: { id: milestoneId, projectId, userId },
    select: { id: true },
  });
  return milestone ? milestone.id : null;
}

async function syncParentTaskState(
  tx: Prisma.TransactionClient,
  userId: string,
  parentId: string
): Promise<void> {
  const [subtasks, parent] = await Promise.all([
    tx.task.findMany({
      where: { userId, parentId },
      select: { status: true, isArchived: true },
    }),
    tx.task.findFirst({
      where: { id: parentId, userId },
      select: { id: true, archivedAt: true },
    }),
  ]);

  if (!parent || subtasks.length === 0) return;

  const nextStatus = deriveParentStatus(subtasks.map((s) => s.status));
  const allArchived = subtasks.every((s) => s.isArchived);

  await tx.task.update({
    where: { id: parent.id },
    data: {
      status: nextStatus,
      isArchived: allArchived,
      archivedAt: allArchived ? (parent.archivedAt ?? new Date()) : null,
    },
  });
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.$transaction(async (tx) => {
    if (input.parentId) {
      const parent = await tx.task.findFirst({
        where: { id: input.parentId, userId },
        select: { id: true, parentId: true, projectId: true, milestoneId: true },
      });
      if (!parent) {
        throw new Error("Tugas induk tidak ditemukan.");
      }
      if (parent.parentId !== null) {
        throw new Error("Sub-tugas hanya mendukung maksimal 1 tingkat.");
      }

      const count = await tx.task.count({
        where: { userId, status: input.status, isArchived: false },
      });

      const created = await tx.task.create({
        data: {
          userId,
          projectId: parent.projectId,
          milestoneId: parent.milestoneId,
          parentId: parent.id,
          title: input.title,
          description: input.description ?? "",
          status: input.status,
          priority: input.priority,
          dueDate: parseOptionalDate(input.dueDate),
          order: count,
        },
        select: { id: true, projectId: true },
      });

      await syncParentTaskState(tx, userId, parent.id);
      return created;
    }

    const milestoneId = await resolveValidMilestoneId(
      tx,
      userId,
      input.projectId,
      input.milestoneId
    );

    const count = await tx.task.count({
      where: { userId, status: input.status, isArchived: false },
    });

    return tx.task.create({
      data: {
        userId,
        projectId: input.projectId,
        milestoneId,
        parentId: null,
        title: input.title,
        description: input.description ?? "",
        status: input.status,
        priority: input.priority,
        dueDate: parseOptionalDate(input.dueDate),
        order: count,
      },
      select: { id: true, projectId: true },
    });
  });
}

export async function updateTask(userId: string, input: UpdateTaskInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: input.taskId, userId },
      select: {
        id: true,
        projectId: true,
        parentId: true,
        _count: { select: { subtasks: true } },
      },
    });
    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    if (existing.parentId) {
      const parent = await tx.task.findFirst({
        where: { id: existing.parentId, userId },
        select: { id: true, projectId: true, milestoneId: true },
      });
      const nextProjectId = parent?.projectId ?? existing.projectId;
      const nextMilestoneId = parent?.milestoneId ?? null;

      await tx.task.update({
        where: { id: existing.id },
        data: {
          projectId: nextProjectId,
          milestoneId: nextMilestoneId,
          title: input.title,
          description: input.description ?? "",
          status: input.status,
          priority: input.priority,
          dueDate: parseOptionalDate(input.dueDate),
        },
      });

      await syncParentTaskState(tx, userId, existing.parentId);
      return {
        id: existing.id,
        projectId: nextProjectId,
        previousProjectId: existing.projectId,
      };
    }

    const milestoneId = await resolveValidMilestoneId(
      tx,
      userId,
      input.projectId,
      input.milestoneId
    );

    if (existing._count.subtasks > 0) {
      await tx.task.update({
        where: { id: existing.id },
        data: {
          projectId: input.projectId,
          milestoneId,
          title: input.title,
          description: input.description ?? "",
          priority: input.priority,
          dueDate: parseOptionalDate(input.dueDate),
        },
      });

      await tx.task.updateMany({
        where: { parentId: existing.id, userId },
        data: {
          projectId: input.projectId,
          milestoneId,
        },
      });

      await syncParentTaskState(tx, userId, existing.id);
      return {
        id: existing.id,
        projectId: input.projectId,
        previousProjectId: existing.projectId,
      };
    }

    await tx.task.update({
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
    });

    return {
      id: existing.id,
      projectId: input.projectId,
      previousProjectId: existing.projectId,
    };
  });
}

export async function moveTask(
  userId: string,
  input: MoveTaskInput
): Promise<string[]> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: input.taskId, userId },
      select: { id: true, projectId: true, parentId: true },
    });
    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    await tx.task.update({
      where: { id: existing.id },
      data: {
        status: input.targetStatus,
      },
    });

    if (existing.parentId) {
      await syncParentTaskState(tx, userId, existing.parentId);
    }

    return [existing.projectId];
  });
}

export async function archiveDoneTasks(
  userId: string,
  projectId?: string | null
): Promise<{ count: number; projectIds: string[] }> {
  return prisma.$transaction(async (tx) => {
    const whereClause = projectId
      ? {
          userId,
          projectId,
          status: "DONE" as const,
          isArchived: false,
          subtasks: { none: {} },
        }
      : {
          userId,
          status: "DONE" as const,
          isArchived: false,
          subtasks: { none: {} },
          project: { status: "ACTIVE" as const },
        };

    const matching = await tx.task.findMany({
      where: whereClause,
      select: { id: true, parentId: true, projectId: true },
    });

    if (matching.length === 0) {
      return { count: 0, projectIds: [] };
    }

    await tx.task.updateMany({
      where: { id: { in: matching.map((m) => m.id) }, userId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    const parentIds = Array.from(
      new Set(
        matching
          .map((m) => m.parentId)
          .filter((id): id is string => Boolean(id))
      )
    );
    for (const parentId of parentIds) {
      await syncParentTaskState(tx, userId, parentId);
    }

    return {
      count: matching.length,
      projectIds: Array.from(new Set(matching.map((m) => m.projectId))),
    };
  });
}

export async function archiveSingleTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: taskId, userId },
      select: {
        id: true,
        projectId: true,
        parentId: true,
        _count: { select: { subtasks: true } },
      },
    });
    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    const now = new Date();
    await tx.task.update({
      where: { id: existing.id },
      data: { isArchived: true, archivedAt: now },
    });

    if (existing._count.subtasks > 0) {
      await tx.task.updateMany({
        where: {
          parentId: existing.id,
          userId,
          status: "DONE",
          isArchived: false,
        },
        data: { isArchived: true, archivedAt: now },
      });
    }

    if (existing.parentId) {
      await syncParentTaskState(tx, userId, existing.parentId);
    }

    return existing.projectId;
  });
}

export async function restoreTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: taskId, userId },
      select: {
        id: true,
        projectId: true,
        parentId: true,
        _count: { select: { subtasks: true } },
      },
    });
    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    await tx.task.update({
      where: { id: existing.id },
      data: { isArchived: false, archivedAt: null },
    });

    if (existing._count.subtasks > 0) {
      await tx.task.updateMany({
        where: { parentId: existing.id, userId },
        data: { isArchived: false, archivedAt: null },
      });
      await syncParentTaskState(tx, userId, existing.id);
    }

    if (existing.parentId) {
      await syncParentTaskState(tx, userId, existing.parentId);
    }

    return existing.projectId;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true, projectId: true, parentId: true },
    });
    if (!existing) {
      throw new Error("Tugas tidak ditemukan.");
    }

    await tx.task.delete({ where: { id: existing.id } });

    if (existing.parentId) {
      await syncParentTaskState(tx, userId, existing.parentId);
    }

    return existing.projectId;
  });
}

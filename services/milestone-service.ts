import { prisma } from "@/lib/prisma";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/lib/validations/milestone";

function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function assertProjectOwned(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Proyek tidak ditemukan.");
  }
}

export async function createMilestone(
  userId: string,
  input: CreateMilestoneInput
) {
  await assertProjectOwned(userId, input.projectId);

  const count = await prisma.milestone.count({
    where: { projectId: input.projectId },
  });

  return prisma.milestone.create({
    data: {
      userId,
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? "",
      targetDate: parseOptionalDate(input.targetDate),
      order: count,
    },
    select: { id: true, projectId: true },
  });
}

export async function updateMilestone(
  userId: string,
  input: UpdateMilestoneInput
) {
  const existing = await prisma.milestone.findFirst({
    where: { id: input.milestoneId, projectId: input.projectId, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Milestone tidak ditemukan.");
  }

  return prisma.milestone.update({
    where: { id: existing.id },
    data: {
      title: input.title,
      description: input.description ?? "",
      targetDate: parseOptionalDate(input.targetDate),
    },
    select: { id: true, projectId: true },
  });
}

export async function deleteMilestone(userId: string, milestoneId: string) {
  const existing = await prisma.milestone.findFirst({
    where: { id: milestoneId, userId },
    select: { id: true, projectId: true },
  });
  if (!existing) {
    throw new Error("Milestone tidak ditemukan.");
  }

  await prisma.milestone.delete({ where: { id: existing.id } });
  return existing.projectId;
}

import type { TaskStatus } from "@/app/generated/prisma/enums";

const ACTIVE_STATUS_WEIGHT: Record<TaskStatus, number> = {
  ON_PROGRESS: 0,
  REVIEW: 1,
  BACKLOG: 2,
  DONE: 3,
};

export function sortProjectActiveTasks<
  T extends { status: TaskStatus; order: number }
>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const weightDiff = ACTIVE_STATUS_WEIGHT[a.status] - ACTIVE_STATUS_WEIGHT[b.status];
    if (weightDiff !== 0) return weightDiff;
    return a.order - b.order;
  });
}

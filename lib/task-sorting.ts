import type { TaskStatus } from "@/app/generated/prisma/enums";

const ACTIVE_STATUS_WEIGHT: Record<TaskStatus, number> = {
  ON_PROGRESS: 0,
  REVIEW: 1,
  BACKLOG: 2,
  DONE: 3,
};

export interface ScheduleSortableTask {
  dueDate: string | null;
  createdAt?: string | null;
  order?: number;
  id?: string;
}

/**
 * Orders tasks by planned date ascending (undated last), then oldest createdAt first (FIFO).
 */
export function compareTasksBySchedule<T extends ScheduleSortableTask>(
  a: T,
  b: T
): number {
  if (a.dueDate && b.dueDate) {
    const dueDiff = a.dueDate.localeCompare(b.dueDate);
    if (dueDiff !== 0) return dueDiff;
  } else if (a.dueDate && !b.dueDate) {
    return -1;
  } else if (!a.dueDate && b.dueDate) {
    return 1;
  }

  if (a.createdAt && b.createdAt) {
    const createdDiff = a.createdAt.localeCompare(b.createdAt);
    if (createdDiff !== 0) return createdDiff;
  }

  if (
    a.order !== undefined &&
    b.order !== undefined &&
    a.order !== b.order
  ) {
    return a.order - b.order;
  }

  if (a.id && b.id) {
    return a.id.localeCompare(b.id);
  }

  return 0;
}

export function sortTasksBySchedule<T extends ScheduleSortableTask>(
  tasks: T[]
): T[] {
  return [...tasks].sort(compareTasksBySchedule);
}

export function sortProjectActiveTasks<
  T extends ScheduleSortableTask & { status: TaskStatus }
>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const weightDiff =
      ACTIVE_STATUS_WEIGHT[a.status] - ACTIVE_STATUS_WEIGHT[b.status];
    if (weightDiff !== 0) return weightDiff;
    return compareTasksBySchedule(a, b);
  });
}

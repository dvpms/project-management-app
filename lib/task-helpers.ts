import type { TaskStatus } from "@/app/generated/prisma/enums";

/**
 * Strips common Markdown syntax to produce concise plain-text previews for cards.
 */
export function stripMarkdownToPlainText(markdown: string): string {
  if (!markdown) return "";

  return markdown
    .replace(/```[\w-]*\r?\n?/g, "")
    .replace(/```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,!?;:])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes a container parent's Kanban status from its subtasks' statuses.
 */
export function deriveParentStatus(statuses: TaskStatus[]): TaskStatus {
  if (statuses.length === 0) return "BACKLOG";
  if (statuses.every((s) => s === "DONE")) return "DONE";
  if (statuses.every((s) => s === "BACKLOG")) return "BACKLOG";
  if (statuses.some((s) => s === "ON_PROGRESS" || s === "BACKLOG")) {
    return "ON_PROGRESS";
  }
  return "REVIEW";
}

/**
 * Recomputes optimistic parent statuses and archive flags after client-side mutations.
 */
export function recomputeOptimisticParents<
  T extends {
    id: string;
    parentId: string | null;
    status: TaskStatus;
    isArchived: boolean;
  },
>(tasks: T[]): T[] {
  const subtasksByParent = new Map<string, T[]>();
  for (const task of tasks) {
    if (!task.parentId) continue;
    const list = subtasksByParent.get(task.parentId);
    if (list) {
      list.push(task);
    } else {
      subtasksByParent.set(task.parentId, [task]);
    }
  }

  return tasks.map((task) => {
    const children = subtasksByParent.get(task.id);
    if (!children || children.length === 0) return task;
    return {
      ...task,
      status: deriveParentStatus(children.map((c) => c.status)),
      isArchived: children.every((c) => c.isArchived),
    };
  });
}

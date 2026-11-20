"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { restoreTaskAction } from "@/actions/task-actions";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import {
  Badge,
  Button,
  Card,
  Icon,
  Select,
  useConfirm,
  useToast,
} from "@/components/ui";
import { CHEVRON_TRANSITION, COLLAPSE_TRANSITION } from "@/lib/motion";
import { PRIORITY_META, TASK_STATUS_META } from "@/lib/project-constants";
import { stripMarkdownToPlainText } from "@/lib/task-helpers";
import {
  sortProjectActiveTasks,
  sortTasksBySchedule,
} from "@/lib/task-sorting";
import type { ProjectDetailData } from "@/services/project-service";
import { cn } from "@/lib/utils";

type ProjectTaskRow = ProjectDetailData["tasks"][number];

function getStatusIcon(status: TaskStatus) {
  if (status === "DONE") {
    return { name: "check_circle", color: "text-[#16A34A]" };
  }
  if (status === "ON_PROGRESS") {
    return { name: "pending", color: "text-[#0284C7]" };
  }
  if (status === "REVIEW") {
    return { name: "pending", color: "text-[#D97706]" };
  }
  return { name: "radio_button_unchecked", color: "text-ink-muted" };
}

export function ProjectTasksSection({
  tasks,
  onSelectTask,
  onAddTask,
  onAddSubtask,
}: {
  tasks: ProjectTaskRow[];
  onSelectTask: (task: ProjectTaskRow) => void;
  onAddTask: () => void;
  onAddSubtask?: (parentId: string) => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | TaskStatus | "ARCHIVED">("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const subtasksByParent = new Map<string, ProjectTaskRow[]>();
  const tasksById = new Map<string, ProjectTaskRow>();
  for (const task of tasks) {
    tasksById.set(task.id, task);
    if (!task.parentId) continue;
    const list = subtasksByParent.get(task.parentId);
    if (list) {
      list.push(task);
    } else {
      subtasksByParent.set(task.parentId, [task]);
    }
  }

  const archivedCount = tasks.filter(
    (t) => t.isArchived && !subtasksByParent.has(t.id)
  ).length;

  const topLevelTasks = tasks.filter((t) => !t.parentId);

  const visibleTopLevelTasks = sortProjectActiveTasks(
    topLevelTasks.filter((t) => {
      if (filter === "ARCHIVED") return t.isArchived;
      if (t.isArchived) return false;
      if (filter === "ALL") return true;
      const children = subtasksByParent.get(t.id) ?? [];
      return (
        t.status === filter ||
        children.some((c) => !c.isArchived && c.status === filter)
      );
    })
  );

  const archivedOrphanSubtasks =
    filter === "ARCHIVED"
      ? sortTasksBySchedule(
          tasks.filter(
            (t) =>
              t.parentId !== null &&
              t.isArchived &&
              !(tasksById.get(t.parentId)?.isArchived ?? false)
          )
        )
      : [];

  const toggleExpand = (taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleRestore = async (task: ProjectTaskRow) => {
    const ok = await confirm({
      title: "Pulihkan Tugas ke Board?",
      message: `"${task.title}" akan tampil kembali pada papan Space Kanban.`,
      confirmLabel: "Pulihkan",
      cancelLabel: "Batal",
      tone: "primary",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await restoreTaskAction(task.id);
      if (!res.ok) {
        showToast({
          title: "Gagal memulihkan tugas",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Tugas dipulihkan ke board", variant: "success" });
      router.refresh();
    });
  };

  const displayedCount =
    visibleTopLevelTasks.length + archivedOrphanSubtasks.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-ink">
          <Icon name="checklist" size="md" />
          Daftar Tugas Proyek ({displayedCount})
        </h2>

        <div className="w-52">
          <Select
            aria-label="Filter status tugas proyek"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "ALL" | TaskStatus | "ARCHIVED")
            }
            className="h-9 rounded-xl px-3 py-1 text-[13px]"
          >
            <option value="ALL">Semua Status (Aktif)</option>
            <option value="BACKLOG">Belum dikerjakan</option>
            <option value="ON_PROGRESS">Sedang dikerjakan</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Selesai</option>
            <option value="ARCHIVED">Riwayat Arsip ({archivedCount})</option>
          </Select>
        </div>
      </div>

      {displayedCount === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-sans text-[14px] font-medium text-ink-muted">
            Belum ada tugas pada filter ini.
          </p>
          {filter !== "ARCHIVED" && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Icon name="add" size="sm" />}
                onClick={onAddTask}
              >
                Tambah Tugas Pertama
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto overscroll-contain pt-0.5 pr-1.5 pb-1.5">
          {visibleTopLevelTasks.map((t) => {
            const statusMeta = TASK_STATUS_META[t.status];
            const priorityMeta = PRIORITY_META[t.priority];
            const statusIcon = getStatusIcon(t.status);
            const descriptionPreview = stripMarkdownToPlainText(t.description);
            const allChildren = sortProjectActiveTasks(
              subtasksByParent.get(t.id) ?? []
            );
            const shownChildren =
              filter === "ARCHIVED"
                ? allChildren.filter((c) => c.isArchived)
                : filter === "ALL"
                  ? allChildren
                  : allChildren.filter(
                      (c) => !c.isArchived && c.status === filter
                    );
            const hasChildren = allChildren.length > 0;
            const doneChildrenCount = allChildren.filter(
              (c) => c.status === "DONE"
            ).length;
            const isExpanded = expandedIds.has(t.id);

            return (
              <Card
                key={t.id}
                interactive
                onClick={() => onSelectTask(t)}
                className="flex shrink-0 flex-col gap-3 px-4 py-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(t.id);
                        }}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded ? "Tutup sub-tugas" : "Lihat sub-tugas"
                        }
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-surface-hover text-ink-muted hover:text-ink cursor-pointer"
                      >
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={CHEVRON_TRANSITION}
                          className="inline-flex items-center justify-center"
                        >
                          <Icon name="chevron_right" size="sm" />
                        </motion.span>
                      </button>
                    )}

                    <Icon
                      name={statusIcon.name}
                      size="md"
                      filled={t.status === "DONE"}
                      className={cn("mt-0.5 shrink-0", statusIcon.color)}
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-display text-[15px] font-bold text-ink",
                          t.status === "DONE" && "text-ink-muted line-through"
                        )}
                      >
                        {t.title}
                      </p>

                      {descriptionPreview && (
                        <p className="mt-1 line-clamp-2 font-sans text-[12px] font-medium leading-[1.45] text-ink-muted">
                          {descriptionPreview}
                        </p>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
                        <span className={priorityMeta.textColor}>
                          {priorityMeta.label}
                        </span>
                        {t.dueDate && (
                          <span className="text-ink-muted">
                            · Tenggat: {t.dueDate}
                          </span>
                        )}
                        {t.milestoneTitle && (
                          <span className="text-ink-muted">
                            · {t.milestoneTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {hasChildren && (
                      <Badge
                        variant={
                          doneChildrenCount === allChildren.length
                            ? "success"
                            : "primary"
                        }
                        mono
                      >
                        {doneChildrenCount}/{allChildren.length}
                      </Badge>
                    )}
                    <Badge variant={statusMeta.badgeVariant}>
                      {statusMeta.label}
                    </Badge>
                    {t.isArchived && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleRestore(t)}
                      >
                        Pulihkan
                      </Button>
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {hasChildren && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={COLLAPSE_TRANSITION}
                      className="overflow-hidden"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="ml-3 flex flex-col gap-2 border-l-2 border-border-soft pl-3.5 pt-1"
                      >
                        {shownChildren.map((sub) => {
                          const subStatusMeta = TASK_STATUS_META[sub.status];
                          const subIcon = getStatusIcon(sub.status);
                          const subDesc = stripMarkdownToPlainText(sub.description);

                          return (
                            <div
                              key={sub.id}
                              onClick={() => onSelectTask(sub)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onSelectTask(sub);
                                }
                              }}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-border-soft bg-surface-hover px-3.5 py-2.5 transition-colors hover:border-primary cursor-pointer"
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                                <Icon
                                  name={subIcon.name}
                                  size="sm"
                                  filled={sub.status === "DONE"}
                                  className={cn("mt-0.5 shrink-0", subIcon.color)}
                                />
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      "font-display text-[13px] font-bold text-ink",
                                      sub.status === "DONE" &&
                                        "text-ink-muted line-through"
                                    )}
                                  >
                                    {sub.title}
                                  </p>
                                  {subDesc && (
                                    <p className="mt-0.5 line-clamp-1 font-sans text-[12px] font-medium text-ink-muted">
                                      {subDesc}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div
                                className="flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {sub.isArchived && (
                                  <Badge variant="neutral">Arsip</Badge>
                                )}
                                <Badge variant={subStatusMeta.badgeVariant}>
                                  {subStatusMeta.label}
                                </Badge>
                                {sub.isArchived && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => handleRestore(sub)}
                                  >
                                    Pulihkan
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {filter !== "ARCHIVED" && onAddSubtask && (
                          <div className="pt-0.5">
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Icon name="add" size="sm" />}
                              onClick={() => onAddSubtask(t.id)}
                            >
                              Sub-tugas
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}

          {archivedOrphanSubtasks.map((sub) => {
            const subStatusMeta = TASK_STATUS_META[sub.status];
            const subDesc = stripMarkdownToPlainText(sub.description);

            return (
              <Card
                key={sub.id}
                interactive
                onClick={() => onSelectTask(sub)}
                className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Icon
                    name="subdirectory_arrow_right"
                    size="md"
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <div className="min-w-0 flex-1">
                    {sub.parentTitle && (
                      <p className="font-mono text-[11px] font-bold text-ink-muted">
                        Induk: {sub.parentTitle}
                      </p>
                    )}
                    <p
                      className={cn(
                        "font-display text-[15px] font-bold text-ink",
                        sub.status === "DONE" && "text-ink-muted line-through"
                      )}
                    >
                      {sub.title}
                    </p>
                    {subDesc && (
                      <p className="mt-1 line-clamp-1 font-sans text-[12px] font-medium text-ink-muted">
                        {subDesc}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant={subStatusMeta.badgeVariant}>
                    {subStatusMeta.label}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleRestore(sub)}
                  >
                    Pulihkan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Badge, Card, Icon, IconButton, Input } from "@/components/ui";
import { CHEVRON_TRANSITION, COLLAPSE_TRANSITION } from "@/lib/motion";
import { PROJECT_COLOR_DOT, TASK_STATUS_META } from "@/lib/project-constants";
import {
  sortProjectActiveTasks,
  sortTasksBySchedule,
} from "@/lib/task-sorting";
import type {
  DashboardActiveProject,
  DashboardTaskItem,
} from "@/services/workspace-service";
import { cn } from "@/lib/utils";

function ProjectTaskRowItem({
  task,
  subtasks,
  expanded,
  onToggleExpand,
  onSelectTask,
}: {
  task: DashboardTaskItem;
  subtasks: DashboardTaskItem[];
  expanded: boolean;
  onToggleExpand: () => void;
  onSelectTask: (task: DashboardTaskItem) => void;
}) {
  const statusMeta = TASK_STATUS_META[task.status];
  const hasChildren = subtasks.length > 0;
  const doneSubCount = subtasks.filter((c) => c.status === "DONE").length;
  const isDoneRow = task.status === "DONE";

  return (
    <div className="py-1">
      <div className="flex w-full items-center gap-1 rounded-xl px-1.5 py-2 transition-colors duration-100 hover:bg-surface-hover">
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-expanded={expanded}
            aria-label={expanded ? "Tutup sub-tugas" : "Lihat sub-tugas"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink cursor-pointer"
          >
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={CHEVRON_TRANSITION}
              className="inline-flex items-center justify-center"
            >
              <Icon name="chevron_right" size="sm" />
            </motion.span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectTask(task)}
          className="group flex min-w-0 flex-1 items-center justify-between gap-2 px-1 text-left cursor-pointer"
        >
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-display text-[14px] font-bold group-hover:text-primary",
                isDoneRow ? "text-ink-muted line-through" : "text-ink"
              )}
            >
              {task.title}
            </p>
            {!isDoneRow && task.priority === "HIGH" && (
              <span className="font-mono text-[11px] font-bold text-[#E11D48]">
                Prioritas Tinggi
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {hasChildren && (
              <Badge
                variant={doneSubCount === subtasks.length ? "success" : "primary"}
                mono
              >
                {doneSubCount}/{subtasks.length}
              </Badge>
            )}
            {isDoneRow ? (
              <Icon
                name="check_circle"
                size="sm"
                filled
                className="shrink-0 text-[#16A34A]"
              />
            ) : (
              <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
            )}
          </div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={COLLAPSE_TRANSITION}
            className="overflow-hidden"
          >
            <div className="mb-1.5 ml-4 flex flex-col gap-1 border-l-2 border-border-soft pl-3">
              {subtasks.map((sub) => {
                const subStatusMeta = TASK_STATUS_META[sub.status];
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectTask(sub)}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-hover cursor-pointer"
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate font-sans text-[12px] font-semibold group-hover:text-primary",
                        sub.status === "DONE"
                          ? "text-ink-muted line-through"
                          : "text-ink"
                      )}
                    >
                      {sub.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {sub.isArchived && <Badge variant="neutral">Arsip</Badge>}
                      <Badge variant={subStatusMeta.badgeVariant}>
                        {subStatusMeta.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProjectTasksColumn({
  project,
  tasks,
  onQuickAddTask,
  onSelectTask,
}: {
  project: DashboardActiveProject;
  tasks: DashboardTaskItem[];
  onQuickAddTask: (projectId: string, title: string) => void;
  onSelectTask: (task: DashboardTaskItem) => void;
}) {
  const [quickTitle, setQuickTitle] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const subtasksByParent = new Map<string, DashboardTaskItem[]>();
  for (const task of tasks) {
    if (!task.parentId) continue;
    const list = subtasksByParent.get(task.parentId);
    if (list) {
      list.push(task);
    } else {
      subtasksByParent.set(task.parentId, [task]);
    }
  }

  const topLevelTasks = tasks.filter((t) => !t.parentId && !t.isArchived);
  const activeTasks = sortProjectActiveTasks(
    topLevelTasks.filter((t) => t.status !== "DONE")
  );
  const doneTasks = sortTasksBySchedule(
    topLevelTasks.filter((t) => t.status === "DONE")
  );

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickAddTask(project.id, trimmed);
    setQuickTitle("");
  };

  return (
    <Card className="flex w-[280px] shrink-0 flex-col gap-4 rounded-3xl p-5 sm:w-[370px]">
      <Link
        href={`/projects/${project.id}`}
        className="group flex w-full shrink-0 items-center justify-between gap-2 border-b-2 border-border-soft pb-3"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "h-3.5 w-3.5 shrink-0 rounded-full",
              PROJECT_COLOR_DOT[project.color]
            )}
          />
          <h3 className="truncate font-display text-[17px] font-bold leading-6 text-ink group-hover:text-primary">
            {project.name}
          </h3>
          <span className="font-mono text-[12px] font-bold text-ink-muted">
            {activeTasks.length}
          </span>
        </div>
        <Icon
          name="chevron_right"
          size="md"
          className="shrink-0 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2">
        <Input
          aria-label={`Tambah tugas cepat di ${project.name}`}
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Tambah tugas cepat..."
          className="h-10 rounded-xl px-3 py-2 text-[13px]"
        />
        <IconButton
          type="submit"
          variant="primary"
          label={`Simpan tugas cepat di ${project.name}`}
          icon={<Icon name="add" size="sm" />}
          className="h-10 w-10 shrink-0 rounded-xl"
        />
      </form>

      <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto overscroll-contain pr-1">
        <div className="flex shrink-0 flex-col divide-y divide-border-soft">
          {activeTasks.length === 0 ? (
            <p className="py-5 text-center font-sans text-[13px] font-medium text-ink-muted">
              Semua tugas proyek ini sudah beres!
            </p>
          ) : (
            activeTasks.map((task) => (
              <ProjectTaskRowItem
                key={task.id}
                task={task}
                subtasks={sortProjectActiveTasks(
                  subtasksByParent.get(task.id) ?? []
                )}
                expanded={expandedIds.has(task.id)}
                onToggleExpand={() => toggleExpand(task.id)}
                onSelectTask={onSelectTask}
              />
            ))
          )}
        </div>

        {doneTasks.length > 0 && (
          <div className="shrink-0 border-t-2 border-border-soft pt-3">
            <button
              type="button"
              onClick={() => setShowDone((prev) => !prev)}
              aria-expanded={showDone}
              className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 font-display text-[13px] font-bold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <motion.span
                  animate={{ rotate: showDone ? 90 : 0 }}
                  transition={CHEVRON_TRANSITION}
                  className="inline-flex items-center justify-center"
                >
                  <Icon name="chevron_right" size="sm" />
                </motion.span>
                Selesai ({doneTasks.length})
              </span>
              <Badge variant="success">Tuntas</Badge>
            </button>

            <AnimatePresence initial={false}>
              {showDone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={COLLAPSE_TRANSITION}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 flex flex-col divide-y divide-border-soft">
                    {doneTasks.map((task) => (
                      <ProjectTaskRowItem
                        key={task.id}
                        task={task}
                        subtasks={sortProjectActiveTasks(
                          subtasksByParent.get(task.id) ?? []
                        )}
                        expanded={expandedIds.has(task.id)}
                        onToggleExpand={() => toggleExpand(task.id)}
                        onSelectTask={onSelectTask}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}
